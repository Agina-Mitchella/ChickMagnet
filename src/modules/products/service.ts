import { prisma } from '../../config/index.ts';

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return value ? [value] : [];
  }
}

export function mapProductToFrontend(product: any): any {
  if (!product) return null;

  const tags = Array.isArray(product.tags)
    ? product.tags
        .map((tag: any) => typeof tag === 'string' ? tag : tag?.name)
        .filter((tag: unknown): tag is string => typeof tag === 'string')
    : [];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const rating = reviews.length > 0
    ? reviews.reduce((total: number, review: any) => total + Number(review.rating || 0), 0) / reviews.length
    : 0;

  return {
    id: String(product.id || ''),
    name: String(product.title || product.name || ''),
    description: String(product.description || ''),
    price: Number(product.price || 0) / 100,
    rating,
    reviewsCount: reviews.length,
    category: String(product.category || ''),
    materials: tags,
    origin: '',
    bgColor: '',
    stock: Number(product.stockQuantity || 0),
    backstory: String(product.originStory || ''),
    magicalStats: [],
    sellerName: String(product.keeper?.shopName || product.keeper?.user?.name || ''),
    type: product.productType === 'DIGITAL' ? 'digital' : 'physical',
    images: readStringArray(product.images),
    tags,
  };
}

export const findAll = async (requestQuery: any = {}): Promise<any[]> => {
  const { category, intention, q } = requestQuery;
  const where: any = { deletedAt: null, isActive: true };

  if (category) where.category = category;
  if (intention) where.intention = intention;
  if (q) {
    where.OR = [
      { title: { contains: String(q), mode: 'insensitive' } },
      { description: { contains: String(q), mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { visibilityScore: 'desc' },
    include: {
      keeper: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      tags: true,
      reviews: true,
    },
  });

  return products.map(mapProductToFrontend);
};

export const findById = async (id: string): Promise<any> => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      keeper: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
      tags: true,
      reviews: true,
    },
  });

  return mapProductToFrontend(product);
};
