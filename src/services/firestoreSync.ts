import {
  collection, doc, setDoc, onSnapshot, query, where, updateDoc, serverTimestamp,
  DocumentData, QuerySnapshot
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase';
import { Product } from '../types';
import { STOREFRONT_PRODUCTS } from '../data/storefrontCatalog';
import { getStoredCMSData, saveStoredCMSData, CMSBlock } from '../utils/cms';
import { isCurrentStorefrontProduct } from '../utils/storefrontProducts';

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
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      showOnStorefront: product.showOnStorefront !== false,
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
    }, { merge: true });
    window.dispatchEvent(new Event('chickmagnet_products_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
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

// 3. Claims Realtime Sync
export function subscribeClaims(
  onUpdate: (claims: any[]) => void,
  initialClaims: any[] = []
) {
  const collectionRef = collection(db, 'claims');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialClaims && initialClaims.length > 0) {
        for (const claim of initialClaims) {
          const docId = claim.id || `claim-${Date.now()}`;
          await setDoc(doc(db, 'claims', docId), { ...claim, id: docId });
        }
        onUpdate(initialClaims);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_claims', JSON.stringify(items));
      }
    } catch (err) {
      console.error('Claims snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'claims');
    const saved = localStorage.getItem('chickmagnet_admin_claims');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialClaims);
  });
}

export async function saveClaimToFirestore(claim: any) {
  try {
    const docId = claim.id || `claim-${Date.now()}`;
    await setDoc(doc(db, 'claims', docId), { ...claim, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `claims/${claim.id}`);
  }
}

// 4. Wholesale Applications Sync
export function subscribeWholesale(
  onUpdate: (accounts: any[]) => void,
  initialAccounts: any[] = []
) {
  const collectionRef = collection(db, 'wholesale_applications');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialAccounts && initialAccounts.length > 0) {
        for (const acc of initialAccounts) {
          const docId = acc.id || `ws-${Date.now()}`;
          await setDoc(doc(db, 'wholesale_applications', docId), { ...acc, id: docId });
        }
        onUpdate(initialAccounts);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_wholesale', JSON.stringify(items));
      }
    } catch (err) {
      console.error('Wholesale snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'wholesale_applications');
    const saved = localStorage.getItem('chickmagnet_admin_wholesale');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialAccounts);
  });
}

export async function saveWholesaleAccountToFirestore(account: any) {
  try {
    const docId = account.id || `ws-${Date.now()}`;
    await setDoc(doc(db, 'wholesale_applications', docId), { ...account, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `wholesale_applications/${account.id}`);
  }
}

// 5. Trust Badges Sync
export function subscribeBadges(
  onUpdate: (badges: any[]) => void,
  initialBadges: any[] = []
) {
  const collectionRef = collection(db, 'seller_badges');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialBadges && initialBadges.length > 0) {
        for (const badge of initialBadges) {
          const docId = badge.id || `badge-${Date.now()}`;
          await setDoc(doc(db, 'seller_badges', docId), { ...badge, id: docId });
        }
        onUpdate(initialBadges);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_badges', JSON.stringify(items));
        window.dispatchEvent(new Event('chickmagnet_badges_updated'));
      }
    } catch (err) {
      console.error('Badges snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'seller_badges');
    const saved = localStorage.getItem('chickmagnet_admin_badges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialBadges);
  });
}

export async function saveBadgeToFirestore(badge: any) {
  try {
    const docId = badge.id || `badge-${Date.now()}`;
    await setDoc(doc(db, 'seller_badges', docId), { ...badge, id: docId });
    window.dispatchEvent(new Event('chickmagnet_badges_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `seller_badges/${badge.id}`);
  }
}

// 6. Hatchery Batches Sync
export function subscribeBatches(
  onUpdate: (batches: any[]) => void,
  initialBatches: any[] = []
) {
  const collectionRef = collection(db, 'hatchery_batches');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialBatches && initialBatches.length > 0) {
        for (const batch of initialBatches) {
          const docId = batch.batchId || `batch-${Date.now()}`;
          await setDoc(doc(db, 'hatchery_batches', docId), { ...batch, id: docId, batchId: docId });
        }
        onUpdate(initialBatches);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_batches', JSON.stringify(items));
        window.dispatchEvent(new Event('chickmagnet_batch_updated'));
      }
    } catch (err) {
      console.error('Batches snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'hatchery_batches');
    const saved = localStorage.getItem('chickmagnet_admin_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialBatches);
  });
}

export async function saveBatchToFirestore(batch: any) {
  try {
    const docId = batch.batchId || `batch-${Date.now()}`;
    await setDoc(doc(db, 'hatchery_batches', docId), { ...batch, id: docId, batchId: docId });
    window.dispatchEvent(new Event('chickmagnet_batch_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `hatchery_batches/${batch.batchId}`);
  }
}

// 7. Admin Audit Logs Sync
export function subscribeAuditLogs(
  onUpdate: (logs: any[]) => void,
  initialLogs: any[] = []
) {
  const collectionRef = collection(db, 'admin_audit_logs');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialLogs && initialLogs.length > 0) {
        for (const logItem of initialLogs) {
          const docId = logItem.id || `log-${Date.now()}`;
          await setDoc(doc(db, 'admin_audit_logs', docId), { ...logItem, id: docId });
        }
        onUpdate(initialLogs);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_audit_logs', JSON.stringify(items));
      }
    } catch (err) {
      console.error('Audit logs snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'admin_audit_logs');
    const saved = localStorage.getItem('chickmagnet_admin_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialLogs);
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

// 8. CMS Blocks Global Realtime Sync
export function subscribeCMSBlocks() {
  const collectionRef = collection(db, 'cms_blocks');

  return onSnapshot(collectionRef, (snapshot) => {
    try {
      if (!snapshot.empty) {
        const currentBlocks = getStoredCMSData();
        const map = new Map(currentBlocks.map(b => [b.id, b]));
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.id) {
            const existing = map.get(data.id);
            map.set(data.id, {
              id: data.id,
              pageId: data.pageId || existing?.pageId || 'global',
              label: data.label || existing?.label || data.id,
              type: data.type || existing?.type || 'text',
              value: data.value !== undefined ? data.value : existing?.value,
              lastEditedBy: data.lastEditedBy || existing?.lastEditedBy,
              lastEditedAt: data.lastEditedAt || existing?.lastEditedAt,
              history: data.history || existing?.history || []
            });
          }
        });
        saveStoredCMSData(Array.from(map.values()));
      }
    } catch (err) {
      console.error('Error syncing CMS blocks snapshot:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'cms_blocks');
  });
}
