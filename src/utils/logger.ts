import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface LogEntry {
  timestamp?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  message?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  details?: Record<string, unknown>;
}

// Sensitive fields to redact
const REDACT_KEYS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'cardNumber',
  'creditCard',
  'cvv',
  'secret',
  'authorization',
  'cookie'
];

function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (REDACT_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      clean[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      clean[key] = sanitizeObject(obj[key]);
    } else {
      clean[key] = obj[key];
    }
  }
  return clean;
}

export class StructuredLogger {
  private static formatLog(entry: LogEntry): string {
    const formatted: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    if (formatted.details) {
      formatted.details = sanitizeObject(formatted.details);
    }
    return JSON.stringify(formatted);
  }

  static info(message: string, context: Partial<LogEntry> = {}) {
    console.log(this.formatLog({ level: 'info', message, ...context }));
  }

  static warn(message: string, context: Partial<LogEntry> = {}) {
    console.warn(this.formatLog({ level: 'warn', message, ...context }));
  }

  static error(message: string, err?: Error | unknown, context: Partial<LogEntry> = {}) {
    const errorDetails = err instanceof Error ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : undefined;

    console.error(this.formatLog({
      level: 'error',
      message,
      error: errorDetails,
      ...context
    }));
  }

  static slowRequest(method: string, path: string, durationMs: number, requestId: string, statusCode: number) {
    this.warn(`[SLOW API RESPONSE] Request to ${method} ${path} took ${durationMs}ms`, {
      requestId,
      method,
      path,
      statusCode,
      duration: durationMs,
      details: { slowThresholdMs: 2000 }
    });
  }
}

// Request ID & Performance Monitoring Middleware
export function structuredRequestLogger(req: Request & { requestId?: string; user?: any }, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || `req_${crypto.randomUUID().slice(0, 12)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id;

    // Log request summary
    StructuredLogger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      requestId,
      userId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });

    // Slow API Response Warning (> 2000ms)
    if (duration > 2000) {
      StructuredLogger.slowRequest(req.method, req.path, duration, requestId, res.statusCode);
    }
  });

  next();
}
