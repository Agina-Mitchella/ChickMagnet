import {
  collection, doc, setDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { getStoredCMSData, saveStoredCMSData, CMSBlock } from '../utils/cms';

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

// 1. Products Realtime Sync
export function subscribeProducts(
  onUpdate: (products: Product[]) => void
) {
  const collectionRef = collection(db, 'products');
  
  const unsubscribe = onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty) {
        console.log('Seeding initial products to Firestore...');
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }
        onUpdate(INITIAL_PRODUCTS);
        safeSetLocalStorage('chickmagnet_products', JSON.stringify(INITIAL_PRODUCTS));
      } else {
        const initialImageMap = new Map(INITIAL_PRODUCTS.map(ip => [ip.id, ip.image]));
        const items: Product[] = snapshot.docs.map(d => {
          const data = d.data() as Product;
          return {
            id: d.id,
            ...data,
            image: data.image || initialImageMap.get(d.id) || ''
          };
        });
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_products', JSON.stringify(items));
        window.dispatchEvent(new Event('chickmagnet_products_updated'));
      }
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
          onUpdate(parsed);
          return;
        }
      } catch {}
    }
    onUpdate(INITIAL_PRODUCTS);
  });

  return unsubscribe;
}

export async function saveProductToFirestore(product: Product) {
  try {
    await setDoc(doc(db, 'products', product.id), product);
    safeSetLocalStorage('chickmagnet_products_last_update', Date.now().toString());
    window.dispatchEvent(new Event('chickmagnet_products_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(db, 'products', productId));
    window.dispatchEvent(new Event('chickmagnet_products_updated'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

// 2. Orders Realtime Sync
export function subscribeOrders(
  onUpdate: (orders: any[]) => void,
  initialOrders: any[] = []
) {
  const collectionRef = collection(db, 'orders');

  return onSnapshot(collectionRef, async (snapshot) => {
    try {
      if (snapshot.empty && initialOrders && initialOrders.length > 0) {
        for (const order of initialOrders) {
          const docId = order.id || `order-${Date.now()}-${Math.floor(Math.random()*1000)}`;
          await setDoc(doc(db, 'orders', docId), { ...order, id: docId });
        }
        onUpdate(initialOrders);
      } else {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onUpdate(items);
        safeSetLocalStorage('chickmagnet_admin_orders', JSON.stringify(items));
      }
    } catch (err) {
      console.error('Orders snapshot error:', err);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
    const saved = localStorage.getItem('chickmagnet_admin_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) { onUpdate(parsed); return; }
      } catch {}
    }
    onUpdate(initialOrders);
  });
}

export async function saveOrderToFirestore(order: any) {
  try {
    const docId = order.id || `order-${Date.now()}`;
    await setDoc(doc(db, 'orders', docId), { ...order, id: docId });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
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
