import { Request, Response } from 'express';
import * as productService from './service.ts';
import { prisma } from '../../config/index.ts';

export const getAll = async (req: Request, res: Response) => {
  try {
    const products = await productService.findAll(req.query);
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const product = await productService.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'This wonder has vanished into the twilight.' } });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const create = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, title, description, price, category, intention, images = [] } = req.body;
    
    const maker = await prisma.keeperProfile.findUnique({ where: { userId: req.user!.id } });
    if (!maker) {
      return res.status(400).json({ success: false, error: { code: 'KEEPER_PROFILE_MISSING', message: 'You must onboard as a Maker first.' } });
    }

    // Convert display category to DB enum
    const dbCategoryMap: Record<string, string> = {
      'Wandering Wearables': 'WANDERING_WEARABLES',
      'Enchanted Decor': 'ENCHANTED_DECOR',
      'Outdoor Magic': 'OUTDOOR_MAGIC',
      'Pixie Potions & Balms': 'PIXIE_POTIONS_AND_BALMS'
    };
    const dbCategory = dbCategoryMap[category] || category || 'ENCHANTED_DECOR';

    // Store price in minor units (cents / KES cents)
    const priceInCents = Math.floor(Number(price) * 100);

    const product = await prisma.product.create({
      data: {
        keeperId: maker.id,
        title: title || name || 'Enchanted Wonder',
        description: description || '',
        price: priceInCents,
        category: dbCategory as any,
        intention: intention || 'COZINESS',
        images: images,
        visibilityScore: 80
      }
    });

    const mapped = productService.mapProductToFrontend(product);
    res.status(201).json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, title, description, price, stock, stockQuantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'No such product exists.' } });
    }

    const priceInCents = price ? Math.floor(Number(price) * 100) : undefined;
    const finalStock = stockQuantity !== undefined ? Number(stockQuantity) : (stock !== undefined ? Number(stock) : undefined);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title || name || undefined,
        description: description || undefined,
        price: priceInCents,
        stockQuantity: finalStock,
      }
    });

    const mapped = productService.mapProductToFrontend(updated);
    res.json({ success: true, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
    res.json({ success: true, message: 'Listing has been hidden in our records.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
