import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles } from '../../middleware/index.ts';
import { tryCatch, formatPrice } from '../../utils/index.ts';

const ordersRouter = Router();

// @route   GET /api/v1/orders
ordersRouter.get('/', tryCatch(async (req: any, res: any) => {
  const { buyerEmail, sellerEmail } = req.query;
  const where: any = {};

  if (buyerEmail) {
    const buyer = await prisma.user.findUnique({ where: { email: (buyerEmail as string).toLowerCase().trim() } });
    if (buyer) {
      where.buyerId = buyer.id;
    } else {
      return res.json({ success: true, data: [] });
    }
  }

  if (sellerEmail) {
    const seller = await prisma.user.findUnique({ where: { email: (sellerEmail as string).toLowerCase().trim() }, include: { keeperProfile: true } });
    if (seller && seller.keeperProfile) {
      where.items = {
        some: {
          product: {
            keeperId: seller.keeperProfile.id
          }
        }
      };
    } else {
      return res.json({ success: true, data: [] });
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      statusHistory: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: orders });
}));

// @route   POST /api/v1/orders
ordersRouter.post('/', tryCatch(async (req: any, res: any) => {
  const { items, ref, buyerName, buyerEmail, shippingAddress, ritualNotes } = req.body;
  const normalizedEmail = (buyerEmail || 'user@example.com').toLowerCase().trim();

  // Find or create buyer user
  let buyer = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!buyer) {
    buyer = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: buyerName || 'Meadow Traveler',
        passwordHash: 'passwordless',
        avatarEmoji: '🌾'
      }
    });
  }

  // Compute pricing
  let subtotal = 0;
  for (const item of items) {
    const itemPriceInCents = Math.floor(Number(item.price) * 100);
    subtotal += itemPriceInCents * Number(item.quantity);
  }

  const platformFee = Math.floor(subtotal * 0.05);
  const transactionFee = 150; // KES 1.50 small flat fee
  const total = subtotal + platformFee + transactionFee;

  // Create order
  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      status: 'PENDING',
      subtotal,
      platformFee,
      transactionFee,
      total,
      buyerNote: ritualNotes || '',
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          priceAtPurchase: Math.floor(Number(item.price) * 100)
        }))
      },
      statusHistory: {
        create: {
          status: 'PENDING',
          note: 'Covenant recorded and sealed with starlight.'
        }
      }
    },
    include: {
      items: { include: { product: true } },
      statusHistory: true
    }
  });

  res.status(201).json({ success: true, data: order });
}));

// @route   GET /api/v1/orders/me
ordersRouter.get('/me', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: orders });
}));

// @route   GET /api/v1/orders/me/:id
ordersRouter.get('/me/:id', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { id, buyerId: req.user!.id },
    include: {
      items: { include: { product: true } },
      statusHistory: true
    }
  });

  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'No such covenant recorded.' } });
  }

  res.json({ success: true, data: order });
}));

// @route   GET /api/v1/orders/me/:id/invoice
ordersRouter.get('/me/:id/invoice', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { id, buyerId: req.user!.id },
    include: { items: { include: { product: true } } }
  });

  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'No invoice for this covenant.' } });
  }

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - Sol Handmades</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; color: #2D2722; padding: 20px; background-color: #FAF6EE; }
        .invoice-card { background: #FFFFFF; border: 1px solid #E4DFD5; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h1 { font-size: 20px; border-bottom: 2px dashed #E4DFD5; padding-bottom: 15px; margin-top: 0; color: #E97451; }
        .meta-line { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .item-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #F1EDE4; padding: 12px 0; font-size: 14px; }
        .total-section { border-top: 2px dashed #E4DFD5; margin-top: 20px; padding-top: 15px; font-weight: bold; font-size: 15px; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #8C8275; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <h1>📜 COVENANT INVOICE</h1>
        <div class="meta-line"><span>Covenant ID:</span> <span>${order.id}</span></div>
        <div class="meta-line"><span>Date Recorded:</span> <span>${order.createdAt.toLocaleDateString()}</span></div>
        <div class="meta-line"><span>Status:</span> <span>${order.status}</span></div>
        
        <h3 style="margin-top: 25px; font-size: 14px; border-bottom: 1px solid #E4DFD5; padding-bottom: 5px;">ITEMS SUMMONED</h3>
        ${order.items.map(item => `
          <div class="item-row">
            <span>${item.product.title} (x${item.quantity})</span>
            <span>${formatPrice(item.priceAtPurchase)}</span>
          </div>
        `).join('')}

        <div class="total-section">
          <div class="meta-line"><span>Subtotal:</span> <span>${formatPrice(order.subtotal)}</span></div>
          <div class="meta-line"><span>Platform Fee:</span> <span>${formatPrice(order.platformFee)}</span></div>
          <div class="meta-line" style="font-size: 16px; color: #E97451; margin-top: 10px;"><span>Total:</span> <span>${formatPrice(order.total)}</span></div>
        </div>

        <div class="footer">
          May the daylight forever bless your home. Sol Handmades.
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(invoiceHtml);
}));

// @route   POST /api/v1/orders/me/:id/cancel
ordersRouter.post('/me/:id/cancel', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: { id, buyerId: req.user!.id, status: 'PENDING' },
    include: { items: true }
  });

  if (!order) {
    return res.status(400).json({ success: false, error: { code: 'ORDER_NOT_CANCELLABLE', message: 'Covenant cannot be cancelled as it is already being crafted.' } });
  }

  // Restore inventory stock quantity
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity } }
    });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { statusHistory: true }
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: order.id, status: 'CANCELLED', note: 'Covenant cancelled by the buyer.' }
  });

  res.json({ success: true, message: 'Covenant successfully dissolved.', data: updated });
}));

// @route   GET /api/v1/orders/maker
ordersRouter.get('/maker', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
  if (!maker) {
    return res.status(400).json({ success: false, error: { code: 'NOT_A_KEEPER', message: 'Onboard as a Maker first.' } });
  }

  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { keeperId: maker.id } } }
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: orders });
}));

// @route   PATCH /api/v1/orders/maker/:id/status
ordersRouter.patch('/maker/:id/status', requireAuth, requireRoles('KEEPER', 'ADMIN'), tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { statusHistory: true }
  });

  await prisma.orderStatusHistory.create({
    data: { orderId: id, status, note: note || `Status transitioned by Maker.` }
  });

  res.json({ success: true, message: 'Covenant progress logged successfully.', data: order });
}));

export default ordersRouter;
