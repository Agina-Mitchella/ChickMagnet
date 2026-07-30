import { Router } from 'express';
import { prisma, redis } from '../../config/index.ts';
import { requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch, generateSecureUUID } from '../../utils/index.ts';

const cartRouter = Router();

// Retrieve cart helper (combining Redis for guest sessions, DB for authenticated users)
async function getCartData(req: any) {
  const userId = req.user?.id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.cookies?.guest_session_id;

  if (userId) {
    // Authenticated: fetch cart items from Database / Redis hybrid
    const cartKey = `cart:auth:${userId}`;
    const items = await redis.hgetall(cartKey);
    return items;
  } else if (guestSessionId) {
    // Guest: fetch cart items from Redis
    const cartKey = `cart:guest:${guestSessionId}`;
    const items = await redis.hgetall(cartKey);
    return items;
  }
  return {};
}

// @route   GET /api/v1/cart
cartRouter.get('/', tryCatch(async (req: any, res: any) => {
  const items = await getCartData(req);
  const parsedItems: any[] = [];
  let subtotal = 0;

  for (const [productId, quantityStr] of Object.entries(items)) {
    const quantity = Number(quantityStr);
    const product = await prisma.product.findUnique({ where: { id: productId, deletedAt: null } });
    if (product) {
      parsedItems.push({ product, quantity });
      subtotal += product.price * quantity;
    }
  }

  res.json({
    success: true,
    data: {
      items: parsedItems,
      subtotal,
      platformFee: Math.floor(subtotal * 0.05),
      total: Math.floor(subtotal * 1.05)
    }
  });
}));

// @route   POST /api/v1/cart/items
cartRouter.post('/items', tryCatch(async (req: any, res: any) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user?.id;
  let guestSessionId = req.headers['x-guest-session-id'] || req.cookies?.guest_session_id;

  if (!userId && !guestSessionId) {
    guestSessionId = generateSecureUUID();
    res.cookie('guest_session_id', guestSessionId, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt || !product.isActive) {
    return res.status(404).json({ success: false, error: { message: 'This wonder has vanished.' } });
  }

  if (product.stockQuantity < quantity) {
    return res.status(400).json({ success: false, error: { message: 'Not enough starlight stock in inventory.' } });
  }

  const cartKey = userId ? `cart:auth:${userId}` : `cart:guest:${guestSessionId}`;
  await redis.hset(cartKey, productId, quantity);
  await redis.expire(cartKey, 7 * 24 * 3600); // 7 days expiry

  res.json({ success: true, message: 'Item added to magical cart.' });
}));

// @route   DELETE /api/v1/cart/items/:productId
cartRouter.delete('/items/:productId', tryCatch(async (req: any, res: any) => {
  const { productId } = req.params;
  const userId = req.user?.id;
  const guestSessionId = req.headers['x-guest-session-id'] || req.cookies?.guest_session_id;

  const cartKey = userId ? `cart:auth:${userId}` : `cart:guest:${guestSessionId}`;
  if (cartKey) {
    await redis.hdel(cartKey, productId);
  }

  res.json({ success: true, message: 'Removed item from cart.' });
}));

export default cartRouter;
