import type { Product } from '../types';
import { INITIAL_PRODUCTS as LEGACY_INITIAL_PRODUCTS } from './products';
import { createBreedProductGuide, createChickenFarmCareSections, createFreshPoultryGuide } from '../utils/productGuides';

const LIVE_CHICKEN_IMAGE = '/images/chickmagnet-live-chicken.jpg';
const EGGS_IMAGE = '/images/catalog/eggs.jpg';
const WHOLE_CHICKEN_IMAGE = '/images/catalog/whole-chicken-pack.jpg';
const CUTS_IMAGE = '/images/catalog/mixed-cuts-pack.jpg';

const BREED_IMAGES = {
  'Improved Kienyeji': '/images/catalog/improved-kienyeji.jpg',
  Sasso: '/images/catalog/sasso.jpg',
  Kenbro: '/images/catalog/kenbro.jpg',
  Kuroiler: '/images/catalog/kuroiler.jpg',
} as const;

const BREED_CHICK_IMAGES: Record<keyof typeof BREED_IMAGES, string> = {
  'Improved Kienyeji': '/images/catalog/chicks-improved-kienyeji.jpg',
  Sasso: '/images/catalog/chicks-sasso.jpg',
  Kenbro: '/images/catalog/chicks-kenbro.jpg',
  Kuroiler: '/images/catalog/chicks-kuroiler.jpg',
};

type ProductInput = Pick<
  Product,
  'id' | 'name' | 'description' | 'price' | 'category' | 'subCategory' | 'image' | 'fulfillmentType'
> & Partial<Product>;

function catalogProduct(input: ProductInput): Product {
  return {
    rating: 4.8,
    reviewsCount: 0,
    sellerName: 'ChickMagnet',
    sellerId: 'chickmagnet',
    sellerBadge: 'Sold by ChickMagnet',
    stock: 100,
    tags: [],
    showOnStorefront: true,
    minOrderQty: 1,
    ...input,
  };
}

export const KIENYEJI_AGE_PRICES = [
  { label: 'Day-old', ageWeeks: 0, price: 110 },
  { label: '1 Week', ageWeeks: 1, price: 160 },
  { label: '2 Weeks', ageWeeks: 2, price: 200 },
  { label: '3 Weeks', ageWeeks: 3, price: 250 },
  { label: '1 Month (4 Weeks)', ageWeeks: 4, price: 350 },
  { label: '5 Weeks', ageWeeks: 5, price: 430 },
  { label: '6 Weeks', ageWeeks: 6, price: 510 },
  { label: '7 Weeks', ageWeeks: 7, price: 590 },
  { label: '8 Weeks', ageWeeks: 8, price: 670 },
  { label: '9 Weeks', ageWeeks: 9, price: 750 },
  { label: '10 Weeks', ageWeeks: 10, price: 830 },
  { label: '11 Weeks', ageWeeks: 11, price: 910 },
  { label: '12 Weeks', ageWeeks: 12, price: 990 },
  { label: '13 Weeks', ageWeeks: 13, price: 1_070 },
  { label: '14 Weeks', ageWeeks: 14, price: 1_150 },
  { label: '15 Weeks', ageWeeks: 15, price: 1_200 },
  { label: '16 Weeks', ageWeeks: 16, price: 1_200 },
  { label: '17 Weeks', ageWeeks: 17, price: 1_200 },
  { label: '18 Weeks', ageWeeks: 18, price: 1_200 },
] as const;

const ONE_TO_TWO_WEEKS = KIENYEJI_AGE_PRICES.slice(1, 3).map(option => ({ ...option }));
const THREE_TO_EIGHTEEN_WEEKS = KIENYEJI_AGE_PRICES.slice(3).map(option => ({ ...option }));

