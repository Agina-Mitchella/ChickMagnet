import { Router } from 'express';
import { prisma, redis, getStripe } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles, paymentRateLimiter } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';
import { StructuredLogger } from '../../utils/logger.ts';

const paymentsRouter = Router();

// Apply payment rate limiter (10 req/min)
paymentsRouter.use(paymentRateLimiter);

// @route   POST /api/v1/payments/webhook
// Stripe Webhook handler with signature verification & idempotent event handling
paymentsRouter.post('/webhook', tryCatch(async (req: any, res: any) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: any;

  try {
    if (process.env.NODE_ENV === 'production' || webhookSecret) {
      if (!sig) {
        StructuredLogger.warn('[STRIPE_WEBHOOK] Missing Stripe signature header');
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      // Verify signature with raw payload
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      StructuredLogger.info(`[STRIPE_WEBHOOK_VERIFIED] Event verified: ${event.type} (${event.id})`);
    } else {
      // Development fallback
      event = req.body;
      StructuredLogger.info(`[STRIPE_WEBHOOK_DEV] Event received (dev mode): ${event.type}`);
    }
  } catch (err: any) {
    StructuredLogger.error(`[STRIPE_WEBHOOK_VERIFICATION_FAILED] Error: ${err.message}`, err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check using Redis
  const eventId = event.id || `evt_fallback_${Date.now()}`;
  const isProcessed = await redis.get(`stripe_processed_event:${eventId}`);
  if (isProcessed) {
    StructuredLogger.info(`[STRIPE_WEBHOOK_DUPLICATE_SKIPPED] Event ${eventId} already processed.`);
    return res.json({ received: true, status: 'duplicate_skipped' });
  }

  // Mark event as processed in Redis (TTL: 30 days = 2592000s)
  await redis.set(`stripe_processed_event:${eventId}`, '1', 'EX', 2592000);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: 'PREPARING' }
      });
      StructuredLogger.info(`[STRIPE_PAYMENT_SUCCESS] Order status updated for intent ${intent.id}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: 'CANCELLED' }
      });
      StructuredLogger.warn(`[STRIPE_PAYMENT_FAILED] Order cancelled for intent ${intent.id}`);
      break;
    }
    default:
      StructuredLogger.info(`[STRIPE_WEBHOOK_UNHANDLED_EVENT] ${event.type}`);
  }

  res.json({ received: true });
}));

// @route   POST /api/v1/payments/connect/onboard
paymentsRouter.post('/connect/onboard', requireAuth, requireRoles('KEEPER'), tryCatch(async (req: AuthRequest, res: any) => {
  const stripe = getStripe();
  const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!maker) return res.status(404).json({ success: false, error: { message: 'Profile not found.' } });

  const account = await stripe.accounts.create({ type: 'express' });
  
  await prisma.keeperProfile.update({
    where: { id: maker.id },
    data: { stripeAccountId: account.id }
  });

  res.json({
    success: true,
    data: {
      accountId: account.id,
      onboardingUrl: `https://connect.stripe.com/express/oauth/authorize?client_id=${account.id}`
    }
  });
}));

// @route   GET /api/v1/payments/me/payouts
paymentsRouter.get('/me/payouts', requireAuth, requireRoles('KEEPER'), tryCatch(async (req: AuthRequest, res: any) => {
  const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!maker) return res.status(404).json({ success: false, error: { message: 'Profile not found.' } });

  const payouts = await prisma.payout.findMany({
    where: { keeperId: maker.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: payouts });
}));

export default paymentsRouter;
