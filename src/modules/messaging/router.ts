import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { requireAuth, AuthRequest } from '../../middleware/index.ts';
import { tryCatch } from '../../utils/index.ts';

const messagingRouter = Router();

// @route   GET /api/v1/messages
messagingRouter.get('/', tryCatch(async (req: any, res: any) => {
  const { buyerEmail, makerEmail } = req.query;
  
  if (!buyerEmail || !makerEmail) {
    return res.json({ success: true, data: [] });
  }

  const buyer = await prisma.user.findUnique({ where: { email: (buyerEmail as string).toLowerCase().trim() } });
  const makerUser = await prisma.user.findUnique({ where: { email: (makerEmail as string).toLowerCase().trim() }, include: { keeperProfile: true } });

  if (!buyer || !makerUser || !makerUser.keeperProfile) {
    return res.json({ success: true, data: [] });
  }

  const thread = await prisma.messageThread.findFirst({
    where: {
      buyerId: buyer.id,
      keeperId: makerUser.keeperProfile.id
    },
    include: {
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!thread) {
    return res.json({ success: true, data: [] });
  }

  const mapped = thread.messages.map((m: any) => ({
    sender: m.senderId === buyer.id ? buyer.name : makerUser.name,
    text: m.content,
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  res.json({ success: true, data: mapped });
}));

// @route   POST /api/v1/messages
messagingRouter.post('/', tryCatch(async (req: any, res: any) => {
  const { sender, text, buyerEmail, makerEmail } = req.body;
  const cleanBuyerEmail = (buyerEmail || 'user@example.com').toLowerCase().trim();
  const cleanMakerEmail = (makerEmail || 'maker@example.com').toLowerCase().trim();

  let buyer = await prisma.user.findUnique({ where: { email: cleanBuyerEmail } });
  if (!buyer) {
    buyer = await prisma.user.create({
      data: {
        email: cleanBuyerEmail,
        name: sender || 'Meadow Traveler',
        passwordHash: 'passwordless'
      }
    });
  }

  let makerUser = await prisma.user.findUnique({ where: { email: cleanMakerEmail }, include: { keeperProfile: true } });
  if (!makerUser) {
    makerUser = await prisma.user.create({
      data: {
        email: cleanMakerEmail,
        name: 'Amani & Zawadi Fine Crafts',
        passwordHash: 'passwordless',
        role: 'KEEPER'
      },
      include: { keeperProfile: true }
    });
  }

  let keeperProfile = makerUser.keeperProfile;
  if (!keeperProfile) {
    keeperProfile = await prisma.keeperProfile.create({
      data: {
        userId: makerUser.id,
        shopName: 'Amani & Zawadi Fine Crafts',
        shopSlug: 'honeywood-marigold-' + Date.now(),
        loreMode: 'WOODLAND'
      }
    });
  }

  let thread = await prisma.messageThread.findFirst({
    where: {
      buyerId: buyer.id,
      keeperId: keeperProfile.id
    }
  });

  if (!thread) {
    thread = await prisma.messageThread.create({
      data: {
        buyerId: buyer.id,
        keeperId: keeperProfile.id
      }
    });
  }

  const senderId = sender === buyer.name ? buyer.id : makerUser.id;

  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      senderId,
      content: text
    }
  });

  res.status(201).json({ success: true, data: message });
}));

// @route   GET /api/v1/messages/threads
messagingRouter.get('/threads', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const userId = req.user!.id;

  let threads;
  if (req.user!.role === 'KEEPER') {
    const maker = await prisma.keeperProfile.findUnique({ where: { userId } });
    threads = await prisma.messageThread.findMany({
      where: { keeperId: maker?.id || '' },
      include: { buyer: { select: { id: true, name: true, avatarEmoji: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
  } else {
    threads = await prisma.messageThread.findMany({
      where: { buyerId: userId },
      include: { keeper: { include: { user: { select: { name: true, avatarEmoji: true } } } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
  }

  res.json({ success: true, data: threads });
}));

// @route   POST /api/v1/messages/threads
messagingRouter.post('/threads', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { keeperId, orderId } = req.body;

  const thread = await prisma.messageThread.create({
    data: {
      buyerId: req.user!.id,
      keeperId,
      orderId
    }
  });

  res.status(201).json({ success: true, data: thread });
}));

// @route   GET /api/v1/messages/threads/:id/messages
messagingRouter.get('/threads/:id/messages', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const messages = await prisma.message.findMany({
    where: { threadId: id },
    orderBy: { createdAt: 'asc' }
  });

  res.json({ success: true, data: messages });
}));

// @route   POST /api/v1/messages/threads/:id/messages
messagingRouter.post('/threads/:id/messages', requireAuth, tryCatch(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { content } = req.body;

  const message = await prisma.message.create({
    data: {
      threadId: id,
      senderId: req.user!.id,
      content
    }
  });

  await prisma.messageThread.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  res.status(201).json({ success: true, data: message });
}));

export default messagingRouter;
