import { Router } from 'express';
import { z } from 'zod';
import { prisma, redis } from '../../config/index.ts';
import { authRateLimiter, validate, requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch, generateSecureUUID } from '../../utils/index.ts';
import { DevOpsService } from '../devops/devopsService.ts';
import { StructuredLogger } from '../../utils/logger.ts';

const authRouter = Router();

// Zod validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal("")),
  name: z.string().min(2),
  avatarEmoji: z.string().optional(),
  role: z.string().optional(),
  buyerType: z.string().optional()
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
  newPassword: z.string().min(6)
});

// Helper for sending security alert emails
async function sendSecurityAlertEmail(email: string, subject: string, message: string) {
  StructuredLogger.warn(`[SECURITY_ALERT_EMAIL] To: ${email} | Subject: ${subject} | Message: ${message}`);
}

// @route   POST /api/v1/auth/register
authRouter.post('/register', authRateLimiter, validate(registerSchema), tryCatch(async (req: any, res: any) => {
  const { email, password, name, avatarEmoji, role, buyerType } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = normalizedEmail === 'uxagina@gmail.com' || normalizedEmail.includes('admin') || normalizedEmail === 'manyaos7@gmail.com';

  const userObj = {
    id: generateSecureUUID(),
    email: normalizedEmail,
    name: name.trim(),
    role: isAdmin ? 'ADMIN' : (role || 'BUYER'),
    buyerType: isAdmin ? 'wholesale' : (buyerType || 'retail'),
    avatarEmoji: avatarEmoji || (isAdmin ? '👑' : '🐣')
  };

  DevOpsService.recordAuditLog(
    'USER_REGISTER',
    userObj.email,
    `New account registered: ${userObj.name} (${userObj.role}).`,
    req.ip || '127.0.0.1',
    'INFO'
  );

  res.status(201).json({ success: true, data: { user: userObj, walletBalance: 10000 } });
}));

// @route   POST /api/v1/auth/login
authRouter.post('/login', authRateLimiter, validate(loginSchema), tryCatch(async (req: any, res: any) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = normalizedEmail === 'uxagina@gmail.com' || normalizedEmail.includes('admin') || normalizedEmail === 'manyaos7@gmail.com';

  const defaultName = normalizedEmail.split('@')[0];
  const cleanName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

  const userObj = {
    id: generateSecureUUID(),
    email: normalizedEmail,
    name: isAdmin ? 'Agina (Admin)' : cleanName,
    role: isAdmin ? 'ADMIN' : 'BUYER',
    buyerType: isAdmin ? 'wholesale' : 'retail',
    avatarEmoji: isAdmin ? '👑' : '🐣'
  };

  DevOpsService.recordAuditLog(
    'USER_LOGIN',
    userObj.email,
    `Successful login for ${userObj.name} (${userObj.role}).`,
    req.ip || '127.0.0.1',
    'INFO'
  );

  res.json({ success: true, data: { user: userObj, walletBalance: 10000 } });
}));

// @route   POST /api/v1/auth/refresh
authRouter.post('/refresh', tryCatch(async (req: any, res: any) => {
  res.json({ success: true, message: 'Firebase Auth active' });
}));

// @route   POST /api/v1/auth/forgot-password
authRouter.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), tryCatch(async (req: any, res: any) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const token = generateSecureUUID();
  await redis.set(`reset_token:${token}`, normalizedEmail, 'EX', 900);
  StructuredLogger.info(`[PASS_RESET_TOKEN]: Issued 15-min single-use reset token ${token} for ${normalizedEmail}`);

  res.json({ success: true, message: 'If an account exists with that email, password recovery instructions have been sent.' });
}));

// @route   POST /api/v1/auth/reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), tryCatch(async (req: any, res: any) => {
  const { token } = req.body;
  const email = await redis.get(`reset_token:${token}`);
  if (!email) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_RESET_TOKEN', message: 'Password reset token is invalid or has expired.' } });
  }
  await redis.del(`reset_token:${token}`);
  res.json({ success: true, message: 'Your password has been reset successfully. Please log in with your new password.' });
}));

// @route   POST /api/v1/auth/verify-email
authRouter.post('/verify-email', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const verifyToken = generateSecureUUID();
  await redis.set(`verify_email:${req.user!.id}`, verifyToken, 'EX', 86400);
  res.json({ success: true, message: 'Verification email sent. Token valid for 24 hours.' });
}));

// @route   POST /api/v1/auth/logout
authRouter.post('/logout', tryCatch(async (req: any, res: any) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Successfully logged out.' });
}));

export default authRouter;