function makeBreedProducts(breed: keyof typeof BREED_IMAGES, order: number): Product[] {
  const slug = breed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const common = {
    category: 'live-birds' as const,
    sellerName: 'ChickMagnet',
    sellerId: 'chickmagnet',
    sellerBadge: 'Sold by ChickMagnet',
    salesChannels: ['wholesale'] as Array<'wholesale'>,
    unit: 'bird',
    wholesaleMinQty: 10,
    minOrderQty: 1,
    stock: 500,
    rating: 4.8,
    reviewsCount: 0,
    fulfillmentType: 'live-climate' as const,
    tags: [breed, 'Improved Kienyeji', 'live chicken'],
  };

  return [
    catalogProduct({
      ...common,
      id: `wholesale-${slug}-day-old`,
      name: `${breed} Day-Old Chicks`,
      description: `Unsexed day-old ${breed} chicks raised on ChickMagnet’s clean farm and given the vaccinations due at hatch.`,
      price: 110,
      subCategory: 'day-old-chicks',
      image: BREED_CHICK_IMAGES[breed],
      productGuide: createBreedProductGuide(breed, 'day-old'),
      searchTerms: [breed, 'day old', 'day-old', 'chicks'],
      displayOrder: order,
    }),
    catalogProduct({
      ...common,
      id: `wholesale-${slug}-one-two-weeks`,
      name: `${breed} Chicks (1 to 2 Weeks)`,
      description: `Choose unsexed ${breed} chicks at one or two weeks old, with every vaccination due by the selected age completed.`,
      price: 160,
      subCategory: 'day-old-chicks',
      image: BREED_CHICK_IMAGES[breed],
      productGuide: createBreedProductGuide(breed, 'one-two-weeks'),
      variantsConfig: { type: 'live', ageOptions: ONE_TO_TWO_WEEKS },
      searchTerms: [breed, '1 week', '2 weeks', 'one week', 'two weeks', 'chicks'],
      displayOrder: order + 1,
    }),
    catalogProduct({
      ...common,
      id: `wholesale-${slug}-three-eighteen-weeks`,
      name: `${breed} Chickens (3 to 18 Weeks)`,
      description: `Choose unsexed ${breed} chickens from Week 3 through Week 18, with every vaccination due by the selected age completed.`,
      price: 250,
      subCategory: 'growers-broilers',
      image: BREED_IMAGES[breed],
      productGuide: createBreedProductGuide(breed, 'three-eighteen-weeks'),
      variantsConfig: { type: 'live', ageOptions: THREE_TO_EIGHTEEN_WEEKS },
      searchTerms: [breed, 'growers', '3 weeks', 'one month', '18 weeks', 'live chicken'],
      displayOrder: order + 2,
    }),
  ];
}

const WHOLESALE_BREEDS = (['Improved Kienyeji', 'Sasso', 'Kenbro', 'Kuroiler'] as const)
  .flatMap((breed, index) => makeBreedProducts(breed, 100 + index * 10));

const CUT_COOKING_USES: Record<string, string[]> = {
  'Whole Dressed Chicken': ['Roast whole with herbs and vegetables.', 'Cut into portions for stew, curry or frying.', 'Use the frame and bones for stock.'],
  'Whole Kuroiler Chicken': ['Slow-cook in stew or curry for a tender result.', 'Roast at a moderate heat and allow time for the firmer meat.', 'Use the bones for a rich stock.'],
  'Chicken Mix': ['Make a family stew or curry with mixed textures.', 'Season and oven-roast as assorted portions.', 'Divide between a quick meal and stock.'],
  'Boneless Chicken Breast': ['Pan-sear or grill for a quick meal.', 'Slice for stir-fry, wraps or salads.', 'Avoid overcooking to retain moisture.'],
  'Chicken Drumsticks': ['Oven-roast with a dry rub or sauce.', 'Grill or braise until tender.', 'Use in stew when you want bone-in flavour.'],
  'Chicken Thigh Quarters': ['Roast or grill for juicy dark meat.', 'Braise in stew or curry.', 'Marinate before cooking for deeper flavour.'],
  'Chicken Leg Quarters': ['Roast as generous individual portions.', 'Grill over moderate heat.', 'Slow-cook in stew or curry.'],
  'Chicken Wings': ['Bake or air-fry until crisp.', 'Grill with a glaze.', 'Use for stock or soup.'],
  'Boneless Chicken Thigh': ['Pan-fry or grill for tender, quick-cooking meat.', 'Dice for curry or stir-fry.', 'Use for skewers or wraps.'],
  'Chicken Liver': ['Pan-fry quickly with onions.', 'Add to gravy, stew or pâté.', 'Cook through without drying it out.'],
  'Chicken Strips': ['Stir-fry with vegetables.', 'Use in wraps, salads or pasta.', 'Season and pan-fry for a quick meal.'],
  'Bone-In Chicken Thigh': ['Braise slowly in stew or curry.', 'Roast for juicy meat and crisp skin.', 'Grill after marinating.'],
  'Chicken Gizzards': ['Simmer until tender, then fry or grill.', 'Slow-cook in stew.', 'Slice after cooking for a warm salad or snack.'],
  'Chicken Mince': ['Shape into meatballs, patties or kebabs.', 'Use in samosas, pies or stuffed vegetables.', 'Brown thoroughly for pasta sauce or rice dishes.'],
  'Chicken Breast Quarter': ['Roast as a bone-in portion.', 'Braise in stew or curry.', 'Grill over moderate heat.'],
  'Bone-In Chicken Leg': ['Roast or grill as an individual portion.', 'Braise slowly in stew.', 'Marinate before cooking.'],
  'Boneless Chicken Leg': ['Pan-fry or grill for a quick meal.', 'Dice for curry, kebabs or stir-fry.', 'Use in wraps and rice dishes.'],
};

