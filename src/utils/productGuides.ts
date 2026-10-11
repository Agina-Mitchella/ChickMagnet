import type { Product, ProductGuide } from '../types';

type BreedName = 'Improved Kienyeji' | 'Sasso' | 'Kenbro' | 'Kuroiler';
export type BirdStage = 'day-old' | 'one-two-weeks' | 'three-eighteen-weeks' | 'mature';

const BREED_PROFILES: Record<BreedName, Omit<ProductGuide, 'sections'> & { sections: ProductGuide['sections'] }> = {
  'Improved Kienyeji': {
    intro: 'A Kenyan improved indigenous, dual-purpose chicken for farmers who want both meat and egg potential in a bird suited to smallholder production.',
    highlights: [
      { label: 'Purpose', value: 'Meat and eggs' },
      { label: 'Farm fit', value: 'Backyard or semi-intensive' },
      { label: 'Key difference', value: 'Kenyan improved indigenous type' },
    ],
    sections: [
      {
        title: 'What is Improved Kienyeji?',
        summary: 'Improved Kienyeji chickens are selected from indigenous-type birds to improve growth and egg production while retaining characteristics valued in local farming systems.',
      },
      {
        title: 'Who is it best for?',
        bullets: [
          'Farmers balancing meat sales with future egg production.',
          'Backyard and semi-intensive systems with room for active birds.',
          'Buyers who prefer a locally familiar chicken type over a specialised broiler.',
        ],
      },
      {
        title: 'How is it different?',
        summary: 'It grows more slowly than a specialised broiler but serves both meat and egg goals. Among the four options in this catalogue, it is the most locally rooted choice; actual results still depend on the strain and farm management.',
      },
    ],
    note: 'Growth, laying and survival depend on feed, housing, vaccination, weather and day-to-day flock management. Ask ChickMagnet about the current batch before ordering.',
  },
  Sasso: {
    intro: 'A coloured dual-purpose chicken selected for useful meat growth and egg production in varied farming environments.',
    highlights: [
      { label: 'Purpose', value: 'Meat and eggs' },
      { label: 'Farm fit', value: 'Semi-intensive or free-range' },
      { label: 'Key difference', value: 'Meat-forward dual purpose' },
    ],
    sections: [
      {
        title: 'What is Sasso?',
        summary: 'Sasso refers to a family of coloured chickens bred for traditional poultry markets. The dual-purpose lines are intended to give farmers a practical balance of body growth, livability and egg potential.',
      },
      {
        title: 'Who is it best for?',
        bullets: [
          'Farmers who want a dual-purpose flock with a stronger meat focus.',
          'Systems that combine housing, balanced feed and controlled outdoor access.',
          'Markets that prefer coloured birds with a traditional appearance.',
        ],
      },
      {
        title: 'How is it different?',
        summary: 'Sasso is often chosen when body growth is a priority without moving to a specialised broiler. Kenbro is another free-range dual-purpose option, while Kuroiler is widely used in lower-input and semi-intensive systems. The exact Sasso line and management plan matter.',
      },
    ],
    note: 'No chicken is disease-proof. Good brooding, vaccination, hygiene, feed and water remain essential. Ask ChickMagnet which Sasso line is in the current batch.',
  },
  Kenbro: {
    intro: 'A free-range, dual-purpose chicken used for both meat and eggs, with a strong fit for farmers who do not need the speed of a commercial broiler.',
    highlights: [
      { label: 'Purpose', value: 'Meat and eggs' },
      { label: 'Farm fit', value: 'Free-range or semi-intensive' },
      { label: 'Key difference', value: 'Balanced, familiar all-rounder' },
    ],
    sections: [
      {
        title: 'What is Kenbro?',
        summary: 'Kenbro is a robust dual-purpose bird developed for meat or egg production. It is commonly managed in free-range and semi-intensive systems and is not a replacement for a specialised commercial broiler or layer.',
      },
      {
        title: 'Who is it best for?',
        bullets: [
          'Farmers who want one flock with both meat and laying potential.',
          'Live-bird markets and buyers who prefer a slower-grown chicken.',
          'Farmers able to provide supplementary feed, vaccination and secure housing.',
        ],
      },
      {
        title: 'How is it different?',
        summary: 'Kenbro is a balanced all-rounder. It is slower than a commercial broiler, while Sasso is often selected with more emphasis on meat growth and Kuroiler with more emphasis on low-input adaptability. Kenchic indicates that well-managed Kenbro birds may be ready for sale from about 10 to 14 weeks and may begin laying at about 25 weeks.',
      },
    ],
    note: 'Robust does not mean maintenance-free or disease-proof. Results depend on feed, vaccination, biosecurity, housing and the conditions on your farm.',
  },
  Kuroiler: {
    intro: 'A hardy, coloured dual-purpose chicken developed for rural and backyard production, with useful meat and egg potential under low-input or semi-intensive management.',
    highlights: [
      { label: 'Purpose', value: 'Meat and eggs' },
      { label: 'Farm fit', value: 'Low-input or semi-intensive' },
      { label: 'Key difference', value: 'Active, adaptable forager' },
    ],
    sections: [
      {
        title: 'What is Kuroiler?',
        summary: 'Kuroiler is a multi-coloured hybrid developed for rural poultry systems. It was selected to improve growth and laying over unimproved village birds while retaining active foraging behaviour and hardiness under local conditions.',
      },
      {
        title: 'Who is it best for?',
        bullets: [
          'Backyard farmers who value an active scavenging bird.',
          'Farmers looking for both household eggs and meat sales.',
          'Low-input or semi-intensive systems that still provide supplementary feed and health care.',
        ],
      },
      {
        title: 'How is it different?',
        summary: 'Kuroiler is usually the strongest fit for farmers prioritising foraging and adaptability. Sasso tends to be more meat-forward, while Kenbro is a balanced free-range all-rounder. Improved Kienyeji is the locally rooted indigenous-type option.',
      },
    ],
    note: 'Low-input does not mean no-input. Reliable water, balanced feed, vaccination, predator protection and dry housing are still necessary.',
  },
};

