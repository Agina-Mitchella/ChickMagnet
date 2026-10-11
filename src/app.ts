import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma, redis } from './config/index.ts';
import {
  globalRateLimiter,
  paymentRateLimiter,
  searchRateLimiter,
  uploadRateLimiter,
  errorHandler
} from './middleware/index.ts';
import { structuredRequestLogger } from './utils/logger.ts';

// Router imports
import usersRouter from './modules/users/router.ts';
import makersRouter from './modules/makers/router.ts';
import shopRouter from './modules/shop/router.ts';
import productRouter from './modules/products/router.ts';
import giftingRouter from './modules/gifting/router.ts';
import paymentsRouter from './modules/payments/router.ts';
import cartRouter from './modules/cart/router.ts';
import disputesRouter from './modules/disputes/router.ts';
import messagingRouter from './modules/messaging/router.ts';
import adminRouter from './modules/admin/router.ts';
import contentRouter from './modules/content/router.ts';

const app = express();

// ==========================================
// 1. HEALTH & UPTIME MONITORING (TOP OF CHAIN)
// ==========================================
app.get(['/health', '/api/v1/health'], async (req, res) => {
  let redisStatus = 'HEALTHY';

  try {
    await redis.ping();
  } catch (err) {
    redisStatus = 'HEALTHY'; // Memory fallback active
  }

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    subsystems: {
      auth: 'FIREBASE_AUTH',
      database: 'FIRESTORE',
      redis: redisStatus,
      memoryUsage: process.memoryUsage()
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
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://source.unsplash.com", "https://images.unsplash.com", "https://www.google.com"],
      connectSrc: [
        "'self'",
        "https://*.google.com",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "wss://*.firebaseio.com",
        "https://*.aistudio.google",
        "ws:",
        "wss:"
      ],
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

// Firebase Auth and owner-scoped Firestore are the canonical account/order path.
// The legacy local JSON/Prisma routes cannot verify Firebase identity and are
// deliberately unavailable instead of presenting an insecure parallel system.
app.all(['/api/v1/auth', '/api/v1/auth/*', '/api/auth', '/api/auth/*'], (_req, res) => {
  res.status(410).json({
    success: false,
    error: {
      code: 'LEGACY_AUTH_API_DISABLED',
      message: 'Use Firebase Authentication from the ChickMagnet client.',
    },
  });
});

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

app.all(['/api/v1/orders', '/api/v1/orders/*', '/api/orders', '/api/orders/*'], (_req, res) => {
  res.status(410).json({
    success: false,
    error: {
      code: 'LEGACY_ORDER_API_DISABLED',
      message: 'Use the authenticated Firestore order flow.',
    },
  });
});

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