const retailCut = (
  id: string,
  name: string,
  description: string,
  price: number,
  unit: string,
  displayOrder: number,
  image = CUTS_IMAGE,
  imagePosition = '50% 50%',
  subCategory: Product['subCategory'] = 'cuts',
) => catalogProduct({
  id,
  name,
  description,
  price,
  category: 'fresh-poultry',
  subCategory,
  image,
  imagePosition,
  fulfillmentType: 'chilled-express',
  salesChannels: ['retail'],
  unit,
  tags: ['fresh chicken', 'chicken cuts', name],
  searchTerms: name.toLowerCase().split(/\s+/),
  displayOrder,
  productGuide: createFreshPoultryGuide(
    description,
    unit === 'whole chicken' ? 'one whole chicken' : unit,
    CUT_COOKING_USES[name] ?? ['Roast or grill.', 'Cook in stew or curry.'],
  ),
});

const retailMatureBreed = (
  breed: keyof typeof BREED_IMAGES,
  displayOrder: number,
) => catalogProduct({
  id: `retail-mature-${breed.toLowerCase().replace(/\s+/g, '-')}`,
  name: `Mature ${breed} Chicken`,
  description: `A mature ${breed} chicken raised on ChickMagnet’s clean farm with age-appropriate vaccinations completed.`,
  price: 1_200,
  category: 'live-birds',
  subCategory: 'growers-broilers',
  image: BREED_IMAGES[breed],
  fulfillmentType: 'live-climate',
  salesChannels: ['retail'],
  unit: 'bird',
  tags: ['live chicken', 'mature chicken', breed],
  searchTerms: [breed, 'live chicken', 'mature'],
  displayOrder,
  productGuide: createBreedProductGuide(breed, 'mature'),
});