const STAGE_SECTIONS: Record<BirdStage, ProductGuide['sections'][number]> = {
  'day-old': {
    title: 'What day-old chicks need',
    summary: 'Day-old chicks are the lowest-cost starting point and require the most hands-on brooding.',
    bullets: [
      'Clean and disinfect the brooder, feeders and drinkers before the chicks arrive.',
      'Pre-heat the brooder and check the temperature at chick level. A practical guide is 33 to 35°C in Week 1, reducing gradually as the chicks feather.',
      'Provide dry litter, good ventilation without draughts, clean water and chick starter feed immediately.',
      'Keep backup heat, basic chick-care supplies and the next vaccination dates ready.',
    ],
  },
  'one-two-weeks': {
    title: 'What 1 to 2 week chicks need',
    summary: 'These chicks have passed the first few days but are still in the brooding stage.',
    bullets: [
      'Continue controlled warmth, with enough space for chicks to move toward or away from the heat source.',
      'Maintain clean water, chick starter feed, dry litter and fresh air without cold draughts.',
      'Prepare a separate, secure brooder and avoid mixing the new chicks with an older flock immediately.',
      'Read the batch vaccination record and note the next dose due after delivery.',
    ],
  },
  'three-eighteen-weeks': {
    title: 'Choosing the right age',
    summary: 'Select the exact age before adding to cart. Older birds cost more because more feed, care and time have already gone into raising them.',
    bullets: [
      'Younger growers cost less but need more time and management on your farm.',
      'Older growers reduce the time to market or laying age.',
      'Prepare secure, ventilated housing, age-appropriate feed, clean water and enough feeder and drinker space.',
      'Review the batch vaccination record and plan the next vaccine or booster before arrival.',
    ],
  },
  mature: {
    title: 'Before the bird arrives',
    bullets: [
      'Prepare secure, ventilated housing and clean water.',
      'Introduce new birds gradually and keep them separate from an existing flock at first.',
      'Ask about the current batch age, feed and vaccination history.',
    ],
  },
};

const VACCINATION_SUMMARIES: Record<BirdStage, string> = {
  'day-old': 'Day-old chicks receive the hatchery vaccinations due on Day 1. The standard programme then continues on the buyer’s farm, beginning with the next booster when it becomes due.',
  'one-two-weeks': 'ChickMagnet administers every vaccine due by the selected age. A one-week chick has received its Day 1 vaccines; a two-week chick will also have received the Day 10 to 12 Newcastle and infectious bronchitis booster when due.',
  'three-eighteen-weeks': 'ChickMagnet administers every vaccine due by the exact age selected. The batch record shows what has been given and what the buyer must continue after delivery.',
  mature: 'ChickMagnet administers the age-appropriate chicken vaccines due before sale and provides the current batch record. Newcastle protection still requires regular boosters after the bird leaves the farm.',
};

