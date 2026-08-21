import { Product, FarmSeller, BatchTraceabilityRecord, WholesaleStandingOrder, MortalityClaim, BreedDropdownOption } from '../types';

export const INITIAL_BREED_DROPDOWN_OPTIONS: BreedDropdownOption[] = [
  { id: 'breed-all', label: 'All Poultry & Breeds', breedQuery: '', category: 'all', description: 'Browse entire hatchery & supply catalog', active: true },
  { id: 'breed-kienyeji', label: 'Improved Kienyeji (KALRO)', breedQuery: 'Kienyeji', category: 'live-birds', description: 'Hardy indigenous dual-purpose, 220+ eggs/yr', active: true },
  { id: 'breed-kenbro', label: 'Kenbro Dual-Purpose', breedQuery: 'Kenbro', category: 'live-birds', description: 'Heavy meat & high egg production bird', active: true },
  { id: 'breed-kuroiler', label: 'Kuroiler Heritage', breedQuery: 'Kuroiler', category: 'live-birds', description: 'Rapid growth, scavenger champion, large brown eggs', active: true },
  { id: 'breed-sasso', label: 'Sasso Dual-Purpose', breedQuery: 'Sasso', category: 'live-birds', description: 'French dual-purpose free-range champion', active: true },
  { id: 'breed-broiler', label: 'Cobb 500 Fast Broilers', breedQuery: 'Broiler', category: 'live-birds', description: 'Fast 32-35 day feed conversion meat bird', active: true },
  { id: 'breed-rainbow', label: 'Rainbow Rooster', breedQuery: 'Rainbow Rooster', category: 'live-birds', description: 'High disease resistance, colorful homestead favorite', active: true },
  { id: 'breed-layers', label: 'Point-of-Lay Pullets', breedQuery: 'Point-of-Lay', category: 'live-birds', description: '18-week ready-to-lay vaccinated hens', active: true },
  { id: 'breed-eggs', label: 'Fertile Hatching Eggs', breedQuery: 'Hatching Eggs', category: 'eggs', description: '90%+ fertility rate verified hatching eggs', active: true },
  { id: 'breed-cuts', label: 'Fresh Poultry Cuts', breedQuery: 'Cuts', category: 'fresh-poultry', description: 'Air-chilled boneless breast, wings & whole birds', active: true },
  { id: 'breed-supplies', label: 'Feeds & Brooder Supplies', breedQuery: 'Feed', category: 'farm-supplies', description: 'Starter mash, feeders & automated drinkers', active: true },
];

