import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch, generateSecureUUID } from '../../utils/index.ts';

const giftingRouter = Router();

// @route   GET /api/v1/gifts
giftingRouter.get('/', tryCatch(async (req: any, res: any) => {
  const gifts = await prisma.giftLink.findMany({
    include: { order: { include: { items: { include: { product: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: gifts });
}));

// @route   POST /api/v1/gifts
giftingRouter.post('/', tryCatch(async (req: any, res: any) => {
  const { orderId, recipientEmail, recipientPhone, senderName, personalMessage, wrappingStyle } = req.body;

  const token = generateSecureUUID();
  const giftLink = await prisma.giftLink.create({
    data: {
      orderId,
      token,
      recipientEmail,
      recipientPhone,
      senderName,
      personalMessage,
      wrappingStyle,
      expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000), // 90 days expiry
      status: 'SEALED'
    }
  });

  res.status(201).json({ success: true, data: giftLink });
}));

// @route   GET /api/v1/gifts/:idOrCode
giftingRouter.get('/:idOrCode', tryCatch(async (req: any, res: any) => {
  const { idOrCode } = req.params;
  const gift = await prisma.giftLink.findFirst({
    where: { OR: [{ id: idOrCode }, { token: idOrCode }] },
    include: { order: { include: { items: { include: { product: true } } } } }
  });

  if (!gift) {
    return res.status(404).json({ success: false, error: { code: 'GIFT_NOT_FOUND', message: 'No such gift registered in our circle.' } });
  }

  // Sanitized data for claim view
  const sanitizedGift = {
    id: gift.id,
    token: gift.token,
    senderName: gift.senderName,
    personalMessage: gift.personalMessage,
    wrappingStyle: gift.wrappingStyle,
    scentType: gift.scentType,
    status: gift.status,
    items: gift.order.items.map(item => ({
      id: item.product.id,
      title: item.product.title,
      images: item.product.images
    }))
  };

  res.json({ success: true, data: sanitizedGift });
}));

// @route   POST /api/v1/gifts/:idOrCode/claim
giftingRouter.post('/:idOrCode/claim', tryCatch(async (req: any, res: any) => {
  const { idOrCode } = req.params;
  const fullName = req.body.claimantName || req.body.fullName || 'Gift Recipient';
  const line1 = req.body.line1 || 'Sylvan Retreat';
  const line2 = req.body.line2 || '';
  const city = req.body.city || 'Woodland Market';
  const postalCode = req.body.postalCode || '00100';
  const country = req.body.country || 'Sylvan Kingdom';

  const gift = await prisma.giftLink.findFirst({
    where: { OR: [{ id: idOrCode }, { token: idOrCode }] }
  });

  if (!gift || gift.status !== 'SEALED') {
    return res.status(400).json({ success: false, error: { code: 'GIFT_UNAVAILABLE', message: 'Gift is invalid, already unsealed, or expired.' } });
  }

  const updatedGift = await prisma.giftLink.update({
    where: { id: gift.id },
    data: {
      status: 'CLAIMED',
      claimedAt: new Date(),
      deliveryAddress: { fullName, line1, line2, city, postalCode, country }
    }
  });

  // Update order status to preparing
  await prisma.order.update({
    where: { id: gift.orderId },
    data: { status: 'PREPARING' }
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: gift.orderId, status: 'PREPARING', note: 'Gift claimed by recipient. Crafting sequence triggered!' }
  });

  res.json({ success: true, message: 'Gift successfully unsealed and claimed!', data: updatedGift });
}));

// @route   GET /api/v1/gifts/claim/:token
giftingRouter.get('/claim/:token', tryCatch(async (req: any, res: any) => {
  const { token } = req.params;
  const gift = await prisma.giftLink.findUnique({
    where: { token },
    include: { order: { include: { items: { include: { product: true } } } } }
  });

  if (!gift) {
    return res.status(404).json({ success: false, error: { code: 'GIFT_NOT_FOUND', message: 'No such gift registered in our circle.' } });
  }

  if (gift.status === 'CLAIMED') {
    return res.status(400).json({ success: false, error: { code: 'GIFT_ALREADY_CLAIMED', message: 'This warm gift has already been unsealed!' } });
  }

  if (gift.expiresAt < new Date()) {
    return res.status(400).json({ success: false, error: { code: 'GIFT_EXPIRED', message: 'This gift seal has decayed over time (expired).' } });
  }

  // Sanitized data (hiding billing and original pricing for magic aura)
  const sanitizedGift = {
    id: gift.id,
    senderName: gift.senderName,
    personalMessage: gift.personalMessage,
    wrappingStyle: gift.wrappingStyle,
    scentType: gift.scentType,
    items: gift.order.items.map(item => ({
      title: item.product.title,
      images: item.product.images
    }))
  };

  res.json({ success: true, data: sanitizedGift });
}));

// @route   POST /api/v1/gifts/claim/:token
giftingRouter.post('/claim/:token', tryCatch(async (req: any, res: any) => {
  const { token } = req.params;
  const { fullName, line1, line2, city, postalCode, country } = req.body;

  const gift = await prisma.giftLink.findUnique({ where: { token } });
  if (!gift || gift.status !== 'SEALED') {
    return res.status(400).json({ success: false, error: { code: 'GIFT_UNAVAILABLE', message: 'Gift is invalid, already unsealed, or expired.' } });
  }

  const updatedGift = await prisma.giftLink.update({
    where: { token },
    data: {
      status: 'CLAIMED',
      claimedAt: new Date(),
      deliveryAddress: { fullName, line1, line2, city, postalCode, country }
    }
  });

  // Update order status to prepping
  await prisma.order.update({
    where: { id: gift.orderId },
    data: { status: 'PREPARING' }
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: gift.orderId, status: 'PREPARING', note: 'Gift claimed by recipient. Crafting sequence triggered!' }
  });

  res.json({ success: true, message: 'Gift successfully unsealed and claimed!', data: updatedGift });
}));

// @route   GET /api/v1/gifts/me/sent
giftingRouter.get('/me/sent', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const gifts = await prisma.giftLink.findMany({
    where: { order: { buyerId: req.user!.id } },
    include: { order: { include: { items: { include: { product: true } } } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: gifts });
}));

export default giftingRouter;
