import { Router } from 'express';

const authRouter = Router();

// Firebase Authentication is the sole account authority. Keeping this router
// closed prevents the legacy API from creating identities or sessions that
// Firestore cannot verify.
authRouter.use((_req, res) => {
  res.status(410).json({
    success: false,
    error: {
      code: 'LEGACY_AUTH_API_DISABLED',
      message: 'Use Firebase Authentication from the ChickMagnet client.',
    },
  });
});

export default authRouter;
