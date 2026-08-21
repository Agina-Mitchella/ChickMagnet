import { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'crypto';

// 1. tryCatch utility to wrap async controllers and skip repetitive try-catch blocks
export function tryCatch(fn: Function): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 2. Simple Slugify helper
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

// 3. Secure UUID generator
export function generateSecureUUID(): string {
  return crypto.randomUUID();
}

// 4. Woodland/Solar lore mapping dictionary (Reworked to Fae Core and Afro Lore)
const LORE_DICTIONARY = {
  WOODLAND: {
    shop: 'Fae Market Storefront',
    seller: 'Fae Maker',
    currency: 'Fae Stars',
    order: 'Fae Covenant',
    delivery: 'Moonlight Sprite dispatch',
    payout: 'Market bounty allocation',
    dispute: 'Fae Council adjudication',
    product: 'Enchanted Artifact',
    greeting: 'Welcome to the enchanted Fae Market, dear mortal traveler.'
  },
  SOLAR: {
    shop: 'Baobab Market Stall',
    seller: 'Guild Weaver',
    currency: 'Cowrie Shells',
    order: 'Ancestral Agreement',
    delivery: 'Caravan runner dispatch',
    payout: 'Communal bounty share',
    dispute: 'Elder Baraza arbitration',
    product: 'Slow-crafted Heritage Wonder',
    greeting: 'Welcome to the Baobab Shade, seeker of ancient craftsmanship.'
  }
};

export function getLoreTerms(mode: 'WOODLAND' | 'SOLAR') {
  return LORE_DICTIONARY[mode] || LORE_DICTIONARY.WOODLAND;
}

export function formatPrice(minorUnits: number): string {
  return (minorUnits / 100).toLocaleString('en-KE', {
    style: 'currency',
    currency: 'KES'
  });
}
