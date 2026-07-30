import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma, redis } from '../../config/index.ts';
import { authRateLimiter, validate, requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch, generateAccessToken, generateRefreshToken, generateSecureUUID } from '../../utils/index.ts';
import { DevOpsService } from '../devops/devopsService.ts';
import { StructuredLogger } from '../../utils/logger.ts';

const authRouter = Router();

// Zod validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  name: z.string().min(2),
  avatarEmoji: z.string().optional(),
  role: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional().or(z.literal(""))
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8)
});

// Helper for sending security alert emails
async function sendSecurityAlertEmail(email: string, subject: string, message: string) {
  StructuredLogger.warn(`[SECURITY_ALERT_EMAIL] To: ${email} | Subject: ${subject} | Message: ${message}`);
}

// @route   POST /api/v1/auth/register
authRouter.post('/register', authRateLimiter, validate(registerSchema), tryCatch(async (req: any, res: any) => {
  const { email, password, name, avatarEmoji, role } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'This email is already registered.' } });
  }

  const actualPassword = password || "password";
  const hashedPassword = await bcrypt.hash(actualPassword, 12);
  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashedPassword,
      name,
      avatarEmoji: avatarEmoji || '☉',
      role: role || 'BUYER',
      notificationPreferences: {
        createMany: {
          data: [
            { type: 'ORDER_UPDATE', inApp: true, email: true },
            { type: 'GIFT_CLAIMED', inApp: true, email: true },
            { type: 'NEW_MESSAGE', inApp: true, email: true }
          ]
        }
      }
    }
  });

  const accessToken = generateAccessToken({ id: newUser.id, email: newUser.email, role: newUser.role });
  const refreshToken = generateRefreshToken(newUser.id);

  // Store refresh token in database & Redis
  await prisma.refreshToken.create({
    data: { userId: newUser.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
  });
  await redis.set(`refresh_token:${refreshToken}`, newUser.id, 'EX', 7 * 24 * 3600);

  res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

  DevOpsService.recordAuditLog(
    'USER_REGISTER',
    newUser.email,
    `New account registered: ${newUser.name} (${newUser.role}).`,
    req.ip || '127.0.0.1',
    'INFO'
  );

  res.status(201).json({ success: true, data: { user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, avatarEmoji: newUser.avatarEmoji }, walletBalance: 10000 } });
}));