export function createChickenFarmCareSections(stage: BirdStage): ProductGuide['sections'] {
  return [
    {
      title: 'Vaccinations completed by this age',
      summary: VACCINATION_SUMMARIES[stage],
      bullets: [
        'Day 1: Marek’s disease, Gumboro, Newcastle disease and infectious bronchitis vaccines at the hatchery.',
        'Days 10 to 12: Newcastle disease and infectious bronchitis booster.',
        'Days 18 to 21: Gumboro booster.',
        'Week 6: Fowl pox vaccine.',
        'Week 8: Fowl typhoid vaccine.',
        'Week 18: Newcastle disease booster, then repeat every 3 to 4 months under veterinary guidance.',
      ],
    },
    {
      title: 'How ChickMagnet cares for the flock',
      summary: 'The birds are raised on a clean ChickMagnet farm by trained farm managers who monitor their health, housing, feed and water every day.',
      bullets: [
        'Housing, feeders and drinkers are cleaned and managed to reduce avoidable disease risk.',
        'Birds receive age-appropriate feed, clean water, dry housing and routine observation.',
        'Vaccines are given when due for the bird’s age and recorded for the current batch.',
        'Any bird showing signs of illness is assessed rather than vaccinated while sick.',
      ],
    },
  ];
}

export function createBreedProductGuide(breed: BreedName, stage: BirdStage): ProductGuide {
  const profile = BREED_PROFILES[breed];
  return {
    ...profile,
    highlights: [
      ...(profile.highlights?.map(highlight => ({ ...highlight })) ?? []),
      { label: 'Sex', value: 'Unsexed, balanced where possible' },
    ],
    sections: [
      ...profile.sections.map(section => ({ ...section, bullets: section.bullets ? [...section.bullets] : undefined })),
      { ...STAGE_SECTIONS[stage], bullets: STAGE_SECTIONS[stage].bullets ? [...STAGE_SECTIONS[stage].bullets] : undefined },
      ...createChickenFarmCareSections(stage),
    ],
    note: `${profile.note ?? ''} Chicks are sold unsexed. ChickMagnet does not guarantee sex, but the farm tries to balance male and female chicks where possible. Vaccination timing can be adjusted by a veterinary professional for local disease risk.`,
  };
}

export function createFreshPoultryGuide(
  description: string,
  soldAs: string,
  cookingUses: string[],
): ProductGuide {
  return {
    intro: description,
    highlights: [
      { label: 'Sold as', value: soldAs },
      { label: 'Condition', value: 'Packed chilled' },
      { label: 'Good for', value: cookingUses.slice(0, 2).join(' and ') },
    ],
    sections: [
      {
        title: 'What you receive',
        summary: description,
      },
      {
        title: 'Good ways to cook it',
        bullets: cookingUses,
      },
      {
        title: 'Storage and food safety',
        bullets: [
          'Keep chilled and follow the use-by date on the pack.',
          'Keep raw poultry separate from ready-to-eat food and wash hands and utensils after handling.',
          'Cook thoroughly before serving. Contact ChickMagnet if the pack is damaged or not cold on arrival.',
        ],
      },
    ],
  };
}

export function getProductGuide(product: Product): ProductGuide {
  if (product.productGuide) return product.productGuide;

  if (product.category === 'fresh-poultry') {
    return createFreshPoultryGuide(product.description, product.unit || 'pack', ['stews', 'roasting', 'grilling']);
  }

  if (product.category === 'eggs') {
    return {
      intro: product.description,
      highlights: [
        { label: 'Sold as', value: product.unit || 'tray' },
        { label: 'Best for', value: 'Breakfast and baking' },
      ],
      sections: [
        { title: 'What you receive', summary: product.description },
        { title: 'Storage', bullets: ['Keep the tray clean, dry and away from direct heat.', 'Follow the date and storage guidance on the pack.'] },
      ],
    };
  }

  if (product.category === 'live-birds') {
    return {
      intro: product.description,
      highlights: [
        { label: 'Sold as', value: product.unit || 'bird' },
        { label: 'Before arrival', value: 'Prepare housing and water' },
      ],
      sections: [
        { title: 'About this bird', summary: product.description },
        { ...STAGE_SECTIONS.mature, bullets: [...(STAGE_SECTIONS.mature.bullets ?? [])] },
      ],
      note: 'Ask ChickMagnet about the current batch, health records and recommended care before ordering.',
    };
  }

  return {
    intro: product.description,
    sections: [{ title: 'About this product', summary: product.description }],
  };
}
