import { useEffect, useState } from 'react';

export const DEFAULT_BRAND_LOGO_IMAGE = '/images/chickmagnet-logo.webp';

export type CMSBlockType = 'text' | 'image';

export interface CMSHistoryEntry {
  id: string;
  timestamp: string;
  adminName: string;
  oldValue: string;
  newValue: string;
}

export interface CMSBlock {
  id: string;
  pageId: 'global';
  label: string;
  type: CMSBlockType;
  value: string;
  lastEditedBy: string;
  lastEditedAt: string;
  history: CMSHistoryEntry[];
}

const LOCAL_STORAGE_KEY = 'chickmagnet_cms_blocks';
const CMS_UPDATED_EVENT = 'sol_cms_updated';

export const DEFAULT_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'global_logo_image_url',
    pageId: 'global',
    label: 'Logo image',
    type: 'image',
    value: DEFAULT_BRAND_LOGO_IMAGE,
    lastEditedBy: '',
    lastEditedAt: '',
    history: [],
  },
  {
    id: 'global_platform_name',
    pageId: 'global',
    label: 'Brand name',
    type: 'text',
    value: 'ChickMagnet',
    lastEditedBy: '',
    lastEditedAt: '',
    history: [],
  },
];

const BRAND_BLOCK_IDS = new Set(DEFAULT_CMS_BLOCKS.map(block => block.id));

function normalizeBrandBlocks(blocks: CMSBlock[]): CMSBlock[] {
  const storedById = new Map(
    blocks
      .filter(block => BRAND_BLOCK_IDS.has(block.id))
      .map(block => [block.id, block]),
  );

  return DEFAULT_CMS_BLOCKS.map(defaultBlock => ({
    ...defaultBlock,
    ...(storedById.get(defaultBlock.id) ?? {}),
    id: defaultBlock.id,
    pageId: 'global',
    history: storedById.get(defaultBlock.id)?.history ?? [],
  }));
}

export const getStoredCMSData = (): CMSBlock[] => {
  if (typeof window === 'undefined') return normalizeBrandBlocks([]);

  try {
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return normalizeBrandBlocks([]);

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? normalizeBrandBlocks(parsed) : normalizeBrandBlocks([]);
  } catch (error) {
    console.warn('Ignoring invalid CMS data in browser storage.', error);
    return normalizeBrandBlocks([]);
  }
};

export const saveStoredCMSData = (blocks: CMSBlock[]) => {
  if (typeof window === 'undefined') return;

  const normalizedBlocks = normalizeBrandBlocks(blocks);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedBlocks));
  window.dispatchEvent(new Event(CMS_UPDATED_EVENT));
};

export const updateCMSBlock = async (
  blockId: string,
  newValue: string,
  adminName = 'Admin',
) => {
  if (!BRAND_BLOCK_IDS.has(blockId)) {
    throw new Error(`Unsupported CMS block: ${blockId}`);
  }

  const blocks = getStoredCMSData();
  const blockIndex = blocks.findIndex(block => block.id === blockId);
  const existing = blocks[blockIndex];
  const timestamp = new Date().toISOString();
  const updatedBlock: CMSBlock = {
    ...existing,
    value: newValue,
    lastEditedBy: adminName,
    lastEditedAt: timestamp,
    history: [
      {
        id: `history-${Date.now()}`,
        timestamp,
        adminName,
        oldValue: existing.value,
        newValue,
      },
      ...existing.history,
    ].slice(0, 20),
  };

  blocks[blockIndex] = updatedBlock;
  saveStoredCMSData(blocks);

  try {
    const [{ doc, setDoc }, { db }] = await Promise.all([
      import('firebase/firestore'),
      import('../config/firebaseDb'),
    ]);
    await setDoc(doc(db, 'cms_blocks', blockId), {
      id: updatedBlock.id,
      pageId: updatedBlock.pageId,
      label: updatedBlock.label,
      type: updatedBlock.type,
      value: updatedBlock.value,
      lastEditedBy: updatedBlock.lastEditedBy,
      lastEditedAt: updatedBlock.lastEditedAt,
    }, { merge: true });
  } catch (error) {
    saveStoredCMSData(blocks.map(block => (
      block.id === blockId ? existing : block
    )));
    console.warn(`CMS block ${blockId} could not be saved.`, error);
    throw new Error('The brand setting could not be saved to Firestore.');
  }
};

export interface BrandLogoConfig {
  logoType: 'emoji' | 'image';
  logoDisplayMode: 'image_only' | 'image_with_text' | 'emoji_with_text';
  logoEmoji: string;
  logoImageUrl: string;
  brandName: string;
}

function getBrandLogoFromBlocks(blocks: CMSBlock[]): BrandLogoConfig {
  const valueFor = (id: string) => blocks.find(block => block.id === id)?.value ?? '';
  const rawLogoUrl = valueFor('global_logo_image_url');
  const usesLegacyDefault = rawLogoUrl.includes('regenerated_image_1787820822648');
  const logoImageUrl = !rawLogoUrl || rawLogoUrl === '/logo.svg' || usesLegacyDefault
    ? DEFAULT_BRAND_LOGO_IMAGE
    : rawLogoUrl;

  return {
    logoType: 'image',
    logoDisplayMode: 'image_only',
    logoEmoji: '🐔',
    logoImageUrl,
    brandName: valueFor('global_platform_name') || 'ChickMagnet',
  };
}

export const getStoredBrandLogo = (): BrandLogoConfig => getBrandLogoFromBlocks(getStoredCMSData());

export const updateBrandLogo = async (config: Partial<BrandLogoConfig>, adminName = 'Admin') => {
  const updates: Array<[string, string]> = [];
  if (config.brandName !== undefined) updates.push(['global_platform_name', config.brandName]);
  if (config.logoImageUrl !== undefined) updates.push(['global_logo_image_url', config.logoImageUrl]);

  for (const [id, value] of updates) {
    await updateCMSBlock(id, value, adminName);
  }
  window.dispatchEvent(new Event('chickmagnet_brand_updated'));
};

export function useBrandLogo(): BrandLogoConfig {
  const [brand, setBrand] = useState(() => getBrandLogoFromBlocks(DEFAULT_CMS_BLOCKS));

  useEffect(() => {
    let disposed = false;
    let unsubscribeRemote = () => {};
    const refresh = () => setBrand(getStoredBrandLogo());
    // Older builds stored sample farm, finance, certification and wholesale
    // records beside the logo. Replace that browser cache with brand data only.
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(getStoredCMSData()));
    refresh();

    void Promise.all([
      import('firebase/firestore'),
      import('../config/firebaseDb'),
    ]).then(([{ collection, documentId, onSnapshot, query, where }, { db }]) => {
      if (disposed) return;
      const brandQuery = query(
        collection(db, 'cms_blocks'),
        where(documentId(), 'in', Array.from(BRAND_BLOCK_IDS)),
      );
      unsubscribeRemote = onSnapshot(brandQuery, snapshot => {
        if (snapshot.empty) return;
        const remoteBlocks = snapshot.docs.map(document => document.data() as CMSBlock);
        saveStoredCMSData(remoteBlocks);
      }, error => {
        console.warn('Brand settings could not be loaded from Firestore.', error);
      });
    }).catch(error => {
      console.warn('Brand settings could not be initialized.', error);
    });

    window.addEventListener(CMS_UPDATED_EVENT, refresh);
    window.addEventListener('chickmagnet_brand_updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      disposed = true;
      unsubscribeRemote();
      window.removeEventListener(CMS_UPDATED_EVENT, refresh);
      window.removeEventListener('chickmagnet_brand_updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return brand;
}