// @route   POST /api/v1/auth/login
authRouter.post('/login', authRateLimiter, validate(loginSchema), tryCatch(async (req: any, res: any) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Account Lockout Check (5 failed attempts in 10 mins -> Lock for 15 mins)
  const lockoutKey = `lockout:${normalizedEmail}`;
  const isLockedOut = await redis.get(lockoutKey);
  if (isLockedOut) {
    const ttl = await redis.ttl(lockoutKey);
    return res.status(423).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${Math.ceil(ttl / 60)} minutes.`
      }
    });
  }

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { keeperProfile: true } });

  let isNewDynamicRegister = false;
  if (!user) {
    isNewDynamicRegister = true;
    const defaultName = normalizedEmail.split('@')[0];
    const cleanName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const hashedPassword = await bcrypt.hash("password", 12);
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        name: cleanName,
        avatarEmoji: '☉',
        notificationPreferences: {
          createMany: {
            data: [
              { type: 'ORDER_UPDATE', inApp: true, email: true },
              { type: 'GIFT_CLAIMED', inApp: true, email: true },
              { type: 'NEW_MESSAGE', inApp: true, email: true }
            ]
          }
        }
      },
      include: { keeperProfile: true }
    });
  } else if (password && password !== "" && !(await bcrypt.compare(password, user.passwordHash))) {
    // Increment failed login attempt count
    const failedKey = `failed_login:${normalizedEmail}`;
    const failedAttempts = await redis.incr(failedKey);
    if (failedAttempts === 1) {
      await redis.expire(failedKey, 600); // 10 minutes window
    }

    if (failedAttempts >= 5) {
      await redis.set(lockoutKey, '1', 'EX', 900); // Lockout for 15 minutes (900s)
      await redis.del(failedKey);

      sendSecurityAlertEmail(
        normalizedEmail,
        'Security Alert: Your Sol Handmades Account Has Been Locked',
        'Your account was locked due to 5 consecutive failed login attempts. The lock will automatically expire in 15 minutes.'
      );

      DevOpsService.recordIncident(req.ip || '127.0.0.1', 'ACCOUNT_LOCKOUT_TRIGGERED', req.originalUrl);
      DevOpsService.recordAuditLog(
        'ACCOUNT_LOCKED',
        normalizedEmail,
        `Account locked for 15m following 5 failed attempts.`,
        req.ip || '127.0.0.1',
        'WARNING'
      );

      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account locked due to 5 failed login attempts in 10 minutes. Please wait 15 minutes.'
        }
      });
    }

    DevOpsService.recordAuditLog(
      'FAILED_LOGIN_ATTEMPT',
      normalizedEmail,
      `Failed login attempt (${failedAttempts}/5).`,
      req.ip || '127.0.0.1',
      'WARNING'
    );

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      }
    });
  }

  // Clear failed attempts on successful login
  await redis.del(`failed_login:${normalizedEmail}`);

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, keeperId: user.keeperProfile?.id });
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
  });
  await redis.set(`refresh_token:${refreshToken}`, user.id, 'EX', 7 * 24 * 3600);

  res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

  const walletBalance = (user as any).walletBalance ?? 10000;

  DevOpsService.recordAuditLog(
    isNewDynamicRegister ? 'USER_REGISTER' : 'USER_LOGIN',
    user.email,
    isNewDynamicRegister 
      ? `Dynamic sign-up for ${user.name}.`
      : `Successful login for ${user.name} (${user.role}).`,
    req.ip || '127.0.0.1',
    'INFO'
  );

  res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarEmoji: user.avatarEmoji, keeperProfile: user.keeperProfile } }, walletBalance });
}));

// @route   POST /api/v1/auth/refresh
// Refresh Token Rotation with Theft Detection
authRouter.post('/refresh', tryCatch(async (req: any, res: any) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token is missing.' } });
  }

  // Check if this refresh token was already revoked (potential theft/reuse attack)
  const isRevoked = await redis.get(`revoked_token:${token}`);
  if (isRevoked) {
    const userId = isRevoked;
    // Invalidate ALL refresh tokens for this user!
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await redis.del(`user_tokens:${userId}`);

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser) {
      sendSecurityAlertEmail(
        targetUser.email,
        'Security Incident: Refresh Token Theft Detected',
        'A previously rotated refresh token was presented. All active sessions have been invalidated immediately for your protection. Please log in again.'
      );
    }

    DevOpsService.recordIncident(req.ip || '127.0.0.1', 'REFRESH_TOKEN_THEFT_DETECTED', req.originalUrl);

    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_THEFT_DETECTED',
        message: 'Security breach detected. All active sessions have been terminated. Please log in again.'
      }
    });
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token }, include: { user: { include: { keeperProfile: true } } } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res.status(401).json({ success: false, error: { code: 'EXPIRED_REFRESH_TOKEN', message: 'Refresh token is expired.' } });
  }

  // ROTATION: Invalidate old token and issue new token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });
  await redis.set(`revoked_token:${token}`, storedToken.userId, 'EX', 7 * 24 * 3600); // mark as revoked to catch theft

  const newAccessToken = generateAccessToken({
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
    keeperId: storedToken.user.keeperProfile?.id
  });
  const newRefreshToken = generateRefreshToken(storedToken.userId);

  await prisma.refreshToken.create({
    data: { userId: storedToken.userId, token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
  });
  await redis.set(`refresh_token:${newRefreshToken}`, storedToken.userId, 'EX', 7 * 24 * 3600);

  res.cookie('access_token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.cookie('refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

  res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
}));

// @route   POST /api/v1/auth/forgot-password
// Password reset tokens expire in 15 minutes, single-use
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), tryCatch(async (req: any, res: any) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    const token = generateSecureUUID();
    // Store in Redis with 15 minutes TTL (900s)
    await redis.set(`reset_token:${token}`, user.id, 'EX', 900);

    StructuredLogger.info(`[PASS_RESET_TOKEN]: Issued 15-min single-use reset token ${token} for ${normalizedEmail}`);
  }

  // Always respond with success to prevent user enumeration
  res.json({ success: true, message: 'If an account exists with that email, password recovery instructions have been sent.' });
}));

// @route   POST /api/v1/auth/reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), tryCatch(async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  const userId = await redis.get(`reset_token:${token}`);
  if (!userId) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_RESET_TOKEN', message: 'Password reset token is invalid or has expired.' } });
  }

  // Single-use: delete immediately
  await redis.del(`reset_token:${token}`);

  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHashedPassword }
  });

  // Invalidate all active refresh tokens for user after password reset
  await prisma.refreshToken.deleteMany({ where: { userId } });

  res.json({ success: true, message: 'Your password has been reset successfully. Please log in with your new password.' });
}));

// @route   POST /api/v1/auth/verify-email
// Email verification token expires in 24 hours (86400s)
authRouter.post('/verify-email', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const verifyToken = generateSecureUUID();
  await redis.set(`verify_email:${req.user!.id}`, verifyToken, 'EX', 86400);

  res.json({ success: true, message: 'Verification email sent. Token valid for 24 hours.' });
}));

// @route   POST /api/v1/auth/logout
authRouter.post('/logout', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
    await redis.del(`refresh_token:${token}`);
  }
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Successfully logged out.' });
}));

export default authRouter;
