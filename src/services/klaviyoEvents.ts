import type { BuyerType, CartItem, Product } from '../types';
import { getUnitPrice } from '../utils/orderRules';
import { getAbsoluteUrl, getProductPath, SITE_ORIGIN } from '../utils/productSeo';

type EventName = 'Viewed Product' | 'Added to Cart' | 'Started Checkout';
type TrackCommand = ['track', EventName, Record<string, unknown>];
type KlaviyoCommand =
  | TrackCommand
  | ['identify', { email: string }, () => void]
  | ['openForm', string];

declare global {
  interface Window {
    _klOnsite?: { push: (command: KlaviyoCommand) => unknown };
  }
}

function track(name: EventName, properties: () => Record<string, unknown>, email?: string): void {
  if (typeof window === 'undefined' || window.location.origin !== SITE_ORIGIN) return;

  const enqueue = (command: KlaviyoCommand) => {
    try {
      (window._klOnsite ??= []).push(command);
    } catch {
      // An unavailable analytics SDK must not interrupt shopping.
    }
  };
  const command: TrackCommand = ['track', name, properties()];
  if (!email) {
    enqueue(command);
  } else {
    // Klaviyo can finish identifying a shopper without returning a payload.
    enqueue(['identify', { email }, () => enqueue(command)]);
  }
}

export function normalizeCheckoutEmail(value: string): string {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function productProperties(product: Product, price: number) {
  let imageUrl: string | undefined;
  try {
    imageUrl = product.image ? getAbsoluteUrl(product.image) : undefined;
  } catch {
    // A previously stored cart can contain an invalid image URL.
  }
  return {
    ProductID: product.id.split('::', 1)[0],
    ProductName: product.name,
    Categories: [product.category],
    ImageURL: imageUrl,
    URL: getAbsoluteUrl(getProductPath(product)),
    Price: price,
  };
}

function cartProperties(cart: CartItem[], buyerType: BuyerType) {
  const items = cart.map(({ product, quantity }) => {
    const item = productProperties(product, getUnitPrice(product, buyerType));
    return {
      ProductID: item.ProductID,
      SKU: product.id,
      ProductName: item.ProductName,
      Quantity: quantity,
      ItemPrice: item.Price,
      RowTotal: item.Price * quantity,
      ProductURL: item.URL,
      ImageURL: item.ImageURL,
      ProductCategories: item.Categories,
    };
  });

  return {
    $value: items.reduce((total, item) => total + item.RowTotal, 0),
    Currency: 'KES',
    BuyerType: buyerType,
    ItemNames: items.map(item => item.ProductName),
    Categories: [...new Set(items.flatMap(item => item.ProductCategories))],
    Items: items,
  };
}

export function trackViewedProduct(product: Product, price: number, buyerType: BuyerType): void {
  track('Viewed Product', () => ({
    ...productProperties(product, price),
    $event_id: crypto.randomUUID(),
    Currency: 'KES',
    BuyerType: buyerType,
  }));
}

export function trackCartAddition(product: Product, quantity: number, cart: CartItem[], buyerType: BuyerType): void {
  track('Added to Cart', () => {
    const item = productProperties(product, getUnitPrice(product, buyerType));
    return {
      ...cartProperties(cart, buyerType),
      $event_id: crypto.randomUUID(),
      AddedItemProductID: item.ProductID,
      AddedItemProductName: item.ProductName,
      AddedItemCategories: item.Categories,
      AddedItemImageURL: item.ImageURL,
      AddedItemURL: item.URL,
      AddedItemPrice: item.Price,
      AddedItemQuantity: quantity,
    };
  });
}

export function trackStartedCheckout(
  checkoutId: string,
  email: string,
  cart: CartItem[],
  buyerType: BuyerType,
  productTotal: number,
): void {
  track('Started Checkout', () => ({
    ...cartProperties(cart, buyerType),
    $event_id: `checkout-${checkoutId}`,
    $value: productTotal,
  }), email);
}
