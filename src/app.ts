import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma, redis } from './config/index.ts';
import {
  globalRateLimiter,
  authRateLimiter,
  paymentRateLimiter,
  searchRateLimiter,
  uploadRateLimiter,
  errorHandler
} from './middleware/index.ts';
import { structuredRequestLogger } from './utils/logger.ts';

// Router imports
import authRouter from './modules/auth/router.ts';
import usersRouter from './modules/users/router.ts';
import makersRouter from './modules/makers/router.ts';
import shopRouter from './modules/shop/router.ts';
import productRouter from './modules/products/router.ts';
import ordersRouter from './modules/orders/router.ts';
import giftingRouter from './modules/gifting/router.ts';
import paymentsRouter from './modules/payments/router.ts';
import cartRouter from './modules/cart/router.ts';
import disputesRouter from './modules/disputes/router.ts';
import messagingRouter from './modules/messaging/router.ts';
import adminRouter from './modules/admin/router.ts';
import contentRouter from './modules/content/router.ts';

import { getMongoDBStatus, connectMongoDB } from './db/mongodb.ts';

const app = express();

// ==========================================
// 1. HEALTH & UPTIME MONITORING (TOP OF CHAIN)
// ==========================================
app.get(['/health', '/api/v1/health'], async (req, res) => {
  let dbStatus = 'HEALTHY';
  let redisStatus = 'HEALTHY';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'UNHEALTHY';
  }

  try {
    await redis.ping();
  } catch (err) {
    redisStatus = 'UNHEALTHY';
  }

  const mongoStatus = getMongoDBStatus();

  const isHealthy = dbStatus === 'HEALTHY' && redisStatus === 'HEALTHY';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    subsystems: {
      database: dbStatus,
      redis: redisStatus,
      mongodb: mongoStatus.connected ? 'HEALTHY' : (mongoStatus.uriConfigured ? 'DISCONNECTED' : 'NOT_CONFIGURED'),
      memoryUsage: process.memoryUsage()
    }
  });
});

app.get(['/api/mongodb/status', '/api/v1/mongodb/status'], async (req, res) => {
  const status = getMongoDBStatus();
  if (!status.connected) {
    await connectMongoDB();
  }
  const updatedStatus = getMongoDBStatus();
  res.json({
    success: true,
    data: {
      connected: updatedStatus.connected,
      uriConfigured: updatedStatus.uriConfigured,
      readyState: updatedStatus.readyState,
      message: updatedStatus.connected 
        ? 'MongoDB is connected and operational.' 
        : 'MongoDB is offline or MONGODB_URI is not set. Using hybrid storage fallback.'
    }
  });
});

// ==========================================
// 2. HTTP SECURITY HEADERS (HELMET)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https://source.unsplash.com", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.google.com", "https://*.aistudio.google", "ws:", "wss:"],
      frameAncestors: ["'self'", "https://*.aistudio.google", "https://*.google.com", "https://*.run.app"]
    }
  },
  xFrameOptions: false,
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ==========================================
// 3. STRICT CORS CONFIGURATION (NO WILDCARD)
// ==========================================
const ALLOWED_ORIGINS = [
  'https://chickmagnet.app',
  'https://your-custom-domain.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server) or listed origins or AI Studio previews
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.aistudio.google') || origin.endsWith('.google.com') || origin.endsWith('.run.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed by policy.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
}));

// ==========================================
// 4. COOKIE & BODY PARSERS & STRUCTURED LOGGER
// ==========================================
app.use(cookieParser());
app.use(structuredRequestLogger);

// Body limit protection against DDoS/Memory exhaustion
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global default rate limiter
app.use(globalRateLimiter);

// ==========================================
// 5. ROUTE MOUNTING WITH SPECIFIC RATE LIMITERS
// ==========================================

// Auth routes (5 req/min)
app.use('/api/v1/auth', authRateLimiter, authRouter);
app.use('/api/auth', authRateLimiter, authRouter);

// Payment routes (10 req/min)
app.use('/api/v1/payments', paymentRateLimiter, paymentsRouter);
app.use('/api/payments', paymentRateLimiter, paymentsRouter);

// Search & Product routes (30 req/min for search endpoints)
app.use('/api/v1/products', searchRateLimiter, productRouter);
app.use('/api/products', searchRateLimiter, productRouter);

// Upload routes (20 req/min)
app.use('/api/v1/upload', uploadRateLimiter, (req, res) => res.json({ success: true, message: "Upload handler" }));

// Standard domain routes
app.use('/api/v1/users', usersRouter);
app.use('/api/users', usersRouter);

app.use('/api/v1/makers', makersRouter);
app.use('/api/makers', makersRouter);

app.use('/api/v1/shop', shopRouter);
app.use('/api/shop', shopRouter);

app.use('/api/v1/orders', ordersRouter);
app.use('/api/orders', ordersRouter);

app.use('/api/v1/gifts', giftingRouter);
app.use('/api/gifts', giftingRouter);

app.use('/api/v1/cart', cartRouter);
app.use('/api/cart', cartRouter);

app.use('/api/v1/disputes', disputesRouter);
app.use('/api/disputes', disputesRouter);

app.use('/api/v1/messages', messagingRouter);
app.use('/api/messages', messagingRouter);

app.use('/api/v1/admin', adminRouter);
app.use('/api/admin', adminRouter);

app.use('/api/v1/content', contentRouter);
app.use('/api/content', contentRouter);

let maintenanceConfig = { isMaintenance: false, message: "System rejuvenation in progress." };
app.get(['/api/maintenance', '/api/v1/maintenance'], (req, res) => {
  res.json({ success: true, data: maintenanceConfig });
});
app.post(['/api/maintenance', '/api/v1/maintenance'], (req, res) => {
  maintenanceConfig = { ...maintenanceConfig, ...req.body };
  res.json({ success: true, data: maintenanceConfig });
});

// ==========================================
// 6. FALLBACK & CENTRAL ERROR BOUNDARY
// ==========================================
app.use(['/api', '/api/*'], (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route was not found.'
    }
  });
});

app.use(errorHandler);

export default app;
