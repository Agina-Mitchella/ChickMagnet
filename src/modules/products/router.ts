import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';
import * as productsController from './controller.ts';
import { prisma } from '../../config/index.ts';
import { mapProductToFrontend } from './service.ts';

const router = Router();

// @route   GET /api/v1/products
router.get('/', tryCatch(productsController.getAll));

// @route   GET /api/v1/products/:id
router.get('/:id', tryCatch(productsController.getById));

// @route   POST /api/v1/products
router.post('/', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.create));

// @route   PATCH /api/v1/products/:id
router.patch('/:id', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(productsController.update));

// @route   PUT /api/v1/products/:id (Support standard update)
router.put('/:id', tryCatch(productsController.update));

// @route   DELETE /api/v1/products/:id
router.delete('/:id', tryCatch(productsController.remove));

// @route   POST /api/v1/products/:productId/review
router.post('/:productId/review', tryCatch(async (req: any, res: any) => {
  const { productId } = req.params;
  const { author, rating, text, email } = req.body;

  // Find or create the user by email or name
  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }
  if (!user) {
    const cleanEmail = email ? email.toLowerCase().trim() : `reviewer-${Date.now()}@example.com`;
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: author || 'Anonymous Buyer',
        passwordHash: 'passwordless',
        avatarEmoji: '🌾'
      }
    });
  }

  // Find or create a mock order to satisfy the unique key constraint
  let order = await prisma.order.findFirst({ where: { buyerId: user.id } });
  if (!order) {
    order = await prisma.order.create({
      data: {
        buyerId: user.id,
        status: 'DELIVERED',
        subtotal: 0,
        platformFee: 0,
        transactionFee: 0,
        total: 0
      } as any
    });
  }

  // Upsert or create review
  let review = await prisma.review.findFirst({
    where: {
      orderId: order.id,
      productId,
      buyerId: user.id
    }
  });

  if (!review) {
    review = await prisma.review.create({
      data: {
        orderId: order.id,
        buyerId: user.id,
        productId,
        rating: Number(rating),
        comment: text || '',
        photos: [] as any,
        isVerified: true
      }
    });
  } else {
    review = await prisma.review.update({
      where: { id: review.id },
      data: {
        rating: Number(rating),
        comment: text || ''
      }
    });
  }

  const dbProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { keeper: { include: { user: { select: { name: true } } } }, tags: true, reviews: true }
  });

  res.json({
    success: true,
    review,
    product: dbProduct ? mapProductToFrontend(dbProduct) : null
  });
}));

export default router;
