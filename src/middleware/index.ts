import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { redis } from '../config/index.ts';
import { DevOpsService } from '../modules/devops/devopsService.ts';
import { StructuredLogger } from '../utils/logger.ts';

// --------------------------------------------------
// CUSTOM ERROR CLASSES
// --------------------------------------------------
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(code, 404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(code, 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Permission denied', code = 'FORBIDDEN') {
    super(code, 403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super('VALIDATION_ERROR', 400, message, details);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, code = 'PAYMENT_FAILED') {
    super(code, 402, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT') {
    super(code, 409, message);
  }
}

// --------------------------------------------------
// REDIS-BACKED SPECIFIC RATE LIMITERS
// --------------------------------------------------
export function createRateLimiter(limit: number, windowSeconds: number, category: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        return next();
      }
      const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
      const key = `ratelimit:${category}:${ip}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > limit) {
        DevOpsService.recordIncident(ip, `RATE_LIMIT_EXCEEDED_${category.toUpperCase()}`, req.originalUrl || req.path);
        
        // Return required 429 response body format
        return res.status(429).json({
          error: "Too many requests. Please wait before trying again.",
          retryAfter: windowSeconds
        });
      }

      next();
    } catch (err) {
      // Fallback on Redis failure to maintain availability
      next();
    }
  };
}

// Configured per spec requirements:
export const globalRateLimiter = createRateLimiter(100, 60, 'global');
export const authRateLimiter = createRateLimiter(5, 60, 'auth');
export const paymentRateLimiter = createRateLimiter(10, 60, 'payment');
export const searchRateLimiter = createRateLimiter(30, 60, 'search');
export const uploadRateLimiter = createRateLimiter(20, 60, 'upload');

// --------------------------------------------------
// AUTHENTICATION & ROLE MIDDLEWARES
// --------------------------------------------------
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'STAFF' | 'BUYER' | 'KEEPER';
    keeperId?: string;
  };
  requestId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  throw new UnauthorizedError(
    'Legacy Express authentication is disabled. Use Firebase Authentication and Firestore security rules.',
    'LEGACY_AUTH_DISABLED'
  );
}

export function requireRoles(...roles: ('ADMIN' | 'STAFF' | 'BUYER' | 'KEEPER')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource.', 'INSUFFICIENT_PERMISSIONS');
    }
    next();
  };
}

// --------------------------------------------------
// INPUT VALIDATION MIDDLEWARE (ZOD)
// --------------------------------------------------
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      next(new ValidationError('Input validation failed', err.errors));
    }
  };
}

// --------------------------------------------------
// GLOBAL ERROR HANDLER & SENTRY INTEGRATION
// --------------------------------------------------
export function errorHandler(err: any, req: Request & { requestId?: string; user?: any }, res: Response, next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred. Please try again.';
  const details = err instanceof AppError ? err.details : undefined;

  StructuredLogger.error(`[ERROR_HANDLER] ${errorCode} - ${message}`, err, {
    requestId: req.requestId,
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    statusCode
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {})
    }
  });
}