export const INITIAL_FARMS: FarmSeller[] = [
  {
    id: 'farm-1',
    name: 'Naivasha Hatchery & Bio-Farm',
    slug: 'naivasha-hatchery',
    location: 'Naivasha Basin, Rift Valley',
    region: 'Central Rift',
    establishedYear: 2012,
    biosecurityLevel: 'Tier-1 Bio-Isolated Facility',
    certifications: ['Halal Certified', 'KEBS Quality Mark', 'DVS Avian Health Clearance', 'ISO 22000'],
    kebsLicenseNo: 'KEBS/PV-88392/2025',
    dvsCertNo: 'DVS-NAI-9921',
    rating: 4.9,
    reviewsCount: 312,
    description: 'Central bio-secure facility specializing in disease-screened day-old chicks, vaccinated point-of-lay pullets, and organic free-range poultry stock.',
    heroImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=200&q=80',
    specialties: ['Sexed Day-Old Chicks', 'Vaccinated Pullets', 'Fertile Hatching Eggs'],
    deliveryZones: ['Nairobi Metro', 'Rift Valley', 'Central Kenya', 'Western Zone']
  },
  {
    id: 'farm-2',
    name: 'Limuru Fresh Poultry Division',
    slug: 'limuru-fresh',
    location: 'Limuru Highlands, Kiambu',
    region: 'Central',
    establishedYear: 2016,
    biosecurityLevel: 'HACCP Certified Processing',
    certifications: ['Halal Certified', 'DVS Slaughter License', 'KEBS Fresh Standard'],
    kebsLicenseNo: 'KEBS/MEAT-44102',
    dvsCertNo: 'DVS-KMB-3309',
    rating: 4.8,
    reviewsCount: 450,
    description: 'Cold-chain dressed chicken processing division delivering blast-frozen cuts and fresh whole dressed birds directly to HORECA & households.',
    heroImage: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=1200&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=200&q=80',
    specialties: ['Whole Dressed Birds', 'Boneless Breast Cuts', 'Fresh Raw Cuts'],
    deliveryZones: ['Nairobi Metro', 'Kiambu', 'Machakos', 'Nakuru']
  },
  {
    id: 'farm-3',
    name: 'Eldoret Heritage Sanctuary',
    slug: 'eldoret-heritage',
    location: 'Eldoret Highlands, Uasin Gishu',
    region: 'North Rift',
    establishedYear: 2018,
    biosecurityLevel: 'Avian Influenza Free Zone',
    certifications: ['KEBS Heritage Breed Cert', 'DVS Organic Passed'],
    kebsLicenseNo: 'KEBS/BREED-1029',
    dvsCertNo: 'DVS-ELD-8812',
    rating: 4.95,
    reviewsCount: 188,
    description: 'Heritage breeding facility for purebred Kenbro and Improved Kienyeji dual-purpose stock.',
    heroImage: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=1200&q=80',
    avatarImage: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=200&q=80',
    specialties: ['Kenbro & Kienyeji Breeds', 'Kienyeji Breeding Pairs', 'Fertile Hatching Eggs'],
    deliveryZones: ['Eldoret', 'Kitale', 'Kisumu', 'Nairobi Express']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. LIVE BIRDS - POINT OF LAY PULLET
  {
    id: 'prod-layer-pullet',
    name: 'Improved Kienyeji Point-of-Lay Pullets (18 Weeks)',
    description: 'Fully vaccinated Improved Kienyeji pullets at 18 weeks of age, ready to commence laying within 10-14 days. Expect 50-65% peak lay (60-110 eggs/hen/month) with deep golden yolks.',
    price: 850,
    wholesalePrice: 760,
    wholesaleMinQty: 25,
    rating: 4.95,
    reviewsCount: 88,
    category: 'live-birds',
    subCategory: 'layers',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 450,
    tags: ['Point of Lay', 'Kienyeji', 'Egg Layer', '18-Weeks', 'Vaccinated'],
    badge: 'Point of Lay Ready',
    fulfillmentType: 'live-climate',
    story: 'Developed through decades of selective breeding in the East African Rift Valley, the Improved Kienyeji layer combines the robust disease resistance and foraging vitality of traditional indigenous chickens with the consistent laying power of modern heritage stock. These pullets are raised on organic pastures with full bio-security oversight, spending 18 weeks developing strong skeletal frames and active ovarian tracts before leaving our Naivasha facility.',
    whyItMatters: 'Point-of-lay pullets save homesteaders and smallholders 18 weeks of delicate brooding costs, electricity expenses, and high-protein chick starter feed. By receiving birds that have completed their comprehensive 6-stage vaccination regimen (including Marek’s, Newcastle, Gumboro, Fowl Pox, and Infectious Bronchitis), you eliminate early mortality risk and begin collecting premium, high-value brown eggs within 10 to 14 days of arrival.',
    productionSpecs: {
      eggsPerWeek: '4 to 5 large tinted eggs',
      hardiness: 'Exceptional (Tier 1 Indigenous Hybrid)',
      climateAdaptability: 'High altitude (2,500m) to hot semi-arid zones',
      feedConversionRatio: '3.1 kg feed per dozen eggs produced',
      matureWeight: '1.8 kg to 2.2 kg at full adulthood',
      layOnsetAge: '19 to 21 weeks',
      temperatureTolerance: '-2°C night chill to +38°C hot plains'
    },
    temperament: 'Calm, inquisitive, and highly alert to aerial predators. They thrive in backyard coops, fenced runs, or full free-range pasture systems, happily supplementing their ration by foraging for greens and insects.',
    physicalDescription: 'Varied indigenous plumage ranging from rich speckled brown, golden buff, and barred feathers to jet black with iridescent green sheen. Possesses clean yellow shanks, alert reddish-orange eyes, and sturdy medium single combs.',
    variantsConfig: {
      type: 'live',
      genders: ['Female (Point-of-Lay Hen)', 'Straight Run Pair (Hen + Cockerel)', 'Breeding Trio (2 Hens + 1 Rooster)'],
      breeds: ['Improved Kienyeji (KALRO)', 'Kenbro Dual-Purpose', 'Kuroiler Hybrid', 'Sasso French Heritage']
    },
    shipWeekStatus: {
      currentShipWeek: 'Week of Sep 1, 2026',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Week of Sep 8, 2026',
      availableShipWeeks: ['Week of Sep 1, 2026', 'Week of Sep 8, 2026', 'Week of Sep 15, 2026', 'Week of Sep 22, 2026'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-tube-feeder-15l', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    liveData: {
      breed: 'Improved Kienyeji',
      liveCategory: 'layer',
      ageWeeks: 18,
      weightRangeKg: { min: 1.45, max: 1.65 },
      sex: 'female',
      vaccinationRecord: [
        { vaccine: "Marek's HVT In-Ovo Injection", dateAdministered: '2026-03-24' },
        { vaccine: 'Newcastle NCD + IB Primary Spray', dateAdministered: '2026-04-07' },
        { vaccine: 'Gumboro IBD Intermediate Plus', dateAdministered: '2026-04-21' },
        { vaccine: 'Fowl Pox Wing Web Inoculation', dateAdministered: '2026-05-18' },
        { vaccine: 'Full 16-Week Layer Shield (NCD/IB/Fowl Cholera)', dateAdministered: '2026-07-10' }
      ],
      sourceFarmId: 'farm-1',
      batchId: 'BATCH-2026-POL4',
      minOrderQty: 5,
      mortalityPolicy: 'replace',
      pricePerBird: 850,
      transportZoneAvailability: ['Nairobi Metro', 'Rift Valley', 'Central Kenya', 'Western Zone']
    },
    reviewsList: [
      {
        id: 'rev-pol-1',
        author: 'Faith Muthoni',
        rating: 5,
        date: '2026-08-14',
        comment: 'Received 20 pullets in Nakuru. All 20 arrived lively with zero transit stress in the climate crates. Started laying huge brown eggs on day 11! Highly recommended.',
        avatarColor: 'bg-emerald-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Nakuru County'
      },
      {
        id: 'rev-pol-2',
        author: 'Ezekiel Otieno',
        rating: 5,
        date: '2026-08-08',
        comment: 'Clean vaccination card with DVS vet sign-off attached to the crate. The birds are big, active foragers and accustomed to local feed.',
        avatarColor: 'bg-amber-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Kisumu'
      }
    ]
  },

  // 2. LIVE BIRDS - BREEDING ROOSTER
  {
    id: 'prod-kuroiler-rooster',
    name: 'Kienyeji & Kuroiler Stud Roosters (24 Weeks, 3.2kg+)',
    description: 'Robust heritage breeding roosters renowned for 95%+ mating fertility, heavy body confirmation (3.2kg - 3.8kg), and active flock predator protection.',
    price: 2200,
    wholesalePrice: 1950,
    wholesaleMinQty: 5,
    rating: 4.85,
    reviewsCount: 34,
    category: 'live-birds',
    subCategory: 'breeding-stock',
    image: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Eldoret Heritage Sanctuary',
    sellerId: 'farm-3',
    sellerBadge: 'Certified Heritage',
    stock: 60,
    tags: ['Rooster', 'Kienyeji', 'Breeding Stock', 'Free-Range', 'Stud'],
    badge: 'Pedigree Stud',
    fulfillmentType: 'live-climate',
    story: 'Raised in the open, high-altitude pastures of Eldoret, our pedigree stud roosters are hand-selected from the top 5% of each generation based on virility, broad breast muscling, strong bone density, and protective instinct. They are ready to lead and fertilize a flock of 10 to 15 hens immediately.',
    whyItMatters: 'Introducing a disease-screened, vaccinated stud rooster immediately upgrades the genetic vigor of your backyard flock. Offspring inherit faster growth curves, larger egg size, and superior feed conversion without the inbreeding depression common in unmanaged flocks.',
    productionSpecs: {
      eggsPerWeek: 'N/A (Breeding Sire)',
      hardiness: 'Maximum (Field-tested pasture sire)',
      climateAdaptability: 'All altitudes across Kenya & East Africa',
      feedConversionRatio: '3.4 kg feed per kg liveweight gain',
      matureWeight: '3.2 kg to 4.0 kg',
      layOnsetAge: '22 to 24 weeks sexual maturity',
      temperatureTolerance: 'Weather-hardened for open paddocks'
    },
    temperament: 'Vigilant, bold, and protective of hens. Gentle with farm handlers while maintaining sharp sentinel calls against hawks, snakes, and mongoose.',
    physicalDescription: 'Magnificent sweeping sickle tail feathers, deep ruby red erect comb and wattles, sturdy spurs, broad chest, and rich copper-bronze plumage.',
    variantsConfig: {
      type: 'live',
      genders: ['Male Stud Rooster', 'Breeding Pair (1 Male + 1 Proven Hen)'],
      breeds: ['Kuroiler Stud (Heavy Frame)', 'Improved Kienyeji Stud', 'Kenbro Pure Sire']
    },
    shipWeekStatus: {
      currentShipWeek: 'Week of Sep 1, 2026',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Week of Sep 8, 2026',
      availableShipWeeks: ['Week of Sep 1, 2026', 'Week of Sep 8, 2026'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fertile-hatching-eggs-kuroiler', 'prod-tube-feeder-15l'],
      bundleDiscountPercent: 12
    },
    liveData: {
      breed: 'Kuroiler / Kienyeji',
      liveCategory: 'breeding',
      ageWeeks: 24,
      weightRangeKg: { min: 3.2, max: 3.8 },
      sex: 'male',
      vaccinationRecord: [
        { vaccine: 'Full Heritage Avian Shield (NCD/IB/Gumboro/Pox)', dateAdministered: '2026-06-15' }
      ],
      sourceFarmId: 'farm-3',
      batchId: 'BATCH-2026-ROOS',
      minOrderQty: 1,
      mortalityPolicy: 'credit',
      pricePerBird: 2200,
      transportZoneAvailability: ['Eldoret', 'Kitale', 'Kisumu', 'Nairobi Express']
    },
    reviewsList: [
      {
        id: 'rev-roos-1',
        author: 'Daniel Kipchirchir',
        rating: 5,
        date: '2026-08-02',
        comment: 'Massive bird! Weighed 3.6kg on arrival. Kept our 12 Kienyeji hens in check immediately and fertility test in our incubator showed 96% fertile eggs.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Eldoret'
      }
    ]
  },

  // 3. LIVE BIRDS - DAY OLD CHICKS
  {
    id: 'prod-rainbow-rooster-chicks',
    name: 'Rainbow Rooster Day-Old Chicks (Vaccinated at Hatch)',
    description: 'Vigorous dual-purpose Rainbow Rooster day-old chicks. Vaccinated against Marek\'s and Newcastle disease in our bio-secure Naivasha hatchery before climate boxing.',
    price: 145,
    wholesalePrice: 125,
    wholesaleMinQty: 100,
    rating: 4.93,
    reviewsCount: 128,
    category: 'live-birds',
    subCategory: 'day-old-chicks',
    image: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 1800,
    tags: ['Rainbow Rooster', 'Day-Old Chicks', 'Vaccinated', 'Dual Purpose', 'Hatch Day'],
    badge: 'Fast Growth Breed',
    fulfillmentType: 'live-climate',
    story: 'The Rainbow Rooster is a multi-colored dual-purpose chicken breed specifically engineered for tropical African farming environments. Hatched in our state-of-the-art Petersime computerized incubators in Naivasha, each chick is inspected for navel closure, leg strength, and alert vigor before placement in specialized ventilated transport boxes.',
    whyItMatters: 'Unlike commercial broilers that require intensive feeds and climate-controlled houses, Rainbow Roosters can scavenge and forage after 4 weeks of initial brooding. Roosters attain 2.5kg liveweight in just 14-16 weeks on regular farm rations, while hens produce 180-210 tinted eggs annually.',
    productionSpecs: {
      eggsPerWeek: '4 eggs/week from week 20 onwards',
      hardiness: 'Very High (Low mortality rate under 3%)',
      climateAdaptability: 'Excellent from coast to highland elevations',
      feedConversionRatio: '2.4 kg feed per kg weight gain (meat cycle)',
      matureWeight: 'Roosters 3.0-3.5kg, Hens 2.2-2.5kg',
      layOnsetAge: '20 to 22 weeks',
      temperatureTolerance: 'Requires brooder heat (32-35°C) in week 1'
    },
    temperament: 'Friendly, fast-moving, excellent foragers with strong natural instincts. Low aggression flock behavior.',
    physicalDescription: 'Multi-colored speckled plumage featuring combinations of brown, golden, red, white, and black hues with strong yellow shanks.',
    variantsConfig: {
      type: 'live',
      genders: ['Straight Run (50% Male / 50% Female)', 'Vent-Sexed Females (95% Pullets)', 'Vent-Sexed Males (Broiler/Rooster Run)'],
      breeds: ['Rainbow Rooster (Dual-Purpose)', 'Kenbro Improved', 'Kuroiler Champion', 'Sasso Brown']
    },
    shipWeekStatus: {
      currentShipWeek: 'Week of Sep 1, 2026',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Week of Sep 8, 2026',
      availableShipWeeks: ['Week of Sep 1, 2026', 'Week of Sep 8, 2026', 'Week of Sep 15, 2026'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-chick-starter-mash-50kg', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    liveData: {
      breed: 'Rainbow Rooster',
      liveCategory: 'chick',
      ageWeeks: 0,
      weightRangeKg: { min: 0.042, max: 0.05 },
      sex: 'unsexed',
      vaccinationRecord: [
        { vaccine: "Marek's HVT In-Ovo Inoculation", dateAdministered: '2026-08-01' },
        { vaccine: 'Newcastle NCD + Infectious Bronchitis Coarse Spray', dateAdministered: '2026-08-01' }
      ],
      sourceFarmId: 'farm-1',
      batchId: 'BATCH-2026-RR12',
      minOrderQty: 25,
      mortalityPolicy: 'replace',
      pricePerBird: 145,
      transportZoneAvailability: ['Nairobi Metro', 'Rift Valley', 'Central Kenya', 'Western Zone']
    },
    reviewsList: [
      {
        id: 'rev-chx-1',
        author: 'Grace Wanjiru',
        rating: 5,
        date: '2026-08-16',
        comment: 'Ordered 100 chicks to Murang\'a. Arrived within 3 hours of dispatch in warm boxes. 100% active, eating starter feed right away. Will order again next hatch cycle.',
        avatarColor: 'bg-amber-600',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Murang\'a'
      }
    ]
  },

  // 4. FRESH & WHOLE POULTRY - DRESSED KIENYEJI
  {
    id: 'prod-improved-kienyeji-dressed',
    name: 'Dressed Improved Kienyeji Whole Bird (Air-Chilled, 1.3-1.6kg)',
    description: 'Freshly slaughtered, hand-gutted, and air-chilled Improved Kienyeji chicken. Slow-grown for 18-20 weeks for deep authentic flavor and firm culinary texture.',
    price: 1550,
    wholesalePrice: 1400,
    wholesaleMinQty: 10,
    rating: 4.98,
    reviewsCount: 230,
    category: 'fresh-poultry',
    subCategory: 'whole-dressed',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 500,
    tags: ['Dressed Kienyeji', 'Air-Chilled', '1.3-1.6kg', 'Halal', 'Organic Fed'],
    badge: 'Premium Dressed Kienyeji',
    fulfillmentType: 'chilled-express',
    story: 'Sourced from free-range smallholder partner farms in the Kiambu highlands, these chickens feed on natural grains, greens, and sunshine for a full 18-20 weeks. Processed under strict DVS veterinary inspection in our HACCP-compliant Limuru abattoir, they undergo a rapid cold-air chill cycle (<4°C) to eliminate moisture absorption and preserve the rich natural collagen and yellow fat layers.',
    whyItMatters: 'Unlike water-chilled supermarket poultry which absorbs up to 12% excess water weight, our 100% air-chilled dressed birds retain pure meat density. In traditional Kenyan stews, soups, and roasts, this meat holds together without turning mushy, delivering rich broth and authentic kienyeji aroma.',
    productionSpecs: {
      carcassYield: '1.3kg to 1.6kg net dressed carcass with giblets included',
      hardiness: 'HACCP Slaughtered & Halal Certified',
      climateAdaptability: 'Maintained at 0°C to 4°C continuous cold chain',
      feedConversionRatio: 'Slow-grown 18-20 weeks organic pasture diet',
      matureWeight: 'Average pack target 1.45 kg',
      layOnsetAge: 'N/A (Meat harvest)',
      temperatureTolerance: 'Cook thoroughly to internal temp of 75°C'
    },
    temperament: 'N/A (Fresh Poultry Cut)',
    physicalDescription: 'Clean golden-tinted skin, plump breast, intact yellow skin pigmentation from natural carotenoids in feed, firm bone structure.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Bone-In (Authentic Stew Cut)', 'Boneless Carcass'],
      skinOptions: ['Skin-On (Traditional Roast)', 'Skinless'],
      weightBands: [
        { label: 'Standard Pack (1.3 - 1.4 kg)', weightKg: 1.35, priceDiff: 0 },
        { label: 'Large Family Pack (1.5 - 1.7 kg)', weightKg: 1.6, priceDiff: 200 },
        { label: 'Jumbo Roaster (1.8 - 2.0 kg)', weightKg: 1.9, priceDiff: 400 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Today Dispatch (Next Chilled Van: 04:00 PM)',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Morning & Evening Dispatch',
      availableShipWeeks: ['Daily Dispatch Slots Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fresh-wings-1kg', 'prod-jumbo-golden-table-eggs'],
      bundleDiscountPercent: 8
    },
    freshData: {
      cutType: 'Whole Bird Dressed with Giblets',
      boneStatus: 'bone-in',
      skinStatus: 'skin-on',
      weightEstKg: 1.45,
      weightTolerancePercent: 10,
      pricePerKg: 1060,
      slaughterDate: '2026-08-20 (04:30 AM)',
      packDate: '2026-08-20',
      bestBeforeDate: '2026-08-26',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841', 'KEBS-HALAL-992'],
      batchId: 'BATCH-2026-RAW2',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-dr-1',
        author: 'Mama Brian',
        rating: 5,
        date: '2026-08-18',
        comment: 'The authentic flavor of home! Made chicken soup for the family and the broth was deeply rich and golden with zero artificial wateriness.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Westlands, Nairobi'
      }
    ]
  },

  // 5. FRESH POULTRY - BONELESS SKINLESS BREAST
  {
    id: 'prod-boneless-breast-skinless',
    name: 'Prime Boneless Skinless Chicken Breast (1kg Vacuum Pack)',
    description: 'Hand-trimmed 100% pure breast fillets from pasture-raised birds. Ultra-high protein, zero added water or saline injection, flash-chilled to maintain tender succulence.',
    price: 890,
    wholesalePrice: 780,
    wholesaleMinQty: 10,
    rating: 4.96,
    reviewsCount: 175,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 500,
    tags: ['Chicken Breast', 'Boneless', 'Skinless', 'High Protein', 'Keto', 'Halal'],
    badge: '100% Trimmed Fillet',
    fulfillmentType: 'chilled-express',
    story: 'Prepared from healthy, young poultry raised in the cool Limuru hills. Hand-trimmed by master butchers to remove all fat, tendons, and cartilage, leaving pristine, restaurant-grade white meat fillets.',
    whyItMatters: 'Zero sodium injection, zero tenderizing chemicals, and zero water plumping. You receive 100% usable lean protein (31g protein per 100g serving) that sears cleanly in a skillet without boiling in pan water.',
    productionSpecs: {
      carcassYield: '1.0 kg vacuum-sealed pouch (approx 4-5 tender fillets)',
      hardiness: 'Halal Certified & DVS Inspected',
      climateAdaptability: 'Keep chilled between 0°C and 3°C',
      feedConversionRatio: 'Vegetable grain ration with zero hormone additives',
      matureWeight: '1.0 kg net per pack',
      temperatureTolerance: 'Freeze at -18°C for up to 6 months'
    },
    temperament: 'N/A (Fresh Meat Cut)',
    physicalDescription: 'Translucent pink, firm muscle grain, perfectly trimmed edges with zero silver skin or bone fragments.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Boneless Fillets', 'Bone-In Split Breast'],
      skinOptions: ['Skinless', 'Skin-On (Crispy Pan Sear)'],
      weightBands: [
        { label: '1.0 kg Standard Pack', weightKg: 1.0, priceDiff: 0 },
        { label: '2.5 kg Catering Pack', weightKg: 2.5, priceDiff: 1250 },
        { label: '5.0 kg Bulk Box', weightKg: 5.0, priceDiff: 3400 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Daily Chilled Van Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Chilled Express'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fresh-drumsticks-1kg', 'prod-fresh-wings-1kg'],
      bundleDiscountPercent: 10
    },
    freshData: {
      cutType: 'Prime Breast Fillet',
      boneStatus: 'boneless',
      skinStatus: 'skinless',
      weightEstKg: 1.0,
      weightTolerancePercent: 5,
      pricePerKg: 890,
      slaughterDate: '2026-08-20 (04:00 AM)',
      packDate: '2026-08-20',
      bestBeforeDate: '2026-08-26',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841'],
      batchId: 'BATCH-2026-BST1',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-bst-1',
        author: 'Kevin Mwangi',
        rating: 5,
        date: '2026-08-12',
        comment: 'Best chicken breast in Nairobi. Perfectly trimmed with no gristle or weird smell. Cooks juicy every single time for my meal prep.',
        avatarColor: 'bg-blue-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Kilimani, Nairobi'
      }
    ]
  },

  // 6. EGGS - TABLE EGGS
  {
    id: 'prod-jumbo-golden-table-eggs',
    name: 'Kienyeji Golden Yolk Farm Eggs (Tray of 30)',
    description: 'Fresh organic Kienyeji table eggs gathered daily from free-range pasture hens. Thick shells, vibrant orange-gold yolks rich in Omega-3 and natural beta-carotene.',
    price: 500,
    wholesalePrice: 450,
    wholesaleMinQty: 10,
    rating: 4.95,
    reviewsCount: 310,
    category: 'eggs',
    subCategory: 'table-eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 650,
    tags: ['Table Eggs', 'Kienyeji Eggs', 'Free-Range', 'Golden Yolk', 'Organic'],
    badge: 'Ksh 16.6 / Egg Value',
    fulfillmentType: 'dry-ambient',
    story: 'Collected every morning at 07:00 AM from clean nesting boxes padded with untreated pine shavings. Our hens forage on clover pastures and receive organic marigold and alfalfa supplements that naturally enrich yolk pigmentation without synthetic dye additives.',
    whyItMatters: 'Freshly laid eggs have a thick, protective natural bloom (cuticle) that seals out bacterial contamination. Yolk domes stand tall in the frying pan with distinct cloudy egg whites indicating peak farm-gate freshness.',
    productionSpecs: {
      eggsPerWeek: 'Fresh daily collection',
      hardiness: 'Dense calcium shells tested against transit breakages',
      climateAdaptability: 'Stores in cool pantry or refrigeration for 30+ days',
      feedConversionRatio: 'Pasture-raised + balanced organic grain mash',
      matureWeight: '55g to 65g per egg average (Large grade)',
      temperatureTolerance: 'Store between 10°C and 18°C'
    },
    temperament: 'N/A (Farm Egg Produce)',
    physicalDescription: 'Naturally varied tinted brown shells with occasional attractive speckled finishes. High yolk elasticity and firm albumin.',
    variantsConfig: {
      type: 'egg',
      eggGrades: ['Medium Grade (50-55g)', 'Large Grade (55-60g)', 'Jumbo Grade (65g+)'],
      packCounts: [
        { label: 'Pack of 12 (Gift Carton)', count: 12, price: 230 },
        { label: 'Standard Tray of 30 Eggs', count: 30, price: 500 },
        { label: 'Commercial Crate (6 Trays / 180 Eggs)', count: 180, price: 2850 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Collected Today • Ready for Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Collection Dispatch',
      availableShipWeeks: ['Daily Fresh Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-improved-kienyeji-dressed', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 10
    },
    eggData: {
      eggType: 'table',
      gradeSize: 'large',
      countPerPack: 30,
      layDate: '2026-08-20',
      daysSinceLaid: 0,
      price: 500
    },
    reviewsList: [
      {
        id: 'rev-egg-1',
        author: 'Catherine Ndunge',
        rating: 5,
        date: '2026-08-17',
        comment: 'The yolks are literally orange! When baked into cakes, the color and fluffiness is unbeatable. Zero broken eggs in delivery.',
        avatarColor: 'bg-amber-600',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Karen, Nairobi'
      }
    ]
  },

  // 7. EGGS - FERTILE HATCHING EGGS
  {
    id: 'prod-fertile-hatching-eggs-kuroiler',
    name: 'Fertile Improved Kienyeji Hatching Eggs (Tray of 30)',
    description: 'Candled, graded, and fertility-verified hatching eggs collected from bio-isolated breeding pens with a 1:8 rooster-to-hen mating ratio. Verified 90%+ hatchability.',
    price: 1200,
    wholesalePrice: 1050,
    wholesaleMinQty: 10,
    rating: 4.97,
    reviewsCount: 164,
    category: 'eggs',
    subCategory: 'fertile-eggs',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 120,
    tags: ['Fertile Eggs', 'Hatching Eggs', 'Kienyeji', 'Incubator Ready', 'High Hatchability'],
    badge: '90%+ Fertility Rate',
    fulfillmentType: 'chilled-express',
    story: 'Produced from our primary pedigree grandparent flocks in Naivasha. Eggs are collected 4 times daily to prevent pre-incubation, sanitized with dry bio-fogging, and stored in a temperature-controlled holding room at 16°C with 75% relative humidity before packaging in shock-absorbing molded pulp trays.',
    whyItMatters: 'Fertile hatching eggs experience rapid hatchability decline after 7-10 days of laying. We ship eggs that are no more than 2-3 days old, guaranteeing maximum embryo vigor when set in your incubator or under broody hens.',
    productionSpecs: {
      eggsPerWeek: 'Candled & fertility verified daily',
      hardiness: 'Strict shell thickness screening',
      climateAdaptability: 'Incubate at 37.5°C and 55% RH for days 1-18, 65% RH for days 19-21',
      feedConversionRatio: 'Parent flock fed specialized breeder mash with vitamin E & selenium',
      matureWeight: '56g to 64g ideal hatching egg weight',
      temperatureTolerance: 'Do not refrigerate below 12°C'
    },
    temperament: 'N/A (Incubation Product)',
    physicalDescription: 'Pristine oval confirmation, uniform shell thickness, free of micro-cracks or faecal contamination.',
    variantsConfig: {
      type: 'egg',
      eggGrades: ['Selected Hatching Grade (55-62g)'],
      packCounts: [
        { label: 'Sample Tray of 30 Hatching Eggs', count: 30, price: 1200 },
        { label: 'Half Crate (3 Trays / 90 Eggs)', count: 90, price: 3450 },
        { label: 'Master Breeder Case (6 Trays / 180 Eggs)', count: 180, price: 6600 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Fresh Lay This Week • Incubation Ready',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Weekly Dispatch on Tuesdays & Thursdays',
      availableShipWeeks: ['Tue Morning Dispatch', 'Thu Morning Dispatch'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-avian-multivitamin-1kg', 'prod-tube-feeder-15l'],
      bundleDiscountPercent: 12
    },
    eggData: {
      eggType: 'fertile',
      gradeSize: 'large',
      countPerPack: 30,
      layDate: '2026-08-19',
      daysSinceLaid: 1,
      fertilityWindowDays: 7,
      hatchViabilityPercent: 93,
      price: 1200
    },
    reviewsList: [
      {
        id: 'rev-fert-1',
        author: 'Joshua Kibet',
        rating: 5,
        date: '2026-08-10',
        comment: 'Set 60 eggs in my automatic incubator. 56 hatched strong, healthy chicks on day 21! 93.3% hatch rate is the best I have ever achieved.',
        avatarColor: 'bg-emerald-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Nandi Hills'
      }
    ]
  },

  // 8. FARM SUPPLIES - CHICK STARTER MASH
  {
    id: 'prod-chick-starter-mash-50kg',
    name: 'Chick Starter Mash (20-21% Protein + Coccidiostat - 50kg)',
    description: 'Formulated strictly to Farm Plan specifications: 20-21% crude protein, 2,900-3,000 kcal/kg metabolizable energy, fortified with coccidiostat for weeks 0 to 4.',
    price: 3650,
    wholesalePrice: 3350,
    wholesaleMinQty: 5,
    rating: 4.9,
    reviewsCount: 112,
    category: 'farm-supplies',
    subCategory: 'feed',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Feed Mill',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Feed Mill',
    stock: 200,
    tags: ['Chick Starter', '20-21% Protein', 'Coccidiostat', '50kg Bag', 'Bio-Security'],
    badge: 'Farm Plan Starter Spec',
    fulfillmentType: 'dry-ambient',
    story: 'Milled from premium local non-GMO yellow maize, soya meal, fish meal, and essential amino acids (methionine and lysine). Designed specifically to fuel the rapid bone and organ growth required in the critical first 28 days of brooding.',
    whyItMatters: 'Early chick mortality is most commonly caused by poorly balanced protein or subclinical coccidiosis. Our formulation includes prophylactic coccidiostat to prevent gut lining damage and ensure high flock uniformity.',
    productionSpecs: {
      eggsPerWeek: 'N/A (Chick Nutrition)',
      hardiness: 'Dry hermetic woven bag packaging',
      climateAdaptability: 'Store on wooden pallets away from damp floors',
      feedConversionRatio: 'Target: 1.3kg feed per chick over first 4 weeks (12-35g/bird/day)',
      matureWeight: '50 kg woven bag with inner moisture liner',
      temperatureTolerance: 'Store in dry ventilated storeroom'
    },
    temperament: 'N/A (Poultry Feed Supply)',
    physicalDescription: 'Fine crumbles/mash texture easily ingested by 1-day-old chicks without choking or feed sorting.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '10 kg Starter Pack (Backyard brooder)', unit: '10kg Bag', price: 850 },
        { label: '25 kg Medium Sack', unit: '25kg Bag', price: 1950 },
        { label: '50 kg Commercial Sack (570 Chick Plan)', unit: '50kg Bag', price: 3650 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready for Immediate Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Stock Availability',
      availableShipWeeks: ['Daily Dispatch Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-rainbow-rooster-chicks', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'feed',
      unit: '50kg Bag',
      priceFixed: 3650,
      stockQty: 200,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-feed-1',
        author: 'Samuel Mworia',
        rating: 5,
        date: '2026-08-05',
        comment: 'Chicks grew visibly faster compared to generic feeds. Zero pasty butt or gut issues. Excellent crumb size.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Machakos'
      }
    ]
  },

  // 9. FARM SUPPLIES - HANGING TUBE FEEDER
  {
    id: 'prod-tube-feeder-15l',
    name: 'Hanging Poultry Tube Feeder (15 Litre Heavy-Duty Anti-Spill)',
    description: 'Durable UV-stabilized polypropylene hanging tube feeder. Anti-waste feed lip prevents scratching and feed contamination. Serves 35-40 birds.',
    price: 850,
    wholesalePrice: 720,
    wholesaleMinQty: 10,
    rating: 4.94,
    reviewsCount: 78,
    category: 'farm-supplies',
    subCategory: 'equipment',
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Poultry Equipment Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Equipment',
    stock: 120,
    tags: ['Tube Feeder', '1 per 40 Birds', 'Anti-Waste', 'Equipment', 'Farm Plan'],
    badge: '1 Feeder per 40 Birds',
    fulfillmentType: 'dry-ambient',
    story: 'Engineered specifically to solve the #1 source of farm financial leakage: spilled feed on litter. Designed with an adjustable feed flow cone and an anti-scratch grid ring that forces birds to eat calmly without flicking mash onto the floor.',
    whyItMatters: 'Feed constitutes 70% of total poultry operational costs. Saving just 5-10% of spilled feed through proper hanging tube feeders recovers the cost of the equipment in under 30 days of flock feeding.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'UV-resistant virgin polypropylene plastic',
      climateAdaptability: 'Indoor brooders and outdoor runs',
      feedConversionRatio: 'Reduces feed waste by up to 12%',
      matureWeight: '15 Litre capacity (holds 10-12kg mash)',
      temperatureTolerance: 'Won\'t crack in freezing nights or intense afternoon sun'
    },
    temperament: 'N/A',
    physicalDescription: 'Bright yellow base pan with high-visibility white or semi-opaque cylinder for monitoring feed levels at a glance.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '5 Litre Chick Feeder', unit: 'Unit', price: 450 },
        { label: '10 Litre Standard Feeder', unit: 'Unit', price: 650 },
        { label: '15 Litre Commercial Feeder (Standard Plan)', unit: 'Unit', price: 850 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready to Ship',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Parcel Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-chick-starter-mash-50kg', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'equipment',
      unit: 'Unit',
      priceFixed: 850,
      stockQty: 120,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-eq-1',
        author: 'Anthony Wachira',
        rating: 5,
        date: '2026-08-01',
        comment: 'Great quality plastic, very sturdy. Adjusted height to bird back height and stopped all feed wastage immediately.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Nyeri'
      }
    ]
  },

  // 10. FARM SUPPLIES - MULTIVITAMINS & ELECTROLYTES
  {
    id: 'prod-avian-multivitamin-1kg',
    name: 'Avian Multivitamin & Electrolyte Anti-Stress Formula (1kg Tub)',
    description: 'High-potency water-soluble electrolyte, mineral, and multivitamin concentrate. Eliminates transit dehydration, boosts chick vigor, and protects gut microflora during vaccinations.',
    price: 1250,
    wholesalePrice: 1050,
    wholesaleMinQty: 5,
    rating: 4.96,
    reviewsCount: 88,
    category: 'farm-supplies',
    subCategory: 'vaccines-meds',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Avian Health Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Health & Wellness',
    stock: 150,
    tags: ['Multivitamin', 'Electrolytes', 'Chick Care', 'Anti-Stress', 'Water Soluble'],
    badge: 'Anti-Stress Formula',
    fulfillmentType: 'dry-ambient',
    story: 'Formulated by avian veterinarians to combat the acute stress of transport, vaccination days, extreme weather shifts, and peak egg production onset. Contains balanced vitamins A, D3, E, K, B-complex, sodium, potassium, and amino acid builders.',
    whyItMatters: 'Administering electrolytes in drinking water for the first 3 days after chick arrival restores electrolyte balance, kickstarts digestive enzymes, and reduces day 1-3 mortality to virtually zero.',
    productionSpecs: {
      eggsPerWeek: 'N/A (Avian Wellness)',
      hardiness: 'Sealed airtight 1kg moisture-lock canister',
      climateAdaptability: '1g per 2 Litres of clean drinking water',
      feedConversionRatio: 'Improves nutrient absorption across all feeds',
      matureWeight: '1.0 kg net weight powder',
      temperatureTolerance: 'Store in cool, dark place away from direct sunlight'
    },
    temperament: 'N/A',
    physicalDescription: 'Fine orange-yellow water-soluble powder that dissolves instantly in clean drinking water without leaving residues or clogging drinker lines.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '250g Sachet (Backyard Care)', unit: '250g Pack', price: 400 },
        { label: '500g Tub', unit: '500g Tub', price: 750 },
        { label: '1.0 kg Commercial Tub', unit: '1kg Tub', price: 1250 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready to Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-layer-pullet', 'prod-tube-feeder-15l'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'vaccine',
      unit: '1kg Container',
      priceFixed: 1250,
      stockQty: 150,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-med-1',
        author: 'Dr. Joseph Ndung\'u',
        rating: 5,
        date: '2026-08-09',
        comment: 'Essential for every flock arrival. Dissolves cleanly and birds drink eagerly. Zero transit losses when used as instructed.',
        avatarColor: 'bg-emerald-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Kiambu'
      }
    ]
  },

  // 11. FRESH POULTRY - WINGS
  {
    id: 'prod-fresh-wings-1kg',
    name: 'Prime Air-Chilled Chicken Wings (1kg Pack)',
    description: 'Fresh 3-joint prime chicken wings. Air-chilled to lock in crispness and natural flavor without excess moisture. Perfect for grilling, roasting, and frying.',
    price: 720,
    wholesalePrice: 620,
    wholesaleMinQty: 10,
    rating: 4.94,
    reviewsCount: 190,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 400,
    tags: ['Chicken Wings', 'Air-Chilled', '1kg Pack', 'Halal', 'BBQ'],
    badge: 'Restaurant Grade',
    fulfillmentType: 'chilled-express',
    story: 'Freshly cut from our daily dressed birds in Limuru. Each wing is inspected for clean feather removal and intact joints before vacuum sealing.',
    whyItMatters: 'Air-chilled wings have drier skin surfaces, allowing marinades to adhere deeply and skin to crisp to golden perfection in the oven or on the charcoal grill.',
    productionSpecs: {
      carcassYield: '1.0 kg pack (approx 10-12 full 3-joint wings)',
      hardiness: 'Halal Certified',
      climateAdaptability: '0°C to 4°C continuous cold-chain delivery',
      feedConversionRatio: 'Air-chilled zero water absorption',
      matureWeight: '1.0 kg net weight',
      temperatureTolerance: 'Cook to minimum 75°C'
    },
    temperament: 'N/A',
    physicalDescription: 'Clean 3-joint wings with drumette, flat, and wing tip intact.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Full 3-Joint Wings', 'Party Cut (Drumettes & Flats Separated)'],
      skinOptions: ['Skin-On (Crispy BBQ)'],
      weightBands: [
        { label: '1.0 kg Pack', weightKg: 1.0, priceDiff: 0 },
        { label: '3.0 kg Party Pack', weightKg: 3.0, priceDiff: 1400 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Daily Chilled Express Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fresh-drumsticks-1kg', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 8
    },
    freshData: {
      cutType: 'Wings',
      boneStatus: 'bone-in',
      skinStatus: 'skin-on',
      weightEstKg: 1.0,
      weightTolerancePercent: 5,
      pricePerKg: 720,
      slaughterDate: '2026-08-20 (04:00 AM)',
      packDate: '2026-08-20',
      bestBeforeDate: '2026-08-26',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841'],
      batchId: 'BATCH-2026-RAW2',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-wng-1',
        author: 'Dennis Ochieng',
        rating: 5,
        date: '2026-08-14',
        comment: 'Crisped up so well on the charcoal grill! You can tell these aren\'t pumped with salty water like other brands.',
        avatarColor: 'bg-amber-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Nairobi'
      }
    ]
  },

  // 12. FRESH POULTRY - DRUMSTICKS
  {
    id: 'prod-fresh-drumsticks-1kg',
    name: 'Tender Air-Chilled Chicken Drumsticks (1kg Pack)',
    description: 'Plump, succulent chicken drumsticks. Freshly hand-cut and vacuum packed with zero added moisture for savory stews and crispy frying.',
    price: 780,
    wholesalePrice: 680,
    wholesaleMinQty: 10,
    rating: 4.91,
    reviewsCount: 145,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 350,
    tags: ['Drumsticks', 'Air-Chilled', '1kg Pack', 'Halal', 'Juicy'],
    badge: 'Juicy Cut',
    fulfillmentType: 'chilled-express',
    story: 'Freshly portioned drumsticks from high-welfare poultry flocks. The air-chilling method preserves natural cell integrity, resulting in extra juicy, tender dark meat.',
    whyItMatters: 'Dark meat rich in iron, zinc, and flavor. Excellent tolerance for high-heat roasting or long simmered stews without drying out.',
    productionSpecs: {
      carcassYield: '1.0 kg pack (approx 6-8 plump drumsticks)',
      hardiness: 'Halal Certified',
      climateAdaptability: 'Chilled delivery at 0°C to 4°C',
      feedConversionRatio: 'Natural grain diet',
      matureWeight: '1.0 kg net per pouch',
      temperatureTolerance: 'Cook thoroughly to 75°C'
    },
    temperament: 'N/A',
    physicalDescription: 'Plump meaty drumsticks with clean tendon cuts and intact skin.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Bone-In'],
      skinOptions: ['Skin-On', 'Skinless'],
      weightBands: [
        { label: '1.0 kg Pack', weightKg: 1.0, priceDiff: 0 },
        { label: '2.5 kg Value Pack', weightKg: 2.5, priceDiff: 1150 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Daily Dispatch Slots',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fresh-wings-1kg', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 8
    },
    freshData: {
      cutType: 'Drumsticks',
      boneStatus: 'bone-in',
      skinStatus: 'skin-on',
      weightEstKg: 1.0,
      weightTolerancePercent: 5,
      pricePerKg: 780,
      slaughterDate: '2026-08-20 (04:00 AM)',
      packDate: '2026-08-20',
      bestBeforeDate: '2026-08-26',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841'],
      batchId: 'BATCH-2026-RAW2',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-drm-1',
        author: 'Lydia Chebet',
        rating: 5,
        date: '2026-08-11',
        comment: 'Fresh, juicy, and delicious. Clean packaging with no liquid pooling in the bottom.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Eldoret'
      }
    ]
  }
];

export const MOCK_BATCH_TRACE_RECORDS: Record<string, BatchTraceabilityRecord> = {
  'BATCH-2026-CHX9': {
    batchId: 'BATCH-2026-CHX9',
    farmName: 'Naivasha Hatchery & Bio-Farm',
    location: 'Naivasha Basin, Rift Valley',
    breedOrCut: 'Kenbro Day-Old Chicks',
    hatchOrSlaughterDate: '2026-07-29 02:30 AM',
    feedSupplier: 'Premium Breeder Mash',
    vaccinationHistory: [
      { vaccine: "Marek's HVT In-Ovo Injection", dateAdministered: '2026-07-28' },
      { vaccine: 'Newcastle NCD LaSota + IB Primer Spray', dateAdministered: '2026-07-29' }
    ],
    labTestStatus: 'Pass - Certified Free of Salmonella Pullorum & Avian Influenza H5N1',
    kebsLicenseNo: 'KEBS/PV-88392/2025',
    dvsCertNo: 'DVS-NAI-9921',
    veterinarySignOff: 'Dr. Kennedy Wambugu, BVM (Reg #1402)',
    temperatureLog: 'Transport Chamber Locked at 32.5°C ±0.5°C'
  },
  'BATCH-2026-RAW2': {
    batchId: 'BATCH-2026-RAW2',
    farmName: 'Limuru Fresh Poultry Division',
    location: 'Limuru Highlands, Kiambu',
    breedOrCut: 'Whole Dressed Air-Chilled Broilers & Cuts',
    hatchOrSlaughterDate: '2026-08-20 04:00 AM Slaughter',
    feedSupplier: 'Bio-Growth Feed',
    vaccinationHistory: [
      { vaccine: 'Full Broiler Pre-Slaughter Withdrawal Protocol Verified', dateAdministered: '2026-08-10' }
    ],
    labTestStatus: 'Pass - Zero Antibiotic Residue & Certified Halal',
    kebsLicenseNo: 'KEBS/MEAT-44102',
    dvsCertNo: 'DVS-KMB-3309',
    veterinarySignOff: 'Dr. Sarah Njeri, DVS Inspector (Reg #0988)',
    temperatureLog: 'Post-Chilling Chamber Constant at 1.8°C'
  },
  'BATCH-2026-POL4': {
    batchId: 'BATCH-2026-POL4',
    farmName: 'Naivasha Hatchery & Bio-Farm',
    location: 'Naivasha Basin, Rift Valley',
    breedOrCut: 'Kienyeji Point-of-Lay Pullets (18 Wks)',
    hatchOrSlaughterDate: '2026-03-24 Hatch Date',
    feedSupplier: 'Layer Developer Mash',
    vaccinationHistory: [
      { vaccine: 'NCD + IB Booster', dateAdministered: '2026-05-12' },
      { vaccine: 'Fowl Pox Wing Web', dateAdministered: '2026-06-02' },
      { vaccine: 'Gumboro IBD Final Boost', dateAdministered: '2026-07-10' }
    ],
    labTestStatus: 'Pass - Serology Confirmed High Titer Immunity',
    kebsLicenseNo: 'KEBS/PV-88392/2025',
    dvsCertNo: 'DVS-NAI-9921',
    veterinarySignOff: 'Dr. Kennedy Wambugu, BVM (Reg #1402)',
    temperatureLog: 'Ventilated Express Transport Unit'
  }
};

export const MOCK_WHOLESALE_ORDERS: WholesaleStandingOrder[] = [
  {
    id: 'WO-8821',
    businessName: 'The Carnivore Restaurant & Grill',
    contactPerson: 'Chef James Omondi',
    email: 'purchasing@carnivore.co.ke',
    frequency: 'weekly',
    itemsSummary: '200x Whole Dressed Birds (1.5kg), 50kg Boneless Breast',
    nextDeliveryDate: '2026-08-25',
    monthlySpendKsh: 380000,
    paymentTerms: 'NET-30 Invoiced',
    status: 'active'
  },
  {
    id: 'WO-9943',
    businessName: 'Java House Central Butchery',
    contactPerson: 'Mercy Mutua',
    email: 'supplychain@javahouse.com',
    frequency: 'bi-weekly',
    itemsSummary: '100kg Fresh Raw Wings, 80 Trays Jumbo Eggs',
    nextDeliveryDate: '2026-08-28',
    monthlySpendKsh: 245000,
    paymentTerms: 'NET-30 Invoiced',
    status: 'active'
  }
];

export const MOCK_MORTALITY_CLAIMS: MortalityClaim[] = [
  {
    id: 'CLM-7701',
    orderId: 'ORD-99821',
    batchId: 'BATCH-2026-CHX9',
    breed: 'Kenbro Day-Old Chicks',
    affectedQty: 3,
    incidentDate: '2026-07-28',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80',
    description: '3 chicks arrived weak in corner of climate box #2 during transit.',
    status: 'approved_credit',
    refundAmount: 405,
    claimDate: '2026-07-28'
  }
];

