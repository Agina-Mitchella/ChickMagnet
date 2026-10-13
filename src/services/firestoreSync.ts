import {
  collection, doc, setDoc, onSnapshot, query, where, updateDoc, serverTimestamp,
  DocumentData, QuerySnapshot
} from 'firebase/firestore';
import { auth } from '../config/firebaseClient';
import { db, handleFirestoreError, OperationType } from '../config/firebaseDb';
import { Product } from '../types';
import { STOREFRONT_PRODUCTS } from '../data/storefrontCatalog';
import { isCurrentStorefrontProduct } from '../utils/storefrontProducts';
import { normalizeProductSeo } from '../utils/productSeo';

const EXPLICIT_STOREFRONT_PRODUCT_IDS_CACHE_KEY = 'chickmagnet_explicit_storefront_product_ids';
const DEFAULT_PRODUCTS_BY_ID = new Map(STOREFRONT_PRODUCTS.map(product => [product.id, product]));

function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`LocalStorage quota issue for key "${key}". Truncating dataset for offline cache...`);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify(parsed.slice(0, 20)));
      }
    } catch {
      // Ignore if parsing fails
    }
  }
}

function getExplicitlyEnabledProductIds(): Set<string> {
  try {
    const cachedIds = JSON.parse(
      localStorage.getItem(EXPLICIT_STOREFRONT_PRODUCT_IDS_CACHE_KEY) || '[]'
    );
    return new Set(Array.isArray(cachedIds) ? cachedIds.filter(id => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function isVisibleFallbackProduct(product: Product, explicitlyEnabledIds: Set<string>): boolean {
  if (product.showOnStorefront === false) {
    return false;
  }

  const defaultProduct = DEFAULT_PRODUCTS_BY_ID.get(product.id);
  if (defaultProduct) {
    return isCurrentStorefrontProduct(defaultProduct) || explicitlyEnabledIds.has(product.id);
  }

  return product.showOnStorefront === true && explicitlyEnabledIds.has(product.id);
}

export function filterCachedStorefrontProducts(products: Product[]): Product[] {
  const explicitlyEnabledIds = getExplicitlyEnabledProductIds();
  return products.filter(product => isVisibleFallbackProduct(product, explicitlyEnabledIds));
}

// 1. Products Realtime Sync
export function subscribeProducts(
  onUpdate: (products: Product[]) => void
) {
  const collectionRef = collection(db, 'products');
  
  const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
    try {
      const firestoreProducts = new Map(
        snapshot.docs.map(productDocument => [
          productDocument.id,
          productDocument.data() as Partial<Product>,
        ])
      );
      const explicitlyEnabledIds = snapshot.docs
        .filter(productDocument => productDocument.data().showOnStorefront === true)
        .map(productDocument => productDocument.id);

      const items: Product[] = STOREFRONT_PRODUCTS.flatMap(defaultProduct => {
        const override = firestoreProducts.get(defaultProduct.id);
        firestoreProducts.delete(defaultProduct.id);
        const defaultIsVisible = isCurrentStorefrontProduct(defaultProduct);
        const explicitlyEnabled = override?.showOnStorefront === true;

        if (
          override?.showOnStorefront === false
          || (!defaultIsVisible && !explicitlyEnabled)
        ) {
          return [];
        }

        return [{
          ...defaultProduct,
          ...override,
          id: defaultProduct.id,
          showOnStorefront: true,
        }];
      });

      for (const [productId, product] of firestoreProducts) {
        // New products have no built-in visibility. An admin must explicitly
        // publish them; missing and false values are both treated as hidden.
        if (
          product.showOnStorefront !== true
          || !isCurrentStorefrontProduct({ ...(product as Product), id: productId })
        ) {
          continue;
        }

        items.push({
          ...(product as Product),
          id: productId,
          showOnStorefront: true,
        });
      }

      onUpdate(items);
      safeSetLocalStorage('chickmagnet_products', JSON.stringify(items));
      safeSetLocalStorage(
        EXPLICIT_STOREFRONT_PRODUCT_IDS_CACHE_KEY,
        JSON.stringify(explicitlyEnabledIds)
      );
      window.dispatchEvent(new Event('chickmagnet_products_updated'));
    } catch (err) {
      console.error('Error handling products snapshot:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'products');
    const saved = localStorage.getItem('chickmagnet_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onUpdate(filterCachedStorefrontProducts(parsed as Product[]));
          return;
        }
      } catch {}
    }
    onUpdate(STOREFRONT_PRODUCTS.filter(product =>
      isVisibleFallbackProduct(product, new Set())
    ));
  });

  return unsubscribe;
}

export async function saveProductToFirestore(product: Product) {
  try {
    const normalizedProduct = normalizeProductSeo(product);
    await setDoc(doc(db, 'products', product.id), {
      ...normalizedProduct,
      showOnStorefront: normalizedProduct.catalogStatus !== 'archived'
        && normalizedProduct.showOnStorefront !== false,
      updatedAt: serverTimestamp(),
    });
    safeSetLocalStorage('chickmagnet_products_last_update', Date.now().toString());
    window.dispatchEvent(new Event('chickmagnet_products_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    throw error;
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await setDoc(doc(db, 'products', productId), {
      showOnStorefront: false,
      catalogStatus: 'archived',
      searchVisibility: 'noindex',
      updatedAt: serverTimestamp(),
    }, { merge: true });
    window.dispatchEvent(new Event('chickmagnet_products_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
    throw error;
  }
}

// 2. Orders Realtime Sync
// Firestore security rules do not filter results. Buyer queries must include the
// same owner predicate enforced by the rules or Firestore rejects the query.
function snapshotOrders(snapshot: QuerySnapshot<DocumentData>) {
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export function subscribeUserOrders(userId: string, onUpdate: (orders: any[]) => void) {
  const ownerQuery = query(collection(db, 'orders'), where('buyerId', '==', userId));

  return onSnapshot(ownerQuery, (snapshot) => {
    onUpdate(snapshotOrders(snapshot));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
    onUpdate([]);
  });
}

export function subscribeAdminOrders(onUpdate: (orders: any[]) => void) {
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    onUpdate(snapshotOrders(snapshot));
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
    onUpdate([]);
  });
}

export async function saveOrderToFirestore(order: any) {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error('Sign in before submitting an order.');
  }

  const docId = String(order.id || `order-${Date.now()}`);
  const orderRecord = {
    id: docId,
    buyerId: firebaseUser.uid,
    buyerEmail: firebaseUser.email || '',
    date: String(order.date || ''),
    items: String(order.items || ''),
    itemCount: Number(order.itemCount || 0),
    status: 'Payment confirmation pending',
    statusColor: 'bg-amber-500/20 text-amber-900 border-amber-500/40',
    total: Number(order.total || 0),
    batchId: String(order.batchId || ''),
    fulfillment: String(order.fulfillment || ''),
    eta: String(order.eta || ''),
    deliverySlots: order.deliverySlots || {},
    buyerType: order.buyerType === 'wholesale' ? 'wholesale' : 'retail',
    customerName: String(order.customerName || '').trim(),
    customerEmail: String(order.customerEmail || '').trim().toLowerCase(),
    customerPhone: String(order.customerPhone || '').trim(),
    deliveryZone: String(order.deliveryZone || '').trim(),
    deliveryAddress: String(order.deliveryAddress || '').trim(),
    isGuest: firebaseUser.isAnonymous,
    paymentMethod: 'M-Pesa Send Money',
    paymentNumber: '0724300781',
    paymentConfirmationStatus: 'pending_manual_review',
    pricingVerificationStatus: 'pending_manual_review',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'orders', docId), orderRecord);
    return { ...orderRecord, createdAt: new Date() };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${docId}`);
    throw new Error('Your order could not be saved. Please try again before sending another payment confirmation.');
  }
}

const ALLOWED_ORDER_STATUSES = new Set([
  'Payment confirmation pending',
  'Packed / Weighed',
  'Dispatched',
  'Delivered',
  'Guarantee Window Open',
  'Closed',
]);

export async function updateOrderStatusInFirestore(orderId: string, status: string) {
  if (!ALLOWED_ORDER_STATUSES.has(status)) {
    throw new Error('Invalid order status.');
  }

  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    throw new Error('The order status could not be updated.');
  }
}

export async function reviewOrderPaymentInFirestore(
  orderId: string,
  decision: 'confirmed' | 'rejected',
) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      paymentConfirmationStatus: decision,
      pricingVerificationStatus: decision === 'confirmed' ? 'verified' : 'rejected',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    throw new Error('The payment review could not be saved.');
  }
}

// 3. Admin Audit Logs Sync
export function subscribeAuditLogs(
  onUpdate: (logs: any[]) => void
) {
  const collectionRef = collection(db, 'admin_audit_logs');

  return onSnapshot(collectionRef, (snapshot) => {
    const items = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((left: any, right: any) => String(right.timestamp || '').localeCompare(String(left.timestamp || '')));
    onUpdate(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'admin_audit_logs');
    onUpdate([]);
  });
}

export async function saveAuditLogToFirestore(logItem: any) {
  try {
    const docId = logItem.id || `log-${Date.now()}`;
    await setDoc(doc(db, 'admin_audit_logs', docId), { ...logItem, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admin_audit_logs/${logItem.id}`);
  }
}