export const STOREFRONT_PRODUCTS: Product[] = [
  catalogProduct({
    id: 'retail-live-kienyeji',
    name: 'Mature Improved Kienyeji Chicken',
    description: 'A mature Improved Kienyeji chicken raised on ChickMagnet’s clean farm with age-appropriate vaccinations completed.',
    price: 1_200,
    category: 'live-birds',
    subCategory: 'growers-broilers',
    image: BREED_IMAGES['Improved Kienyeji'],
    fulfillmentType: 'live-climate',
    salesChannels: ['retail'],
    unit: 'bird',
    tags: ['live chicken', 'mature chicken', 'Improved Kienyeji'],
    searchTerms: ['live chicken', 'kienyeji', 'mature'],
    displayOrder: 1,
    productGuide: createBreedProductGuide('Improved Kienyeji', 'mature'),
  }),
  retailMatureBreed('Sasso', 2),
  retailMatureBreed('Kenbro', 3),
  retailMatureBreed('Kuroiler', 4),
  catalogProduct({
    id: 'mature-broiler-chicken',
    name: 'Mature Broiler Chicken',
    description: 'A mature broiler raised on ChickMagnet’s clean farm with age-appropriate vaccinations completed, sold per bird.',
    price: 600,
    category: 'live-birds',
    subCategory: 'growers-broilers',
    image: LIVE_CHICKEN_IMAGE,
    fulfillmentType: 'live-climate',
    salesChannels: ['retail', 'wholesale'],
    unit: 'bird',
    wholesaleMinQty: 10,
    tags: ['live chicken', 'broiler', 'mature'],
    searchTerms: ['broiler', 'live chicken', 'mature'],
    displayOrder: 5,
    productGuide: {
      intro: 'A mature broiler is a specialised meat chicken selected for efficient growth. This is the clearest choice when the goal is meat rather than a future laying flock.',
      highlights: [
        { label: 'Purpose', value: 'Meat production' },
        { label: 'Sold as', value: 'One live bird' },
        { label: 'Key difference', value: 'Faster-growing meat type' },
        { label: 'Sex', value: 'Unsexed, balanced where possible' },
      ],
      sections: [
        {
          title: 'What is a broiler?',
          summary: 'A broiler is bred primarily for meat. Unlike Sasso, Kenbro, Kuroiler and Improved Kienyeji, it is not intended as a balanced meat-and-egg bird.',
        },
        {
          title: 'Who is it best for?',
          bullets: ['Buyers who want a mature live chicken for meat.', 'Farmers with a clear plan for final handling or processing.', 'Customers who value predictable meat yield over laying potential.'],
        },
        {
          title: 'Before you order',
          bullets: ['Prepare clean, ventilated holding space and water.', 'Ask ChickMagnet about the current batch age and average size.', 'Plan humane transport and processing before collection or delivery.'],
        },
        ...createChickenFarmCareSections('mature'),
      ],
      note: 'Broilers still require careful feed, water, ventilation and health management. They are not a low-input substitute for an indigenous-type bird. Birds are sold unsexed, with no sex guarantee, although ChickMagnet tries to balance male and female birds where possible.',
    },
  }),
  catalogProduct({
    id: 'eggs-tray-30',
    name: 'Fresh Eggs',
    description: 'Thirty fresh chicken eggs packed in one tray.',
    price: 400,
    category: 'eggs',
    subCategory: 'table-eggs',
    image: EGGS_IMAGE,
    fulfillmentType: 'dry-ambient',
    salesChannels: ['retail', 'wholesale'],
    unit: 'tray',
    wholesaleMinQty: 5,
    tags: ['eggs', 'tray of 30', 'fresh eggs'],
    searchTerms: ['eggs', 'tray', '30 eggs'],
    displayOrder: 6,
    productGuide: {
      intro: 'One tray containing 30 fresh chicken eggs for everyday cooking, breakfast and baking.',
      highlights: [
        { label: 'Pack size', value: '30 eggs' },
        { label: 'Sold as', value: 'One tray' },
        { label: 'Best for', value: 'Cooking and baking' },
      ],
      sections: [
        { title: 'What you receive', summary: 'Thirty chicken eggs packed in a protective tray. Check the tray when it arrives and report any cracked eggs promptly.' },
        { title: 'Ways to use them', bullets: ['Breakfast and everyday meals.', 'Cakes, bread and other baking.', 'Boiled eggs for meal preparation.'] },
        { title: 'Storage and handling', bullets: ['Keep the tray clean, dry and away from direct heat.', 'Follow the date and storage guidance on the pack.', 'Discard badly cracked eggs and cook eggs thoroughly when serving people at higher risk of foodborne illness.'] },
      ],
    },
  }),
  retailCut('whole-dressed-chicken', 'Whole Dressed Chicken', 'A cleaned whole chicken, average weight 1.2 to 1.5 kg, packed chilled.', 969, 'whole chicken', 10, WHOLE_CHICKEN_IMAGE, '50% 50%', 'whole-dressed'),
  retailCut('whole-kuroiler-chicken', 'Whole Kuroiler Chicken', 'A cleaned whole Kuroiler chicken, approximately 1.5 kg, packed chilled.', 1_399, 'whole chicken', 11, WHOLE_CHICKEN_IMAGE, '50% 50%', 'whole-dressed'),
  retailCut('chicken-mix-1kg', 'Chicken Mix', 'An assortment of fresh chicken portions in a 1 kg pack.', 649, 'kg', 12),
  retailCut('boneless-chicken-breast-500g', 'Boneless Chicken Breast', 'Boneless chicken breast packed in a 500 g tray.', 599, '500g', 13, '/images/catalog/breast-pack.jpg'),
  retailCut('chicken-drumsticks-500g', 'Chicken Drumsticks', 'Chicken drumsticks packed in a 500 g tray.', 559, '500g', 14, '/images/catalog/drumstick-pack.jpg'),
  retailCut('chicken-thigh-quarter-500g', 'Chicken Thigh Quarters', 'Chicken thigh quarters packed in a 500 g tray.', 499, '500g', 15, '/images/catalog/thigh-leg-pack.jpg'),
  retailCut('chicken-leg-quarter-500g', 'Chicken Leg Quarters', 'Chicken leg quarters packed in a 500 g tray.', 475, '500g', 16, '/images/catalog/thigh-leg-pack.jpg'),
  retailCut('chicken-wings-500g', 'Chicken Wings', 'Chicken wings packed in a 500 g tray.', 419, '500g', 17, '/images/catalog/wings-pack.jpg'),
  retailCut('boneless-chicken-thigh-500g', 'Boneless Chicken Thigh', 'Boneless chicken thigh packed in a 500 g tray.', 499, '500g', 18, '/images/catalog/thigh-leg-pack.jpg'),
  retailCut('chicken-liver-500g', 'Chicken Liver', 'Clean chicken liver packed in a 500 g tray.', 299, '500g', 19, '/images/catalog/offal-pack.jpg', '50% 50%', 'giblets-offal'),
  retailCut('chicken-strips-500g', 'Chicken Strips', 'Fresh chicken strips packed in a 500 g tray.', 584, '500g', 20, '/images/catalog/mixed-cuts-pack.jpg'),
  retailCut('bone-in-chicken-thigh-500g', 'Bone-In Chicken Thigh', 'Bone-in chicken thighs packed in a 500 g tray.', 539, '500g', 21, '/images/catalog/thigh-leg-pack.jpg'),
  retailCut('chicken-gizzards-500g', 'Chicken Gizzards', 'Clean chicken gizzards packed in a 500 g tray.', 469, '500g', 22, '/images/catalog/offal-pack.jpg', '50% 50%', 'giblets-offal'),
  retailCut('chicken-mince-500g', 'Chicken Mince', 'Fresh chicken mince packed in a 500 g tray.', 535, '500g', 23, '/images/catalog/mixed-cuts-pack.jpg'),
  retailCut('chicken-breast-quarter-500g', 'Chicken Breast Quarter', 'Chicken breast quarters packed in a 500 g tray.', 399, '500g', 24, '/images/catalog/breast-pack.jpg'),
  retailCut('bone-in-chicken-leg-500g', 'Bone-In Chicken Leg', 'Bone-in chicken legs packed in a 500 g tray.', 535, '500g', 25, '/images/catalog/thigh-leg-pack.jpg'),
  retailCut('boneless-chicken-leg-500g', 'Boneless Chicken Leg', 'Boneless chicken leg meat packed in a 500 g tray.', 584, '500g', 26, '/images/catalog/thigh-leg-pack.jpg'),
  catalogProduct({
    id: 'retail-live-turkey',
    name: 'Mature Turkey',
    description: 'A mature turkey, sold per bird.',
    price: 7_000,
    category: 'live-birds',
    subCategory: 'breeding-stock',
    image: '/images/catalog/live-turkey.jpg',
    fulfillmentType: 'live-climate',
    salesChannels: ['retail'],
    unit: 'bird',
    tags: ['turkey', 'live turkey'],
    searchTerms: ['turkey', 'live'],
    displayOrder: 30,
    productGuide: {
      intro: 'A mature live turkey for retail customers who have suitable housing and a clear transport or processing plan.',
      highlights: [
        { label: 'Sold as', value: 'One live bird' },
        { label: 'Availability', value: 'Retail only' },
        { label: 'Before arrival', value: 'Prepare secure housing' },
      ],
      sections: [
        { title: 'What to expect', summary: 'Turkeys are larger than chickens and need more floor space, stronger handling and secure transport. Ask for the current bird size before ordering.' },
        { title: 'Before you order', bullets: ['Prepare a dry, ventilated and predator-secure holding area.', 'Provide clean water immediately on arrival.', 'Plan transport and handling for a large live bird.'] },
      ],
      note: 'Ask ChickMagnet about the current bird age, approximate size and health records before confirming your order.',
    },
  }),
  catalogProduct({
    id: 'retail-dressed-turkey',
    name: 'Whole Dressed Turkey',
    description: 'A cleaned whole turkey packed chilled.',
    price: 8_500,
    category: 'fresh-poultry',
    subCategory: 'whole-dressed',
    image: '/images/catalog/dressed-turkey.jpg',
    fulfillmentType: 'chilled-express',
    salesChannels: ['retail'],
    unit: 'bird',
    tags: ['turkey', 'dressed turkey'],
    searchTerms: ['turkey', 'dressed turkey'],
    displayOrder: 31,
    productGuide: createFreshPoultryGuide(
      'A cleaned whole turkey packed chilled.',
      'one whole turkey',
      ['Roast whole for a large meal.', 'Portion before cooking when a whole bird is too large.', 'Use the frame and bones for stock.'],
    ),
  }),
  ...WHOLESALE_BREEDS,
].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

export const STOREFRONT_PRODUCT_IDS = new Set(STOREFRONT_PRODUCTS.map(product => product.id));

// Old seeded marketplace products must not reappear from a stale browser cache
// or an old Firestore document. New CMS-created products remain publishable.
export const LEGACY_STOREFRONT_PRODUCT_IDS = new Set(
  LEGACY_INITIAL_PRODUCTS.map(product => product.id),
);
