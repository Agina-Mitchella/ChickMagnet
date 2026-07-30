import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, validate } from '../../middleware/index.ts';
import { tryCatch, generateSecureUUID } from '../../utils/index.ts';

const usersRouter = Router();

// @route   GET /api/v1/users/me
usersRouter.get('/me', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { keeperProfile: true, notificationPreferences: true }
  });
  res.json({ success: true, data: user });
}));

// @route   PATCH /api/v1/users/me
usersRouter.patch('/me', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { name, avatarEmoji } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, avatarEmoji }
  });
  res.json({ success: true, data: updatedUser });
}));

// @route   GET /api/v1/users/me/addresses
usersRouter.get('/me/addresses', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id }
  });
  res.json({ success: true, data: addresses });
}));

// @route   POST /api/v1/users/me/addresses (Max 5 enforced)
usersRouter.post('/me/addresses', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { fullName, line1, line2, city, postalCode, country, isDefault } = req.body;
  
  const count = await prisma.address.count({ where: { userId: req.user!.id } });
  if (count >= 5) {
    return res.status(400).json({ success: false, error: { code: 'MAX_ADDRESSES_REACHED', message: 'You have claimed the maximum amount of postal circles (5).' } });
  }

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user!.id,
      fullName,
      line1,
      line2,
      city,
      postalCode,
      country,
      isDefault: isDefault || count === 0
    }
  });

  res.status(201).json({ success: true, data: address });
}));

// @route   DELETE /api/v1/users/me/addresses/:id
usersRouter.delete('/me/addresses/:id', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
  
  if (!address) {
    return res.status(404).json({ success: false, error: { code: 'ADDRESS_NOT_FOUND', message: 'This address is not in our logs.' } });
  }

  await prisma.address.delete({ where: { id } });

  // Re-assign default if needed
  if (address.isDefault) {
    const fallback = await prisma.address.findFirst({ where: { userId: req.user!.id } });
    if (fallback) {
      await prisma.address.update({ where: { id: fallback.id }, data: { isDefault: true } });
    }
  }

  res.json({ success: true, message: 'Address removed successfully.' });
}));

// @route   GET /api/v1/users/me/wishlist
usersRouter.get('/me/wishlist', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: { product: true }
  });
  res.json({ success: true, data: wishlist });
}));

// @route   POST /api/v1/users/me/wishlist/:productId
usersRouter.post('/me/wishlist/:productId', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { productId } = req.params;

  const exists = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: req.user!.id, productId } }
  });

  if (!exists) {
    await prisma.wishlist.create({
      data: { userId: req.user!.id, productId }
    });
  }

  res.json({ success: true, message: 'Added item to starlight wishlist.' });
}));

// @route   DELETE /api/v1/users/me/wishlist/:productId
usersRouter.delete('/me/wishlist/:productId', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { productId } = req.params;
  await prisma.wishlist.deleteMany({
    where: { userId: req.user!.id, productId }
  });
  res.json({ success: true, message: 'Removed item from wishlist.' });
}));

// @route   GET /api/v1/users/me/gathering-stats
usersRouter.get('/me/gathering-stats', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const ordersCount = await prisma.order.count({ where: { buyerId: req.user!.id } });
  const totalSpend = await prisma.order.aggregate({
    where: { buyerId: req.user!.id },
    _sum: { total: true }
  });

  const wishlistsCount = await prisma.wishlist.count({ where: { userId: req.user!.id } });
  const followedMakersCount = await prisma.keeperFollower.count({ where: { userId: req.user!.id } });

  res.json({
    success: true,
    data: {
      ordersCount,
      totalSpend: totalSpend._sum.total || 0,
      wishlistsCount,
      followedMakersCount,
      gatheringTier: ordersCount > 10 ? 'High Elder' : (ordersCount > 3 ? 'Respected Buyer' : 'Market Sprite')
    }
  });
}));

export default usersRouter;
