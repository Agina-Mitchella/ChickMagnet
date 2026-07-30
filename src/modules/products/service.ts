import { prisma } from '../../config/index.ts';
import { INITIAL_PRODUCTS } from '../../data/products.ts';

export function mapProductToFrontend(p: any): any {
  if (!p) return null;
  
  // If it is already fully formatted for the frontend
  if (p.name && p.backstory && p.origin) {
    return p;
  }

  // Categories mapping to match frontend display categories
  const categoryMap: Record<string, string> = {
    'WANDERING_WEARABLES': 'Wandering Wearables',
    'ENCHANTED_DECOR': 'Enchanted Decor',
    'OUTDOOR_MAGIC': 'Outdoor Magic',
    'PIXIE_POTIONS_AND_BALMS': 'Pixie Potions & Balms'
  };

  const category = categoryMap[p.category] || p.category || 'Enchanted Decor';

  // Materials list by category
  let defaultMaterials = ['Faerielight Filaments', 'Oak Base'];
  if (category.toLowerCase().includes('wearable')) {
    defaultMaterials = ['Tree Amber Resin', 'Calendula Petal', 'Hand-Spun Silk Cord'];
  } else if (category.toLowerCase().includes('balm') || category.toLowerCase().includes('potion')) {
    defaultMaterials = ['Thistle-Silk Thread', 'Dehydrated Chamomile Flowers', 'Linen Backing'];
  } else if (category.toLowerCase().includes('outdoor')) {
    defaultMaterials = ['Dehydrated Sweet Orange Shards', 'Fired Cream Terracotta', 'Hemp Twine'];
  }

  const materials = p.tags && p.tags.length > 0 
    ? p.tags.map((t: any) => typeof t === 'string' ? t : t.name) 
    : defaultMaterials;

  // Background colors
  let bgColor = 'from-orange-50 to-amber-100 border-amber-200';
  if (category.toLowerCase().includes('outdoor')) {
    bgColor = 'from-orange-100 to-cream-200 border-orange-200';
  } else if (category.toLowerCase().includes('wearable')) {
    bgColor = 'from-amber-50 to-orange-100 border-amber-300';
  } else if (category.toLowerCase().includes('balm') || category.toLowerCase().includes('potion')) {
    bgColor = 'from-orange-50 to-amber-50 border-orange-200';
  }

  // Origin extraction from backstory / originStory
  let origin = 'Location';
  if (p.originStory) {
    if (p.originStory.toLowerCase().includes('amberwood')) {
      origin = 'Location';
    } else if (p.originStory.toLowerCase().includes('emberglow')) {
      origin = 'Emberglow Orchards';
    } else if (p.originStory.toLowerCase().includes('meadow')) {
      origin = 'Sun-Drenched Meadows';
    } else if (p.originStory.toLowerCase().includes('slumber')) {
      origin = 'Sylvan Slumber Market';
    } else if (p.originStory.toLowerCase().includes('creek')) {
      origin = 'Pixie Creek Falls';
    } else {
      const match = p.originStory.match(/in the ([A-Za-z\s]+)(?=\b|\.|\,)/i);
      if (match && match[1]) {
        origin = match[1].trim();
      }
    }
  } else if (p.maker?.shopName) {
    origin = p.maker.shopName;
  }

  // Stock
  const stock = p.stockQuantity !== undefined ? p.stockQuantity : 5;

  // Seller Name
  const sellerName = p.maker?.user?.name || p.maker?.shopName || 'Amani & Zawadi Fine Crafts';

  // Backstory / originStory fallback
  const backstory = p.originStory || 'Formed by hand under optimal astral coordinates.';

  // Images
  let images = ['✨'];
  if (p.images) {
    if (Array.isArray(p.images)) {
      images = p.images;
    } else {
      try {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(parsed)) {
          images = parsed;
        }
      } catch (e) {
        images = [p.images];
      }
    }
  }

  // Tags
  const tags = p.tags && p.tags.length > 0 
    ? p.tags.map((t: any) => typeof t === 'string' ? t : t.name) 
    : ['enchanted'];

  return {
    id: p.id,
    name: p.title || 'Enchanted Wonder',
    description: p.description || '',
    price: p.price ? p.price / 100 : 3500, // db price in minor units -> convert to shillings
    rating: p.rating || (4.5 + (p.id.charCodeAt(0) % 6) / 10),
    reviewsCount: p.reviewsCount || (p.reviews ? p.reviews.length : 12),
    category,
    materials,
    origin,
    bgColor,
    stock,
    backstory,
    magicalStats: p.magicalStats || [
      { name: 'Warmth Aura', value: '+12 Cozy' },
      { name: 'Dream Shield', value: '100% Ward' }
    ],
    sellerName,
    type: p.productType === 'DIGITAL' ? 'digital' : 'handmade',
    images,
    tags
  };
}

export const findAll = async (query: any = {}): Promise<any[]> => {
  const { category, intention, q } = query;
  const where: any = { deletedAt: null, isActive: true };
  
  if (category) {
    // Convert display category to DB enum if needed
    const dbCategoryMap: Record<string, string> = {
      'Wandering Wearables': 'WANDERING_WEARABLES',
      'Enchanted Decor': 'ENCHANTED_DECOR',
      'Outdoor Magic': 'OUTDOOR_MAGIC',
      'Pixie Potions & Balms': 'PIXIE_POTIONS_AND_BALMS'
    };
    where.category = dbCategoryMap[category] || category;
  }
  
  if (intention) {
    where.intention = intention;
  }
  
  if (q) {
    where.OR = [
      { title: { contains: q as string, mode: 'insensitive' } },
      { description: { contains: q as string, mode: 'insensitive' } }
    ];
  }

  try {
    const dbProducts = await prisma.product.findMany({
      where,
      orderBy: { visibilityScore: 'desc' },
      include: {
        keeper: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        tags: true,
        reviews: true
      }
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(mapProductToFrontend);
    }
  } catch (error) {
    console.error('Failed to fetch products from DB, falling back to initial mock products:', error);
  }

  // Fallback to initial mock products if DB is empty or fails
  let filteredMock = [...INITIAL_PRODUCTS];
  if (category) {
    filteredMock = filteredMock.filter(p => p.category === category);
  }
  if (q) {
    const search = q.toLowerCase();
    filteredMock = filteredMock.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.description.toLowerCase().includes(search)
    );
  }
  return filteredMock;
};

export const findById = async (id: string): Promise<any> => {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        keeper: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        tags: true,
        reviews: true
      }
    });

    if (dbProduct) {
      return mapProductToFrontend(dbProduct);
    }
  } catch (error) {
    console.error(`Failed to fetch product ${id} from DB:`, error);
  }

  // Fallback to mock products
  return INITIAL_PRODUCTS.find(p => p.id === id) || null;
};
