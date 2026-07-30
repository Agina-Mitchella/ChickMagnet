import { Router } from 'express';
import { prisma } from '../../config/index.ts';
import { tryCatch } from '../../utils/index.ts';

const shopRouter = Router();

// @route   GET /api/shop/:email
shopRouter.get('/:email', tryCatch(async (req: any, res: any) => {
  const { email } = req.params;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { keeperProfile: true }
  });

  if (!user || !user.keeperProfile) {
    return res.json({
      success: true,
      data: {
        shopName: 'Amani & Zawadi Fine Crafts',
        shopSlug: 'honeywood-marigold',
        loreMode: 'WOODLAND',
        bio: 'Artisanal crafts spun under direct moonlight in the Sylvan Markets.',
        accentColour: '#FAF5EC'
      }
    });
  }

  res.json({ success: true, data: user.keeperProfile });
}));

// @route   POST /api/shop/:email
shopRouter.post('/:email', tryCatch(async (req: any, res: any) => {
  const { email } = req.params;
  const { shopName, bio, accentColour, loreMode } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { keeperProfile: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: 'Meadow Traveler',
        passwordHash: 'passwordless',
        role: 'KEEPER'
      },
      include: { keeperProfile: true }
    });
  }

  let profile = user.keeperProfile;
  if (!profile) {
    profile = await prisma.keeperProfile.create({
      data: {
        userId: user.id,
        shopName: shopName || 'Amani & Zawadi Fine Crafts',
        shopSlug: 'honeywood-marigold-' + Date.now(),
        loreMode: loreMode || 'WOODLAND',
        bio: bio || 'Artisanal crafts spun under direct moonlight in the Sylvan Markets.',
        accentColour: accentColour || '#FAF5EC'
      }
    });
  } else {
    profile = await prisma.keeperProfile.update({
      where: { id: profile.id },
      data: {
        shopName: shopName || undefined,
        loreMode: loreMode || undefined,
        bio: bio || undefined,
        accentColour: accentColour || undefined
      }
    });
  }

  res.json({ success: true, data: profile });
}));

export default shopRouter;
