import type { BuyerType, CartItem, Product } from '../types';

export const WHOLESALE_CHICKEN_MINIMUM = 10;
export const WHOLESALE_EGG_MINIMUM = 5;

const CHICKEN_CATEGORIES = ['live-birds', 'fresh-poultry', 'processed'];

export function getWholesaleMinimumForCategory(category?: string): number {
  if (category && CHICKEN_CATEGORIES.includes(category)) {
    return WHOLESALE_CHICKEN_MINIMUM;
  }

  if (category === 'eggs') {
    return WHOLESALE_EGG_MINIMUM;
  }

  return 1;
}

export function getMinimumOrderQuantity(product: Product, buyerType: BuyerType): number {
  if (buyerType === 'wholesale') {
    const categoryMinimum = getWholesaleMinimumForCategory(product.category);
    return categoryMinimum > 1 ? categoryMinimum : Math.max(1, product.wholesaleMinQty || 1);
  }

  return Math.max(1, product.liveData?.minOrderQty || product.minOrderQty || 1);
}

export function getUnitPrice(product: Product, buyerType: BuyerType): number {
  if (buyerType === 'wholesale' && product.wholesalePrice) {
    return product.wholesalePrice;
  }

  return product.price;
}

export function findMinimumOrderViolations(cartItems: CartItem[], buyerType: BuyerType): CartItem[] {
  return cartItems.filter((item) => item.quantity < getMinimumOrderQuantity(item.product, buyerType));
}
