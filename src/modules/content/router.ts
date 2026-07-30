import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';

const contentRouter = Router();

// --------------------------------------------------
// 1. SEARCH & AUTO-COMPLETE
// --------------------------------------------------
contentRouter.get('/search', tryCatch(async (req: any, res: any) => {
  const { q = '' } = req.query;
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 10
  });
  res.json({ success: true, data: products });
}));

contentRouter.get('/search/autocomplete', tryCatch(async (req: any, res: any) => {
  const { q = '' } = req.query;
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      title: { contains: q, mode: 'insensitive' }
    },
    select: { id: true, title: true },
    take: 5
  });
  res.json({ success: true, data: products.map(p => p.title) });
}));

// --------------------------------------------------
// 2. PROMOTIONS
// --------------------------------------------------
contentRouter.post('/promotions/validate', tryCatch(async (req: any, res: any) => {
  const { couponCode, orderValue } = req.body;
  const promo = await prisma.promotion.findFirst({
    where: { name: couponCode, isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } }
  });

  if (!promo) {
    return res.status(400).json({ success: false, error: { message: 'Invalid or expired coupon scroll.' } });
  }

  if (orderValue < promo.minimumOrderValue) {
    return res.status(400).json({ success: false, error: { message: `Coupon requires minimum purchase level of KES ${(promo.minimumOrderValue/100).toFixed(2)}.` } });
  }

  res.json({
    success: true,
    data: {
      couponCode: promo.name,
      discountType: promo.discountType,
      discountValue: promo.discountValue
    }
  });
}));

// --------------------------------------------------
// 3. REVIEWS & VERIFIED PURCHASES
// --------------------------------------------------
contentRouter.post('/reviews', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { orderId, productId, rating, comment, photos = [], caption } = req.body;

  // Verify buyer made this purchase
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { id: orderId, buyerId: req.user!.id, status: 'DELIVERED' }
    }
  });

  const review = await prisma.review.create({
    data: {
      orderId,
      buyerId: req.user!.id,
      productId,
      rating: Number(rating),
      comment,
      photos,
      caption,
      recommendation: 'YES',
      isVerified: !!purchase
    }
  });

  res.status(201).json({ success: true, data: review });
}));

// --------------------------------------------------
// 4. Q&A (QUESTIONS AND ANSWERS)
// --------------------------------------------------
contentRouter.get('/qa/product/:productId', tryCatch(async (req: any, res: any) => {
  const { productId } = req.params;
  const questions = await prisma.productQuestion.findMany({
    where: { productId },
    include: { answers: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: questions });
}));

contentRouter.post('/qa/product/:productId/questions', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { productId } = req.params;
  const { questionText, isAnonymous = false } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const askerName = user?.name || 'Anonymous Buyer';

  const question = await prisma.productQuestion.create({
    data: {
      productId,
      askerId: req.user!.id,
      askerName,
      isAnonymous,
      questionText
    }
  });

  res.status(201).json({ success: true, data: question });
}));

// --------------------------------------------------
// 5. SEASONAL EVENTS
// --------------------------------------------------
contentRouter.get('/events/active', tryCatch(async (req: any, res: any) => {
  const activeEvent = await prisma.event.findFirst({
    where: { isActive: true },
    include: { products: { include: { product: true } } }
  });
  res.json({ success: true, data: activeEvent });
}));

// --------------------------------------------------
// 6. FIELD NOTES
// --------------------------------------------------
contentRouter.get('/fieldnotes', tryCatch(async (req: any, res: any) => {
  const notes = await prisma.fieldNote.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' }
  });
  res.json({ success: true, data: notes });
}));

contentRouter.get('/fieldnotes/:slug', tryCatch(async (req: any, res: any) => {
  const note = await prisma.fieldNote.findUnique({
    where: { slug: req.params.slug }
  });
  if (!note) return res.status(404).json({ success: false, error: { message: 'This note has faded from existence.' } });
  res.json({ success: true, data: note });
}));

// --------------------------------------------------
// 7. PUBLIC HEARTH / STATUS INCIDENTS
// --------------------------------------------------
contentRouter.get('/status/active-incidents', tryCatch(async (req: any, res: any) => {
  const incidents = await prisma.platformIncident.findMany({
    where: { status: { notIn: ['RESOLVED'] } }
  });
  res.json({ success: true, data: incidents });
}));

// --------------------------------------------------
// 8. CMS CONTENT BLOCKS
// --------------------------------------------------
let memoryCMSBlocks: any[] = [];

contentRouter.get('/blocks', tryCatch(async (req: any, res: any) => {
  res.json({ success: true, data: memoryCMSBlocks });
}));

contentRouter.post('/blocks', tryCatch(async (req: any, res: any) => {
  const { blocks, block } = req.body;
  if (blocks && Array.isArray(blocks)) {
    memoryCMSBlocks = blocks;
  } else if (block && block.id) {
    const idx = memoryCMSBlocks.findIndex((b: any) => b.id === block.id);
    if (idx >= 0) {
      memoryCMSBlocks[idx] = block;
    } else {
      memoryCMSBlocks.push(block);
    }
  }
  res.json({ success: true, message: 'CMS content updated successfully.', data: memoryCMSBlocks });
}));

export default contentRouter;
