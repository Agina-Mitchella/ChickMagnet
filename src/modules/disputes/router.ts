import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest, requireRoles } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';

const disputesRouter = Router();

// @route   POST /api/v1/disputes
disputesRouter.post('/', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { orderId, reason, description, photos = [], desiredOutcome } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: req.user!.id }
  });

  if (!order) {
    return res.status(404).json({ success: false, error: { message: 'Covenant not found.' } });
  }

  // Find maker for the items in the order
  const firstItem = await prisma.orderItem.findFirst({
    where: { orderId },
    include: { product: true }
  });

  if (!firstItem) {
    return res.status(400).json({ success: false, error: { message: 'Order is empty.' } });
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId,
      buyerId: req.user!.id,
      keeperId: firstItem.product.keeperId,
      reason,
      description,
      photos,
      desiredOutcome,
      status: 'OPEN'
    }
  });

  res.status(201).json({ success: true, data: dispute });
}));

// @route   GET /api/v1/disputes/me
disputesRouter.get('/me', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const disputes = await prisma.dispute.findMany({
    where: { buyerId: req.user!.id },
    include: { order: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: disputes });
}));

// @route   POST /api/v1/disputes/maker/:id/respond
disputesRouter.post('/maker/:id/respond', requireAuth, requireRoles('KEEPER'), tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { responseText } = req.body;

  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) return res.status(404).json({ success: false, error: { message: 'Dispute case file not found.' } });

  const updated = await prisma.dispute.update({
    where: { id },
    data: { status: 'RESPONDED' }
  });

  await prisma.disputeMessage.create({
    data: {
      disputeId: id,
      senderId: req.user!.id,
      senderRole: 'KEEPER',
      content: responseText,
      attachments: []
    }
  });

  res.json({ success: true, message: 'Response registered in council scrolls.', data: updated });
}));

export default disputesRouter;
