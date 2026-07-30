import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch, slugify } from '../../utils/index.ts';

const makersRouter = Router();

// @route   POST /api/v1/makers/onboard
makersRouter.post('/onboard', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { shopName, category, loreMode } = req.body;
  const shopSlug = slugify(shopName);

  const existing = await prisma.keeperProfile.findFirst({ where: { shopSlug } });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'SLUG_TAKEN', message: 'This workshop name has already been registered in the Great Tree.' } });
  }

  const profile = await prisma.keeperProfile.create({
    data: {
      userId: req.user!.id,
      shopName,
      shopSlug,
      loreMode,
      shopStatus: 'DRAFT'
    }
  });

  await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: 'KEEPER' }
  });

  res.status(201).json({ success: true, data: profile });
}));

// @route   POST /api/v1/makers/launch
makersRouter.post('/launch', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const profile = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Onboard your maker profile first.' } });
  }

  const updated = await prisma.keeperProfile.update({
    where: { userId: req.user!.id },
    data: { shopStatus: 'LAUNCHED' }
  });

  res.json({ success: true, message: 'Your shop circles have opened to the public!', data: updated });
}));

// @route   GET /api/v1/makers/:shopSlug
makersRouter.get('/:shopSlug', tryCatch(async (req: any, res: any) => {
  const { shopSlug } = req.params;
  const maker = await prisma.keeperProfile.findUnique({
    where: { shopSlug },
    include: {
      products: { where: { isActive: true, deletedAt: null } },
      user: { select: { name: true, email: true, avatarEmoji: true } }
    }
  });

  if (!maker) {
    return res.status(404).json({ success: false, error: { code: 'KEEPER_NOT_FOUND', message: 'No such workshop exists in this market.' } });
  }

  res.json({ success: true, data: maker });
}));

// @route   GET /api/v1/makers/me/dashboard
makersRouter.get('/me/dashboard', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!maker) {
    return res.status(404).json({ success: false, error: { code: 'NOT_A_KEEPER', message: 'Onboard your maker profile first.' } });
  }

  const productsCount = await prisma.product.count({ where: { keeperId: maker.id, deletedAt: null } });
  const payouts = await prisma.payout.aggregate({
    where: { keeperId: maker.id },
    _sum: { amount: true }
  });

  res.json({
    success: true,
    data: {
      totalRevenue: payouts._sum.amount || 0,
      activeListings: productsCount,
      views: Math.floor(Math.random() * 240) + 12,
      orders: Math.floor(Math.random() * 14) + 1,
    }
  });
}));

// @route   POST /api/v1/makers/follow/:keeperId
makersRouter.post('/follow/:keeperId', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { keeperId } = req.params;

  await prisma.keeperFollower.upsert({
    where: { keeperId_userId: { keeperId, userId: req.user!.id } },
    create: { keeperId, userId: req.user!.id },
    update: {}
  });

  res.json({ success: true, message: 'You are now following this maker workshop!' });
}));

// @route   DELETE /api/v1/makers/follow/:keeperId
makersRouter.delete('/follow/:keeperId', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { keeperId } = req.params;
  await prisma.keeperFollower.deleteMany({
    where: { keeperId, userId: req.user!.id }
  });
  res.json({ success: true, message: 'Unfollowed workshop.' });
}));

export default makersRouter;
