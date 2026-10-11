import { Router } from 'express';

const ordersRouter = Router();

// Orders are persisted through Firebase Auth and owner-scoped Firestore rules.
// This legacy Prisma router cannot verify Firebase identity, so it must remain
// unavailable even if it is mounted again later.
ordersRouter.use((_req, res) => {
  res.status(410).json({
    success: false,
    error: {
      code: 'LEGACY_ORDER_API_DISABLED',
      message: 'Use the authenticated Firestore order flow.',
    },
  });
});

export default ordersRouter;
