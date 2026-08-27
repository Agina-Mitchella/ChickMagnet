import { Product, FarmSeller, BatchTraceabilityRecord, WholesaleStandingOrder, MortalityClaim, BreedDropdownOption } from '../types';

export const INITIAL_BREED_DROPDOWN_OPTIONS: BreedDropdownOption[] = [
  { id: 'breed-all', label: 'All Poultry & Breeds', breedQuery: '', category: 'all', description: 'Browse entire hatchery & supply catalog', active: true },
  { id: 'breed-kienyeji', label: 'Improved Kienyeji (KALRO)', breedQuery: 'Kienyeji', category: 'live-birds', description: 'Hardy indigenous dual-purpose, 220+ eggs/yr', active: true },
  { id: 'breed-kenbro', label: 'Kenbro Dual-Purpose', breedQuery: 'Kenbro', category: 'live-birds', description: 'Heavy meat & high egg production bird', active: true },
  { id: 'breed-kuroiler', label: 'Kuroiler Heritage', breedQuery: 'Kuroiler', category: 'live-birds', description: 'Rapid growth, scavenger champion, large brown eggs', active: true },
  { id: 'breed-sasso', label: 'Sasso Dual-Purpose', breedQuery: 'Sasso', category: 'live-birds', description: 'French dual-purpose free-range champion', active: true },
  { id: 'breed-broiler', label: 'Cobb 500 Fast Broilers', breedQuery: 'Broiler', category: 'live-birds', description: 'Fast 32-35 day feed conversion meat bird', active: true },
  { id: 'breed-rainbow', label: 'Rainbow Rooster', breedQuery: 'Rainbow Rooster', category: 'live-birds', description: 'High disease resistance, colorful homestead favorite', active: true },
  { id: 'breed-australorp', label: 'Black Australorp Heritage', breedQuery: 'Australorp', category: 'live-birds', description: 'High-egg yield docility champion, 250+ eggs/yr', active: true },
  { id: 'breed-layers', label: 'Point-of-Lay Pullets', breedQuery: 'Point-of-Lay', category: 'live-birds', description: '18-week ready-to-lay vaccinated hens', active: true },
  { id: 'breed-eggs', label: 'Fertile Hatching Eggs', breedQuery: 'Hatching Eggs', category: 'eggs', description: '90%+ fertility rate verified hatching eggs', active: true },
  { id: 'breed-cuts', label: 'Fresh Poultry Cuts', breedQuery: 'Cuts', category: 'fresh-poultry', description: 'Air-chilled boneless breast, wings, thighs & whole birds', active: true },
  { id: 'breed-supplies', label: 'Feeds, Drinkers & Supplies', breedQuery: 'Feed', category: 'farm-supplies', description: 'Starter mash, feeders, drinkers & incubators', active: true },
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
  },

  // 13. LIVE BIRDS - SASSO DAY-OLD CHICKS
  {
    id: 'prod-sasso-chicks',
    name: 'Sasso French Dual-Purpose Day-Old Chicks (Vaccinated)',
    description: 'World-renowned French Sasso dual-purpose day-old chicks. Hardy red/rust plumage, exceptional foraging instinct, reaching 2.4kg meat weight in 10-12 weeks and laying 200+ brown eggs/year.',
    price: 150,
    wholesalePrice: 130,
    wholesaleMinQty: 100,
    rating: 4.95,
    reviewsCount: 94,
    category: 'live-birds',
    subCategory: 'day-old-chicks',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 1400,
    tags: ['Sasso', 'Day-Old Chicks', 'Dual Purpose', 'Vaccinated', 'French Heritage'],
    badge: 'French Dual-Purpose',
    fulfillmentType: 'live-climate',
    story: 'Directly descended from French pedigree genetics adapted to Kenyan semi-intensive and free-range systems. Sasso chickens possess resilient immune systems, high tolerance to heat and sudden highland chills, and delicious firm meat with natural yellow skin fat.',
    whyItMatters: 'Sasso birds bridge the gap between slow indigenous birds and intensive broilers. They scavenge vigorously in orchards and pasture runs, reducing feed costs by up to 30% while retaining high commercial weight gain.',
    productionSpecs: {
      eggsPerWeek: '4 to 5 large brown eggs (from week 20)',
      hardiness: 'Top Tier (Field survival rate >97%)',
      climateAdaptability: 'Coastal humid to Rift Valley highland frost',
      feedConversionRatio: '2.3 kg feed per kg weight gain',
      matureWeight: 'Males 3.2-3.8kg, Females 2.4-2.8kg',
      layOnsetAge: '19 to 21 weeks',
      temperatureTolerance: 'Requires brooder warmth for first 14 days'
    },
    temperament: 'Calm, docile, eager foragers, excellent flock cohesion with low aggression.',
    physicalDescription: 'Striking rich mahogany-red and buff feathers with golden neck hackles and clean bright yellow shanks.',
    variantsConfig: {
      type: 'live',
      genders: ['Straight Run (50% Male / 50% Female)', 'Vent-Sexed Females (95% Pullets)', 'Vent-Sexed Males (Rooster Run)'],
      breeds: ['Sasso Ruby (Standard)', 'Sasso Silver-Grey Hybrid']
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
      breed: 'Sasso Dual-Purpose',
      liveCategory: 'chick',
      ageWeeks: 0,
      weightRangeKg: { min: 0.042, max: 0.048 },
      sex: 'unsexed',
      vaccinationRecord: [
        { vaccine: "Marek's HVT In-Ovo Inoculation", dateAdministered: '2026-08-20' },
        { vaccine: 'Newcastle NCD + IB Coarse Spray at Hatch', dateAdministered: '2026-08-20' }
      ],
      sourceFarmId: 'farm-1',
      batchId: 'BATCH-2026-SAS8',
      minOrderQty: 25,
      mortalityPolicy: 'replace',
      pricePerBird: 150,
      transportZoneAvailability: ['Nairobi Metro', 'Rift Valley', 'Central Kenya', 'Western Zone']
    },
    reviewsList: [
      {
        id: 'rev-sas-1',
        author: 'Peter Kinyanjui',
        rating: 5,
        date: '2026-08-15',
        comment: 'Received 150 Sasso chicks in Thika. Strong legs, zero losses in brooding. At 8 weeks they already look like full chickens!',
        avatarColor: 'bg-emerald-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Thika'
      }
    ]
  },

  // 14. LIVE BIRDS - COBB 500 FAST BROILER CHICKS
  {
    id: 'prod-cobb500-broiler-chicks',
    name: 'Cobb 500 Fast Broiler Chicks (33-Day FCR Champion)',
    description: 'The world\'s most popular and efficient meat bird. Reaches 1.8kg - 2.2kg live weight in just 32-35 days with exceptional breast meat yield and industry-leading feed conversion.',
    price: 135,
    wholesalePrice: 118,
    wholesaleMinQty: 100,
    rating: 4.96,
    reviewsCount: 210,
    category: 'live-birds',
    subCategory: 'day-old-chicks',
    image: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 2500,
    tags: ['Cobb 500', 'Broiler Chicks', 'Fast Growth', 'Meat Champion', '33-Day Cycle'],
    badge: '33-Day Meat Cycle',
    fulfillmentType: 'live-climate',
    story: 'Hatched from rigorously screened parent stock bred for rapid cardiovascular health and strong skeletal structure. Cobb 500 chicks are pre-vaccinated at hatch to give commercial broiler farmers rapid turnarounds and predictable margins.',
    whyItMatters: 'With a feed conversion ratio as low as 1.55 kg feed per kg liveweight gain, Cobb 500 delivers maximum return on investment per square metre of poultry housing.',
    productionSpecs: {
      eggsPerWeek: 'N/A (Specialized Meat Broiler)',
      hardiness: 'Bio-secure housing recommended',
      climateAdaptability: 'Requires regulated ventilation and temperature control',
      feedConversionRatio: '1.55 - 1.65 kg feed per kg liveweight gain',
      matureWeight: '2.0kg to 2.4kg at day 35',
      layOnsetAge: 'N/A (Harvested at 32-38 days)',
      temperatureTolerance: 'Brooder temperature 33°C week 1, down to 21°C by week 4'
    },
    temperament: 'Gentle, placid, high feeding efficiency.',
    physicalDescription: 'Crisp white down feathers turning to clean white plumage with pale yellow shanks and broad chest confirmation.',
    variantsConfig: {
      type: 'live',
      genders: ['Straight Run (As Hatched)', 'All-Male Fast Broiler Run'],
      breeds: ['Cobb 500 Standard Commercial']
    },
    shipWeekStatus: {
      currentShipWeek: 'Hatch Every Tuesday & Friday',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Weekly Hatches',
      availableShipWeeks: ['Tuesday Hatch Dispatch', 'Friday Hatch Dispatch'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-chick-starter-mash-50kg', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 12
    },
    liveData: {
      breed: 'Cobb 500 Broiler',
      liveCategory: 'chick',
      ageWeeks: 0,
      weightRangeKg: { min: 0.044, max: 0.052 },
      sex: 'unsexed',
      vaccinationRecord: [
        { vaccine: "Marek's HVT In-Ovo Inoculation", dateAdministered: '2026-08-22' },
        { vaccine: 'Newcastle NCD + IB C201 Hatch Spray', dateAdministered: '2026-08-22' }
      ],
      sourceFarmId: 'farm-1',
      batchId: 'BATCH-2026-CB50',
      minOrderQty: 50,
      mortalityPolicy: 'replace',
      pricePerBird: 135,
      transportZoneAvailability: ['Nairobi Metro', 'Rift Valley', 'Central Kenya', 'Western Zone']
    },
    reviewsList: [
      {
        id: 'rev-cb-1',
        author: 'Maina Kamau',
        rating: 5,
        date: '2026-08-18',
        comment: 'Batch of 500 broilers hit 2.1kg average on day 34 on Bio-Growth feed. Mortality was under 1.5%. Best hatchery in Kenya.',
        avatarColor: 'bg-blue-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Limuru'
      }
    ]
  },

  // 15. LIVE BIRDS - KENBRO POINT-OF-LAY PULLETS
  {
    id: 'prod-kenbro-pullet',
    name: 'Kenbro Dual-Purpose Point-of-Lay Pullets (18 Weeks)',
    description: 'Robust Kenbro point-of-lay pullets, vaccinated with full 6-stage protocol. Renowned for heavy body mass, laying 200-230 large tinted eggs annually with high persistence.',
    price: 880,
    wholesalePrice: 790,
    wholesaleMinQty: 20,
    rating: 4.97,
    reviewsCount: 82,
    category: 'live-birds',
    subCategory: 'layers',
    image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Eldoret Heritage Sanctuary',
    sellerId: 'farm-3',
    sellerBadge: 'Certified Heritage',
    stock: 320,
    tags: ['Kenbro', 'Point of Lay', '18-Weeks', 'Vaccinated', 'Dual Purpose'],
    badge: 'Heavy Dual-Purpose',
    fulfillmentType: 'live-climate',
    story: 'The Kenbro bird is celebrated across Kenya for its resilience, delicious meat flavor, and heavy laying capability. These pullets are reared in open highland pastures in Eldoret, building strong pelvic spacing and sound bone density before entering your laying coop.',
    whyItMatters: 'Kenbro hens maintain laying output for over 18 continuous months, and retain high meat salvage value when retired, fetching premium prices as mature stewing hens.',
    productionSpecs: {
      eggsPerWeek: '4 to 5 large tinted eggs',
      hardiness: 'Outstanding disease tolerance',
      climateAdaptability: 'Adapted to all Kenyan climate zones',
      feedConversionRatio: '3.0 kg feed per dozen eggs',
      matureWeight: '2.2 kg to 2.6 kg',
      layOnsetAge: '19 to 21 weeks',
      temperatureTolerance: 'Pasture-hardened for hot and cold weather'
    },
    temperament: 'Calm, docile, excellent free-range foragers.',
    physicalDescription: 'Attractive speckled brown, barred, and golden-red plumage with strong yellow shanks and robust combs.',
    variantsConfig: {
      type: 'live',
      genders: ['Female Pullet (Point-of-Lay)', 'Breeding Trio (2 Hens + 1 Rooster)'],
      breeds: ['Kenbro Dual-Purpose Heritage']
    },
    shipWeekStatus: {
      currentShipWeek: 'Week of Sep 1, 2026',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Week of Sep 8, 2026',
      availableShipWeeks: ['Week of Sep 1, 2026', 'Week of Sep 8, 2026'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-tube-feeder-15l', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    liveData: {
      breed: 'Kenbro',
      liveCategory: 'layer',
      ageWeeks: 18,
      weightRangeKg: { min: 1.6, max: 1.85 },
      sex: 'female',
      vaccinationRecord: [
        { vaccine: 'Full 16-Week Avian Shield (Marek/NCD/IB/Pox/Cholera)', dateAdministered: '2026-07-15' }
      ],
      sourceFarmId: 'farm-3',
      batchId: 'BATCH-2026-KB18',
      minOrderQty: 5,
      mortalityPolicy: 'replace',
      pricePerBird: 880,
      transportZoneAvailability: ['Eldoret', 'Kitale', 'Kisumu', 'Nairobi Express']
    },
    reviewsList: [
      {
        id: 'rev-kb-1',
        author: 'Lucy Chepkemoi',
        rating: 5,
        date: '2026-08-14',
        comment: 'Healthy, heavy pullets. Commenced laying deep brown eggs in their second week. Very gentle around the garden.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Eldoret'
      }
    ]
  },

  // 16. LIVE BIRDS - BLACK AUSTRALORP CHICKS
  {
    id: 'prod-black-australorp-chicks',
    name: 'Black Australorp Heritage Day-Old Chicks (World Record Layer)',
    description: 'Purebred Black Australorp day-old chicks. Famous for setting world egg-laying records (250-300 large brown eggs/yr), docile temperament, and lustrous iridescent beetle-green plumage.',
    price: 165,
    wholesalePrice: 145,
    wholesaleMinQty: 50,
    rating: 4.98,
    reviewsCount: 65,
    category: 'live-birds',
    subCategory: 'day-old-chicks',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Eldoret Heritage Sanctuary',
    sellerId: 'farm-3',
    sellerBadge: 'Certified Heritage',
    stock: 800,
    tags: ['Black Australorp', 'Heritage Breed', 'Record Layer', 'Day-Old Chicks', 'Vaccinated'],
    badge: '300 Egg / Year Breed',
    fulfillmentType: 'live-climate',
    story: 'Originating as an Australian improvement of the Black Orpington, the Australorp holds the world record for laying 364 eggs in 365 days. Our breeding line is preserved in Eldoret for true genetic purity, deep black shanks, and docile companion temperament.',
    whyItMatters: 'Australorps are quiet, peaceful birds that do not fly over garden fences or pick fights with flock mates. They continue laying right through cold wet highland months when other breeds stop.',
    productionSpecs: {
      eggsPerWeek: '5 to 6 large brown eggs',
      hardiness: 'Exceptional cold and disease tolerance',
      climateAdaptability: 'High altitude, highland temperate, and semi-arid',
      feedConversionRatio: '2.8 kg feed per dozen eggs',
      matureWeight: 'Roosters 3.5-4.0kg, Hens 2.6-3.0kg',
      layOnsetAge: '20 to 22 weeks',
      temperatureTolerance: 'Thrives in cold highland winters'
    },
    temperament: 'Extremely docile, friendly, quiet, child-friendly homestead favorite.',
    physicalDescription: 'Jet black feathers with a brilliant iridescent emerald-green sheen in sunlight, dark slate shanks, and deep dark eyes.',
    variantsConfig: {
      type: 'live',
      genders: ['Straight Run (50/50)', 'Vent-Sexed Females (95% Pullets)'],
      breeds: ['Pure Black Australorp']
    },
    shipWeekStatus: {
      currentShipWeek: 'Week of Sep 1, 2026',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Week of Sep 8, 2026',
      availableShipWeeks: ['Week of Sep 1, 2026', 'Week of Sep 8, 2026'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-chick-starter-mash-50kg', 'prod-tube-feeder-15l'],
      bundleDiscountPercent: 10
    },
    liveData: {
      breed: 'Black Australorp',
      liveCategory: 'chick',
      ageWeeks: 0,
      weightRangeKg: { min: 0.042, max: 0.048 },
      sex: 'unsexed',
      vaccinationRecord: [
        { vaccine: "Marek's HVT In-Ovo Inoculation", dateAdministered: '2026-08-20' },
        { vaccine: 'Newcastle NCD + IB Primer Spray', dateAdministered: '2026-08-20' }
      ],
      sourceFarmId: 'farm-3',
      batchId: 'BATCH-2026-AUS9',
      minOrderQty: 25,
      mortalityPolicy: 'replace',
      pricePerBird: 165,
      transportZoneAvailability: ['Eldoret', 'Kitale', 'Kisumu', 'Nairobi Express']
    },
    reviewsList: [
      {
        id: 'rev-aus-1',
        author: 'Esther Korir',
        rating: 5,
        date: '2026-08-16',
        comment: 'Beautiful little black chicks with lovely green sheen starting to show on wing pinfeathers. 100% survival rate after 3 weeks.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Kericho'
      }
    ]
  },

  // 17. LIVE BIRDS - 4-WEEK STARTED BROILER GROWERS
  {
    id: 'prod-grower-broilers',
    name: 'Started Broiler Growers (4 Weeks, Off-Heat, 1.2kg)',
    description: 'Fully feathered 4-week-old broiler growers. Completely off brooding heat, vaccinated against Newcastle and Gumboro. Ready for direct pen finishing for slaughter in 10-14 days.',
    price: 420,
    wholesalePrice: 380,
    wholesaleMinQty: 25,
    rating: 4.92,
    reviewsCount: 45,
    category: 'live-birds',
    subCategory: 'growers-broilers',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 450,
    tags: ['Grower Broilers', '4-Weeks', 'Off-Heat', 'Fast Finish', 'Vaccinated'],
    badge: 'Zero Brooder Cost',
    fulfillmentType: 'live-climate',
    story: 'Ideal for smallholders and commercial meat rearers who want to bypass the high-risk, energy-intensive 28-day brooding phase. These birds have completed brooding in our temperature-regulated Limuru houses and are thriving on commercial grower pellets.',
    whyItMatters: 'Save on brooder charcoal, infrared electricity, and early chick mortality. Feed these birds for just 10-14 days with standard broiler finisher to harvest heavy 2.0kg-2.4kg dressed birds.',
    productionSpecs: {
      eggsPerWeek: 'N/A (Meat Broiler)',
      hardiness: 'Fully feathered, hardy immune system',
      climateAdaptability: 'Does not require brooder heat (ambient coop temperature)',
      feedConversionRatio: '1.7 kg feed per kg weight gain during finish',
      matureWeight: 'Currently 1.1kg - 1.3kg; reaches 2.2kg in 12 days',
      layOnsetAge: 'N/A',
      temperatureTolerance: 'Ambient coop temperatures (18°C - 26°C)'
    },
    temperament: 'Docile, active feeders.',
    physicalDescription: 'Full white feather coverage, clean yellow legs, broad chest frame.',
    variantsConfig: {
      type: 'live',
      genders: ['Straight Run Mixed'],
      breeds: ['Cobb 500 Started Grower']
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Dispatched in Climate Crates',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Weekly Batch Availability',
      availableShipWeeks: ['Weekly Dispatch Slots'],
      allowNotifyMe: true
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-tube-feeder-15l', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    liveData: {
      breed: 'Cobb 500 Grower',
      liveCategory: 'grower',
      ageWeeks: 4,
      weightRangeKg: { min: 1.1, max: 1.3 },
      sex: 'unsexed',
      vaccinationRecord: [
        { vaccine: "Marek's HVT + Newcastle NCD Primer", dateAdministered: '2026-07-28' },
        { vaccine: 'Gumboro IBD Booster', dateAdministered: '2026-08-10' }
      ],
      sourceFarmId: 'farm-2',
      batchId: 'BATCH-2026-GR4W',
      minOrderQty: 10,
      mortalityPolicy: 'replace',
      pricePerBird: 420,
      transportZoneAvailability: ['Nairobi Metro', 'Kiambu', 'Machakos', 'Nakuru']
    },
    reviewsList: [
      {
        id: 'rev-grw-1',
        author: 'Wilson Mwiti',
        rating: 5,
        date: '2026-08-12',
        comment: 'Best decision ever to buy 4-week growers! No brooding stress at all. We slaughtered them at day 14 and got 2.3kg birds.',
        avatarColor: 'bg-amber-700',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Rongai'
      }
    ]
  },

  // 18. FRESH POULTRY - CLEANED GIZZARDS
  {
    id: 'prod-fresh-gizzards-1kg',
    name: 'Farm-Fresh Cleaned Chicken Gizzards (1kg Vacuum Pack)',
    description: 'Hand-cleaned and washed prime chicken gizzards. Yellow digestive lining fully peeled and fat-trimmed. Rich in iron, zinc, and collagen for hearty traditional stews and dry-fry delicacies.',
    price: 480,
    wholesalePrice: 410,
    wholesaleMinQty: 10,
    rating: 4.93,
    reviewsCount: 88,
    category: 'fresh-poultry',
    subCategory: 'giblets-offal',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 250,
    tags: ['Gizzards', 'Offal', 'Halal', '1kg Pack', 'Air-Chilled'],
    badge: '100% Cleaned & Peeled',
    fulfillmentType: 'chilled-express',
    story: 'Carefully prepared during our daily morning dressing cycle in Limuru. Each gizzard is halved, thoroughly washed with purified water, and peeled of all inner yellow keratin lining so you can cook immediately without painstaking prep work.',
    whyItMatters: 'Chicken gizzards are a dense nutrient powerhouse offering 27g protein per 100g serving with deep culinary texture that absorbs garlic, chili, and tomato gravies deliciously.',
    productionSpecs: {
      carcassYield: '1.0 kg vacuum sealed pouch',
      hardiness: 'Halal Certified & DVS Inspected',
      climateAdaptability: 'Store at 0°C to 4°C chilled',
      feedConversionRatio: 'Air-chilled zero water absorption',
      matureWeight: '1.0 kg net pouch',
      temperatureTolerance: 'Boil or braise until tender, finish with dry-fry'
    },
    temperament: 'N/A',
    physicalDescription: 'Deep ruby-red firm muscular meat, cleanly trimmed with zero grit or residual lining.',
    variantsConfig: {
      type: 'cut',
      weightBands: [
        { label: '1.0 kg Pack', weightKg: 1.0, priceDiff: 0 },
        { label: '2.5 kg Catering Pouch', weightKg: 2.5, priceDiff: 700 }
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
      productIds: ['prod-fresh-wings-1kg', 'prod-fresh-drumsticks-1kg'],
      bundleDiscountPercent: 8
    },
    freshData: {
      cutType: 'Cleaned Gizzards',
      boneStatus: 'boneless',
      skinStatus: 'skinless',
      weightEstKg: 1.0,
      weightTolerancePercent: 5,
      pricePerKg: 480,
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
        id: 'rev-giz-1',
        author: 'Caroline Muthoni',
        rating: 5,
        date: '2026-08-17',
        comment: 'Finally gizzards that are genuinely clean! Zero sand or unpleasant smell. Fried them with onions and capsicum, they were tender and flavorful.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Langata, Nairobi'
      }
    ]
  },

  // 19. FRESH POULTRY - CHICKEN THIGHS & QUARTERS
  {
    id: 'prod-fresh-thighs-1kg',
    name: 'Juicy Farm-Fresh Chicken Thighs & Quarters (1kg Skin-On)',
    description: 'Plump bone-in chicken thighs with golden skin intact. Super juicy dark meat that retains natural succulence under high-heat roasting, pan searing, and rich curries.',
    price: 760,
    wholesalePrice: 660,
    wholesaleMinQty: 10,
    rating: 4.95,
    reviewsCount: 132,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 380,
    tags: ['Chicken Thighs', 'Skin-On', 'Bone-In', 'Halal', 'Air-Chilled', '1kg Pack'],
    badge: 'Extra Juicy Dark Meat',
    fulfillmentType: 'chilled-express',
    story: 'Portioned from pasture-raised poultry fed a balanced vegetarian grain ration. The intact skin crisps up to a golden crackle while locking inside all natural juices.',
    whyItMatters: 'Unlike white meat which can dry out if overcooked, chicken thighs stay moist, making them the preferred choice for family braises, pilau, and barbecue smokers.',
    productionSpecs: {
      carcassYield: '1.0 kg pack (approx 4-6 plump bone-in thighs)',
      hardiness: 'Halal Certified',
      climateAdaptability: 'Chilled delivery at 0°C to 4°C',
      feedConversionRatio: 'Air-chilled zero water gain',
      matureWeight: '1.0 kg net weight',
      temperatureTolerance: 'Cook to minimum 75°C'
    },
    temperament: 'N/A',
    physicalDescription: 'Plump rounded thighs with clean skin coverage, natural yellow pigmentation, and intact bone marrow.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Bone-In', 'Boneless Skin-On Thighs'],
      skinOptions: ['Skin-On (Crispy Roast)', 'Skinless'],
      weightBands: [
        { label: '1.0 kg Standard Pack', weightKg: 1.0, priceDiff: 0 },
        { label: '2.5 kg Family Pack', weightKg: 2.5, priceDiff: 1100 }
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
      productIds: ['prod-fresh-wings-1kg', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 10
    },
    freshData: {
      cutType: 'Thighs & Quarters',
      boneStatus: 'bone-in',
      skinStatus: 'skin-on',
      weightEstKg: 1.0,
      weightTolerancePercent: 5,
      pricePerKg: 760,
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
        id: 'rev-thi-1',
        author: 'George Odhiambo',
        rating: 5,
        date: '2026-08-14',
        comment: 'Crispy skin when baked in the oven at 200°C! The meat was super juicy right down to the bone. Excellent butcher cut.',
        avatarColor: 'bg-blue-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Parklands, Nairobi'
      }
    ]
  },

  // 20. FRESH POULTRY - WHOLE DRESSED BROILER
  {
    id: 'prod-whole-dressed-broiler',
    name: 'Whole Dressed Tender Broiler (1.2-1.4kg, Air-Chilled Halal)',
    description: 'Tender farm-raised whole broiler chicken. Freshly slaughtered, defeathered, eviscerated, and air-chilled. Ready for Sunday whole-roasting, rotisserie, or partitioning into family stew pieces.',
    price: 720,
    wholesalePrice: 620,
    wholesaleMinQty: 10,
    rating: 4.96,
    reviewsCount: 180,
    category: 'fresh-poultry',
    subCategory: 'whole-dressed',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 450,
    tags: ['Whole Broiler', 'Dressed Chicken', 'Air-Chilled', 'Halal', 'Roasting Chicken'],
    badge: 'Tender Roaster',
    fulfillmentType: 'chilled-express',
    story: 'Grown on balanced bio-grain diets and dressed under strict sanitary inspection in our Limuru facility. Rapid cold-air chilling drops internal meat temperature to 2°C within 45 minutes, preserving the meat\'s tender muscle fibers.',
    whyItMatters: 'A true 100% air-chilled bird has crisp skin and does not leak pints of chlorinated water during roasting, yielding rich caramelized gravy and juicy meat.',
    productionSpecs: {
      carcassYield: '1.2kg to 1.4kg net carcass (giblets included separately)',
      hardiness: 'Halal Certified & DVS Inspected',
      climateAdaptability: 'Maintain chilled cold chain at 0°C to 4°C',
      feedConversionRatio: 'Air-chilled zero water gain',
      matureWeight: '1.3 kg average pack weight',
      temperatureTolerance: 'Roast at 190°C for 50-60 minutes'
    },
    temperament: 'N/A',
    physicalDescription: 'Clean cream-white skin, plump breast, neatly trussed legs, complete clean carcass.',
    variantsConfig: {
      type: 'cut',
      boneOptions: ['Whole Intact Carcass', 'Cut into 8 Stew Pieces'],
      skinOptions: ['Skin-On'],
      weightBands: [
        { label: 'Standard Roaster (1.2 - 1.4 kg)', weightKg: 1.3, priceDiff: 0 },
        { label: 'Large Family Bird (1.5 - 1.7 kg)', weightKg: 1.6, priceDiff: 150 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Daily Morning & Afternoon Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fresh-wings-1kg', 'prod-jumbo-golden-table-eggs'],
      bundleDiscountPercent: 10
    },
    freshData: {
      cutType: 'Whole Dressed Broiler with Giblets',
      boneStatus: 'bone-in',
      skinStatus: 'skin-on',
      weightEstKg: 1.3,
      weightTolerancePercent: 8,
      pricePerKg: 550,
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
        id: 'rev-wbr-1',
        author: 'Brenda Cherono',
        rating: 5,
        date: '2026-08-16',
        comment: 'Roasted whole with rosemary butter and garlic. The breast remained super tender and the skin was paper-thin crispy!',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Kileleshwa, Nairobi'
      }
    ]
  },

  // 21. FRESH POULTRY - ARTISAN CHICKEN SAUSAGES
  {
    id: 'prod-artisan-chicken-sausages',
    name: 'Artisan Farmhouse Chicken Sausages (500g / 8 Pcs, Garden Herbs)',
    description: '100% pure chicken breast & thigh meat coarsely ground with sage, thyme, black pepper, and garlic in natural collagen casings. Zero soy fillers, nitrates, or artificial coloring.',
    price: 450,
    wholesalePrice: 380,
    wholesaleMinQty: 10,
    rating: 4.94,
    reviewsCount: 76,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 200,
    tags: ['Sausages', 'Chicken Sausages', '100% Pure Meat', 'Artisan', 'Halal', 'No Fillers'],
    badge: '100% Meat • Zero Fillers',
    fulfillmentType: 'chilled-express',
    story: 'Crafted in small batches at our Limuru butchery using whole deboned chicken cuts and garden herbs grown in Kiambu soil. Lightly seasoned and portioned for healthy family breakfasts and sizzling grills.',
    whyItMatters: 'Commercial sausages often contain up to 50% soy flour, rusk, and MSG. Our artisan sausages are pure lean poultry meat with exceptional natural snap and savory herb aroma.',
    productionSpecs: {
      carcassYield: '500g pack containing 8 thick artisanal links',
      hardiness: 'Halal Certified',
      climateAdaptability: 'Store at 0°C to 4°C chilled, or freeze up to 3 months',
      feedConversionRatio: 'N/A',
      matureWeight: '500g net per pack',
      temperatureTolerance: 'Pan fry gently over medium heat for 10-12 minutes'
    },
    temperament: 'N/A',
    physicalDescription: 'Plump artisanal links with visible green flecks of parsley and cracked black pepper.',
    variantsConfig: {
      type: 'cut',
      weightBands: [
        { label: '500g Pack (8 Sausages)', weightKg: 0.5, priceDiff: 0 },
        { label: '1.0 kg Family Pack (16 Sausages)', weightKg: 1.0, priceDiff: 400 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Daily Chilled Delivery',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-jumbo-golden-table-eggs', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 10
    },
    freshData: {
      cutType: 'Artisan Sausages',
      boneStatus: 'boneless',
      skinStatus: 'skinless',
      weightEstKg: 0.5,
      weightTolerancePercent: 2,
      pricePerKg: 900,
      slaughterDate: '2026-08-20',
      packDate: '2026-08-20',
      bestBeforeDate: '2026-08-28',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841'],
      batchId: 'BATCH-2026-SAUS',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-sau-1',
        author: 'Nadia Hassan',
        rating: 5,
        date: '2026-08-15',
        comment: 'The kids loved these for breakfast! You can immediately taste that it\'s real chicken meat without grease or heavy salt.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'South C, Nairobi'
      }
    ]
  },

  // 22. FRESH POULTRY - HICKORY SMOKED CHICKEN BREAST
  {
    id: 'prod-smoked-chicken-breast',
    name: 'Hickory-Smoked Chicken Breast Fillets (400g Sliced Pack)',
    description: 'Pasture-raised chicken breast cured with sea salt and brown sugar, then hot-smoked over indigenous hardwood for 6 hours. Sliced and ready-to-eat for gourmet salads, sandwiches, and grazing platters.',
    price: 620,
    wholesalePrice: 530,
    wholesaleMinQty: 10,
    rating: 4.97,
    reviewsCount: 52,
    category: 'fresh-poultry',
    subCategory: 'cuts',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Limuru Fresh Division',
    sellerId: 'farm-2',
    sellerBadge: 'Fresh Division',
    stock: 150,
    tags: ['Smoked Chicken', 'Ready to Eat', 'Gourmet', 'High Protein', 'Halal', 'Charcuterie'],
    badge: 'Wood-Smoked Delicacy',
    fulfillmentType: 'chilled-express',
    story: 'Slowly smoked in our brick smokehouse in Limuru using dried fruitwood embers. The natural smoke imparts a rich mahogany hue, tender succulent texture, and deep aromatic flavor without chemical smoke extracts.',
    whyItMatters: 'Fully cooked and ready to eat straight from the pack. High in clean protein (32g per 100g) with zero prep work required.',
    productionSpecs: {
      carcassYield: '400g vacuum sealed sliced pouch',
      hardiness: 'Halal Certified',
      climateAdaptability: 'Keep chilled between 0°C and 4°C',
      feedConversionRatio: 'N/A (Cured & Smoked)',
      matureWeight: '400g net weight',
      temperatureTolerance: 'Eat chilled or warm lightly in a pan'
    },
    temperament: 'N/A',
    physicalDescription: 'Tender golden-bronze smoked exterior with delicate pink interior and thin artisan slices.',
    variantsConfig: {
      type: 'cut',
      weightBands: [
        { label: '400g Sliced Pack', weightKg: 0.4, priceDiff: 0 },
        { label: '1.0 kg Whole Smoked Breast Fillet', weightKg: 1.0, priceDiff: 850 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Chilled Express Delivery',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-artisan-chicken-sausages', 'prod-jumbo-golden-table-eggs'],
      bundleDiscountPercent: 10
    },
    freshData: {
      cutType: 'Smoked Breast',
      boneStatus: 'boneless',
      skinStatus: 'skinless',
      weightEstKg: 0.4,
      weightTolerancePercent: 2,
      pricePerKg: 1550,
      slaughterDate: '2026-08-18',
      packDate: '2026-08-19',
      bestBeforeDate: '2026-09-10',
      halalCertified: true,
      certificationDocs: ['DVS-SL-8841'],
      batchId: 'BATCH-2026-SMK1',
      sourceFarmId: 'farm-2',
      storageTemp: 'chilled'
    },
    reviewsList: [
      {
        id: 'rev-smk-1',
        author: 'Julian Thorne',
        rating: 5,
        date: '2026-08-13',
        comment: 'Exceptional smoky aroma! Made club sandwiches and Caesar salads, it tasted like a 5-star hotel charcuterie.',
        avatarColor: 'bg-amber-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Runda, Nairobi'
      }
    ]
  },

  // 23. EGGS - FERTILE SASSO HATCHING EGGS
  {
    id: 'prod-fertile-hatching-eggs-sasso',
    name: 'Fertile Sasso Dual-Purpose Hatching Eggs (Tray of 30, 92%+ Fertility)',
    description: 'Candled, graded, and fertility-verified hatching eggs from pure French Sasso breeding flocks. High hatchability, thick protective shell walls, and strong embryonic vigor.',
    price: 1300,
    wholesalePrice: 1150,
    wholesaleMinQty: 10,
    rating: 4.96,
    reviewsCount: 92,
    category: 'eggs',
    subCategory: 'fertile-eggs',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 140,
    tags: ['Fertile Eggs', 'Sasso', 'Hatching Eggs', '92% Fertility', 'Incubator Ready'],
    badge: '92%+ Hatch Guarantee',
    fulfillmentType: 'chilled-express',
    story: 'Collected daily from our specialized Sasso parent flock pens in Naivasha with a 1:7 cockerel-to-hen ratio. Eggs are candled to eliminate internal blood spots or hair-cracks, disinfected using dry bio-aerosol, and held in climate-stabilized storage (16°C) for maximum fertility.',
    whyItMatters: 'Sasso chicks hatched on your own farm acclimate immediately to local conditions with zero transit stress, giving you the fastest possible start to your dual-purpose flock.',
    productionSpecs: {
      eggsPerWeek: 'Candled & fertility verified daily',
      hardiness: 'Dense calcium shells tested against transit micro-fissures',
      climateAdaptability: 'Set at 37.5°C with 55% RH for 18 days, 65% RH for hatching days',
      feedConversionRatio: 'Parent breeders fed vitamin E, selenium, and organic kelp meal',
      matureWeight: '58g to 65g optimal hatching egg size',
      temperatureTolerance: 'Do not refrigerate under 12°C'
    },
    temperament: 'N/A',
    physicalDescription: 'Uniform oval shape, rich brown shells with fine porcelain texture.',
    variantsConfig: {
      type: 'egg',
      eggGrades: ['Selected Sasso Hatching Grade (58-64g)'],
      packCounts: [
        { label: 'Standard Tray of 30 Hatching Eggs', count: 30, price: 1300 },
        { label: 'Half Crate (3 Trays / 90 Eggs)', count: 90, price: 3750 },
        { label: 'Master Breeder Case (6 Trays / 180 Eggs)', count: 180, price: 7200 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Fresh Lay This Week • Incubation Ready',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Weekly Dispatch on Tuesdays & Thursdays',
      availableShipWeeks: ['Tuesday Morning Dispatch', 'Thursday Morning Dispatch'],
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
      layDate: '2026-08-21',
      daysSinceLaid: 1,
      fertilityWindowDays: 8,
      hatchViabilityPercent: 94,
      price: 1300
    },
    reviewsList: [
      {
        id: 'rev-fe-sas-1',
        author: 'Emmanuel Kiprono',
        rating: 5,
        date: '2026-08-15',
        comment: 'Hatched 57 out of 60 eggs in our cabinet incubator! 95% hatch rate on Sasso eggs is spectacular. Chicks are robust and energetic.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Nakuru'
      }
    ]
  },

  // 24. EGGS - SPECIALTY QUAIL EGGS
  {
    id: 'prod-jumbo-quail-eggs',
    name: 'Specialty Farm-Fresh Quail Eggs (Pack of 30, Nutrient-Dense)',
    description: 'Nutrient-rich Japanese Coturnix quail eggs gathered daily from bio-secure aviaries. Packed with 3x more vitamin B1 and 5x more iron than standard chicken eggs.',
    price: 360,
    wholesalePrice: 300,
    wholesaleMinQty: 10,
    rating: 4.95,
    reviewsCount: 110,
    category: 'eggs',
    subCategory: 'specialty-eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 300,
    tags: ['Quail Eggs', 'Specialty Eggs', 'Superfood', 'Omega-3', 'High Iron'],
    badge: 'Nutrient Superfood',
    fulfillmentType: 'dry-ambient',
    story: 'Laid by healthy, stress-free Coturnix quails housed in elevated wire aviaries and fed organic high-protein gamebird mash. Packed in specialized cushioned 30-egg molded plastic clamshells.',
    whyItMatters: 'Quail eggs are celebrated worldwide as a holistic health food, known to combat seasonal allergies, boost hemoglobin levels, and provide bioavailable choline for brain development.',
    productionSpecs: {
      eggsPerWeek: 'Fresh daily collection',
      hardiness: 'Cushioned clamshell packaging prevents transit cracks',
      climateAdaptability: 'Keeps at room temperature for 30 days or refrigerated for 60 days',
      feedConversionRatio: 'Gamebird micro-nutrition with sunflower meal',
      matureWeight: '12g to 15g per egg',
      temperatureTolerance: 'Store in cool pantry away from heat'
    },
    temperament: 'N/A',
    physicalDescription: 'Charming speckled natural camouflage shell patterns with bright golden yolk domes.',
    variantsConfig: {
      type: 'egg',
      packCounts: [
        { label: 'Standard Pack of 30 Quail Eggs', count: 30, price: 360 },
        { label: 'Family Box (3 Packs / 90 Quail Eggs)', count: 90, price: 1000 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Same-Day Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-jumbo-golden-table-eggs', 'prod-boneless-breast-skinless'],
      bundleDiscountPercent: 10
    },
    eggData: {
      eggType: 'specialty',
      gradeSize: 'small',
      countPerPack: 30,
      layDate: '2026-08-21',
      daysSinceLaid: 0,
      price: 360
    },
    reviewsList: [
      {
        id: 'rev-qel-1',
        author: 'Miriam Wambui',
        rating: 5,
        date: '2026-08-16',
        comment: 'Fresh, beautiful speckled shells! Boiled them for 3 minutes for the kids\' school snack boxes. Delicious and packed with energy.',
        avatarColor: 'bg-amber-700',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Kilimani, Nairobi'
      }
    ]
  },

  // 25. EGGS - OMEGA-3 PASTURE TABLE EGGS
  {
    id: 'prod-organic-omega3-table-eggs',
    name: 'Pasture-Raised Omega-3 Golden Eggs (Tray of 30, Flaxseed Fortified)',
    description: 'Premium free-range table eggs from hens fed cold-pressed flaxseed, marigold, and organic greens. Delivers 250mg Omega-3 fatty acids per egg with brilliant deep-orange yolks.',
    price: 620,
    wholesalePrice: 540,
    wholesaleMinQty: 10,
    rating: 4.98,
    reviewsCount: 140,
    category: 'eggs',
    subCategory: 'table-eggs',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Bio-Farm',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Bio-Hatchery',
    stock: 400,
    tags: ['Omega-3', 'Table Eggs', 'Pasture Raised', 'Deep Orange Yolk', 'Organic Fed'],
    badge: '250mg Omega-3 / Egg',
    fulfillmentType: 'dry-ambient',
    story: 'Our hens spend their daylight hours wandering over lush pasture paddocks in Naivasha. Their diet is supplemented with natural flaxseed meal, organic kelp, and marigold flowers to boost DHA/EPA essential fatty acids naturally.',
    whyItMatters: 'Omega-3 fatty acids support cardiovascular health and brain function. Enjoy the deep, velvety richness of true pasture-raised eggs that make omelettes and poached eggs extraordinarily rich.',
    productionSpecs: {
      eggsPerWeek: 'Fresh daily morning collection',
      hardiness: 'Dense calcium shell structure',
      climateAdaptability: 'Store at room temperature or refrigerator',
      feedConversionRatio: 'Pasture forage + flaxseed-enriched layer ration',
      matureWeight: '60g to 65g per egg (Extra Large Grade)',
      temperatureTolerance: 'Store in dry pantry'
    },
    temperament: 'N/A',
    physicalDescription: 'Uniform large tinted brown shells, exceptionally thick albumen, and bright orange yolk domes.',
    variantsConfig: {
      type: 'egg',
      packCounts: [
        { label: 'Standard Tray of 30 Omega-3 Eggs', count: 30, price: 620 },
        { label: 'Commercial Crate (6 Trays / 180 Eggs)', count: 180, price: 3500 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'Collected Today • Ready for Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Collection Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-boneless-breast-skinless', 'prod-artisan-chicken-sausages'],
      bundleDiscountPercent: 10
    },
    eggData: {
      eggType: 'table',
      gradeSize: 'jumbo',
      countPerPack: 30,
      layDate: '2026-08-21',
      daysSinceLaid: 0,
      price: 620
    },
    reviewsList: [
      {
        id: 'rev-omg-1',
        author: 'Dr. Timothy Mutiso',
        rating: 5,
        date: '2026-08-18',
        comment: 'Unbelievable yolk color! You can see and taste the difference when poaching. These are now a permanent staple in our weekly order.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'retail',
        location: 'Lavington, Nairobi'
      }
    ]
  },

  // 26. FARM SUPPLIES - HIGH-ENERGY GROWER PELLETS
  {
    id: 'prod-chick-grower-pellets-50kg',
    name: 'High-Energy Poultry Grower Pellets (16% Protein - 50kg Bag)',
    description: 'Precision-extruded grower pellets for weeks 5 to 18. Balanced calcium-phosphorus ratio, fortified with amino acids, probiotics, and minerals for uniform frame growth and strong bone mineralization.',
    price: 3250,
    wholesalePrice: 2950,
    wholesaleMinQty: 5,
    rating: 4.93,
    reviewsCount: 68,
    category: 'farm-supplies',
    subCategory: 'feed',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Naivasha Feed Mill',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Feed Mill',
    stock: 180,
    tags: ['Grower Pellets', '16% Protein', '50kg Bag', 'Pelleted Feed', 'Anti-Dust'],
    badge: '16% Protein Formula',
    fulfillmentType: 'dry-ambient',
    story: 'Steam-pelleted at 85°C to eliminate salmonella, improve starch digestibility, and prevent feed sorting. Formulated to transition birds smoothly from starter feeds without stalling growth rates.',
    whyItMatters: 'Pelleted feeds reduce feed wastage by over 15% compared to fine dusty mash, ensuring that every bird receives an identical balance of protein, energy, and vitamins.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'Durable moisture-lined 50kg woven bag',
      climateAdaptability: 'Store in dry ventilated storeroom on pallets',
      feedConversionRatio: 'Average 60-80g/bird/day during grower phase',
      matureWeight: '50 kg net weight',
      temperatureTolerance: 'Store away from damp floors'
    },
    temperament: 'N/A',
    physicalDescription: 'Uniform 2.5mm golden-brown pellets, low dust content, easily consumed by growing birds.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '25 kg Sack', unit: '25kg Bag', price: 1750 },
        { label: '50 kg Commercial Sack', unit: '50kg Bag', price: 3250 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready for Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Dispatch',
      availableShipWeeks: ['Daily Dispatch Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-tube-feeder-15l', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'feed',
      unit: '50kg Bag',
      priceFixed: 3250,
      stockQty: 180,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-gp-1',
        author: 'Albert Tanui',
        rating: 5,
        date: '2026-08-11',
        comment: 'Birds transitioned from starter mash with zero hesitation. The pellets eliminate dust and our coops stay much cleaner.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Uasin Gishu'
      }
    ]
  },

  // 27. FARM SUPPLIES - AUTOMATIC BELL DRINKER
  {
    id: 'prod-automatic-bell-drinker',
    name: 'Automatic Poultry Bell Drinker with Suspension Hose & Ballast Valve',
    description: 'Heavy-duty automatic hanging bell drinker with water ballast tank, self-closing valve, and 3-meter food-grade PVC hose. Supplies clean, continuous water for 60 to 80 birds with zero spillage.',
    price: 1450,
    wholesalePrice: 1250,
    wholesaleMinQty: 5,
    rating: 4.95,
    reviewsCount: 84,
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
    stock: 160,
    tags: ['Bell Drinker', 'Automatic Drinker', 'Anti-Spill', '60-80 Birds', 'Equipment'],
    badge: '1 Drinker / 80 Birds',
    fulfillmentType: 'dry-ambient',
    story: 'The cornerstone of modern bio-secure poultry housing. Automatically refills to a preset water depth using a gravity-sensitive internal spring and ballast tank that prevents swinging, tipping, or overflowing.',
    whyItMatters: 'Wet coop litter is the #1 cause of coccidiosis outbreaks, ammonia eye burns, and foot lesions. Bell drinkers keep litter completely dry and eliminate the daily labor of manual water buckets.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'UV-stabilized virgin HDPE plastic with brass valve fitting',
      climateAdaptability: 'Connects to standard gravity-fed overhead water tanks',
      feedConversionRatio: 'Ensures 24/7 clean water access for peak feed conversion',
      matureWeight: 'Complete kit with hose, clamp, and rope adjuster',
      temperatureTolerance: 'Durable in extreme heat and cold'
    },
    temperament: 'N/A',
    physicalDescription: 'Bright red water bell trough with yellow suspension hanger and white ballast chamber.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: 'Single Complete Bell Drinker Unit', unit: 'Unit', price: 1450 },
        { label: 'Pack of 5 Commercial Bell Drinkers', unit: '5 Pack', price: 6800 }
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
      productIds: ['prod-tube-feeder-15l', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'equipment',
      unit: 'Unit',
      priceFixed: 1450,
      stockQty: 160,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-bdr-1',
        author: 'Daniel Wekesa',
        rating: 5,
        date: '2026-08-08',
        comment: 'Hooked up 6 drinkers to our 500L tank. Worked flawlessly! Litter stayed bone dry and cut our morning chores in half.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Kitale'
      }
    ]
  },

  // 28. FARM SUPPLIES - INFRARED CERAMIC BROODER HEAT LAMP
  {
    id: 'prod-infrared-heat-lamp',
    name: 'Infrared Ceramic Brooder Heat Lamp (250W with Heavy Aluminum Reflector)',
    description: 'Heavy-duty 250W infrared ceramic heat emitter with deep aluminum parabolic reflector hood and protective safety wire guard. Provides radiant thermal warmth for up to 200 chicks without sleep-disrupting glare.',
    price: 2200,
    wholesalePrice: 1900,
    wholesaleMinQty: 3,
    rating: 4.96,
    reviewsCount: 72,
    category: 'farm-supplies',
    subCategory: 'equipment',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Poultry Equipment Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Equipment',
    stock: 90,
    tags: ['Heat Lamp', 'Brooder Lamp', '250W Infrared', 'Chick Warmth', 'Equipment'],
    badge: 'Heats 200 Chicks',
    fulfillmentType: 'dry-ambient',
    story: 'Engineered for energy efficiency and chick welfare. Emits 99% pure infrared thermal rays that penetrate directly into the chicks\' muscular tissue, stimulating blood circulation and appetite without the harsh bright light that triggers feather pecking.',
    whyItMatters: 'Maintaining a steady 32-35°C brooder temperature during the first 7 days prevents chilling and huddling, which are responsible for the vast majority of early chick mortalities.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'Ceramic heating element rated for 15,000+ continuous hours',
      climateAdaptability: 'Fits standard 220-240V E27 porcelain ceramic bulb sockets',
      feedConversionRatio: 'Prevents metabolic energy waste from shivering',
      matureWeight: 'Complete hood with 2m heat-resistant power cable and hanging chain',
      temperatureTolerance: 'Heat-resistant porcelain socket'
    },
    temperament: 'N/A',
    physicalDescription: 'Spun aluminum reflective shade with heavy wire mesh bottom guard to prevent chicks from touching the heating bulb.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: 'Complete 250W Lamp + Reflector Hood Kit', unit: 'Kit', price: 2200 },
        { label: 'Replacement 250W Ceramic Bulb Only', unit: 'Bulb', price: 950 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready to Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Parcel Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-rainbow-rooster-chicks', 'prod-chick-starter-mash-50kg'],
      bundleDiscountPercent: 12
    },
    supplyData: {
      supplyCategory: 'equipment',
      unit: 'Kit',
      priceFixed: 2200,
      stockQty: 90,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-hlp-1',
        author: 'Moses Gathogo',
        rating: 5,
        date: '2026-08-07',
        comment: 'Kept our 200 chicks evenly spread and happy during July cold nights in Nyandarua. Zero huddling or piling.',
        avatarColor: 'bg-amber-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Nyandarua'
      }
    ]
  },

  // 29. FARM SUPPLIES - AUTOMATIC DIGITAL EGG INCUBATOR
  {
    id: 'prod-digital-egg-incubator-56',
    name: 'Automatic Digital Egg Incubator (56-Egg Capacity with Auto-Turning & Candler)',
    description: 'Microcomputer-controlled digital egg incubator with automatic 360° roller turning, multi-channel humidity channels, dynamic temperature display, and built-in LED candling lamps for every egg slot.',
    price: 8800,
    wholesalePrice: 7900,
    wholesaleMinQty: 2,
    rating: 4.97,
    reviewsCount: 56,
    category: 'farm-supplies',
    subCategory: 'equipment',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Poultry Equipment Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Certified Equipment',
    stock: 40,
    tags: ['Incubator', '56-Egg', 'Automatic Turning', 'LED Candler', 'Digital Control'],
    badge: 'Dual AC/DC 12V Backup',
    fulfillmentType: 'dry-ambient',
    story: 'Designed for high hatchability across chicken, duck, quail, and heritage fowl eggs. Features intelligent dual-power switching that connects seamlessly to a 12V solar car battery during grid power outages.',
    whyItMatters: 'Grid blackouts can ruin an entire batch of incubating eggs. The automatic 12V battery changeover ensures incubation temperatures never drop below critical levels.',
    productionSpecs: {
      eggsPerWeek: 'Holds 56 chicken eggs or 150 quail eggs',
      hardiness: 'Impact-resistant ABS plastic with transparent observation hood',
      climateAdaptability: 'Digital sensor accuracy ±0.1°C temperature and ±1% humidity',
      feedConversionRatio: 'Achieves 90%+ hatch rate on fertile eggs',
      matureWeight: '4.5 kg unit weight',
      temperatureTolerance: 'Operates on 220V AC mains + 12V DC battery clamp'
    },
    temperament: 'N/A',
    physicalDescription: 'Compact incubator with transparent 360-degree viewing dome, blue backlit digital LCD panel, and individually lit egg candler holders.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '56-Egg Automatic Incubator (AC/DC Solar Ready)', unit: 'Unit', price: 8800 },
        { label: '128-Egg Double Decker Commercial Incubator', unit: 'Unit', price: 16500 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Inspected & Tested',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Courier Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-fertile-hatching-eggs-kuroiler', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 12
    },
    supplyData: {
      supplyCategory: 'equipment',
      unit: 'Unit',
      priceFixed: 8800,
      stockQty: 40,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-inc-1',
        author: 'Geoffrey Mureithi',
        rating: 5,
        date: '2026-08-04',
        comment: 'Hatched 51 Kienyeji chicks on my first attempt! The built-in candler LEDs are so convenient for checking development at day 7 and 14.',
        avatarColor: 'bg-emerald-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Embu'
      }
    ]
  },

  // 30. FARM SUPPLIES - NEWCASTLE + GUMBORO VACCINE COMBO
  {
    id: 'prod-gumboro-newcastle-vaccine-combo',
    name: 'Newcastle (NCD) + Gumboro (IBD) Vaccine Protection Kit (1000 Doses)',
    description: 'Veterinary-grade freeze-dried live vaccine combo with sterile diluent and blue dye tracker. Essential immune shield against Newcastle disease (Lasota) and Infectious Bursal Disease for up to 1000 birds.',
    price: 1850,
    wholesalePrice: 1600,
    wholesaleMinQty: 3,
    rating: 4.98,
    reviewsCount: 115,
    category: 'farm-supplies',
    subCategory: 'vaccines-meds',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Avian Health Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Health & Wellness',
    stock: 100,
    tags: ['Vaccine', 'Newcastle', 'Gumboro', '1000 Doses', 'Cold Chain', 'Avian Health'],
    badge: 'Cold-Chain Insulated Box',
    fulfillmentType: 'chilled-express',
    story: 'Manufactured under strict KEBS and DVS biological standards. Shipped in insulated styrofoam boxes packed with reusable gel ice packs to ensure 2°C to 8°C cold-chain viability during transit.',
    whyItMatters: 'Newcastle and Gumboro diseases can wipe out 80-100% of an unvaccinated flock in under 72 hours. Timely vaccination via drinking water or eye-drop provides bulletproof protection.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'Freeze-dried glass vial with blue administration tracker',
      climateAdaptability: 'Must be stored in refrigerator at 2°C to 8°C',
      feedConversionRatio: 'N/A',
      matureWeight: '1000 Dose Kit with sterile diluent and dropper',
      temperatureTolerance: 'Do not freeze diluent; keep vaccine chilled'
    },
    temperament: 'N/A',
    physicalDescription: 'Compact vacuum-sealed glass vial with sterile mixing diluent and blue marker dye.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '500 Dose Backyard Shield Kit', unit: 'Kit', price: 1100 },
        { label: '1000 Dose Commercial Kit', unit: 'Kit', price: 1850 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Cold Storage • Chilled Van Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Daily Delivery',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-avian-multivitamin-1kg', 'prod-chick-starter-mash-50kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'vaccine',
      unit: 'Kit',
      priceFixed: 1850,
      stockQty: 100,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-vac-1',
        author: 'Dr. Anne Wanjiku',
        rating: 5,
        date: '2026-08-10',
        comment: 'Arrived in an insulated ice box with the cold packs still frozen solid. Excellent cold-chain handling by ChickMagnet.',
        avatarColor: 'bg-emerald-700',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Kiambu'
      }
    ]
  },

  // 31. FARM SUPPLIES - BROAD-SPECTRUM POULTRY DEWORMER
  {
    id: 'prod-poultry-dewormer-piperazine',
    name: 'Broad-Spectrum Avian Dewormer (Piperazine Soluble 500g)',
    description: 'Veterinary water-soluble dewormer for layers, broilers, and indigenous poultry. Eradicates Ascaridia (large roundworms), Capillaria, and cecal worms with zero egg withdrawal period.',
    price: 950,
    wholesalePrice: 800,
    wholesaleMinQty: 5,
    rating: 4.94,
    reviewsCount: 62,
    category: 'farm-supplies',
    subCategory: 'vaccines-meds',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Avian Health Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Health & Wellness',
    stock: 120,
    tags: ['Dewormer', 'Piperazine', 'Avian Health', 'Water Soluble', '500g Tub'],
    badge: 'Zero Egg Withdrawal',
    fulfillmentType: 'dry-ambient',
    story: 'Regular deworming every 6-8 weeks is essential for free-range and deep-litter poultry. Internal parasites rob birds of nutrients, causing pale combs, stunted growth, and sudden drops in egg production.',
    whyItMatters: 'Safe for laying hens with zero egg withdrawal period—you can continue selling and eating eggs safely throughout treatment.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'Moisture-proof sealed canister',
      climateAdaptability: 'Dissolves easily in flock drinking water (10g per 5 Litres water)',
      feedConversionRatio: 'Restores nutrient absorption and egg output',
      matureWeight: '500g net powder',
      temperatureTolerance: 'Store in cool dry place'
    },
    temperament: 'N/A',
    physicalDescription: 'Fine white soluble powder that mixes clear in flock drinking water.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '200g Backyard Container', unit: '200g Tub', price: 450 },
        { label: '500g Commercial Container', unit: '500g Tub', price: 950 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready to Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Parcel Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-avian-multivitamin-1kg', 'prod-tube-feeder-15l'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'vaccine',
      unit: '500g Tub',
      priceFixed: 950,
      stockQty: 120,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-dwm-1',
        author: 'Eunice Nyambura',
        rating: 5,
        date: '2026-08-06',
        comment: 'Dewormed our 300 Kienyeji layers. Within a week, combs were bright red again and daily egg collection jumped by 15%!',
        avatarColor: 'bg-amber-800',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Murang\'a'
      }
    ]
  },

  // 32. FARM SUPPLIES - VIRKON-S BIOSECURITY DISINFECTANT
  {
    id: 'prod-biosecurity-disinfectant-5l',
    name: 'Virkon-S Biosecurity Footbath & Coop Disinfectant Concentrate (5 Litres)',
    description: 'High-potency broad-spectrum virucidal and bactericidal disinfectant wash. DEFRA-approved formula kills 500+ strains of viruses, bacteria, and fungi including Avian Influenza (Bird Flu), Newcastle, and Salmonella.',
    price: 3800,
    wholesalePrice: 3350,
    wholesaleMinQty: 2,
    rating: 4.98,
    reviewsCount: 74,
    category: 'farm-supplies',
    subCategory: 'biosecurity',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
    ],
    sellerName: 'Avian Health Dept',
    sellerId: 'farm-1',
    sellerBadge: 'Health & Wellness',
    stock: 75,
    tags: ['Biosecurity', 'Disinfectant', 'Virkon-S', 'Footbath', '5 Litres', 'Coop Sanitizer'],
    badge: 'DEFRA Bio-Approved',
    fulfillmentType: 'dry-ambient',
    story: 'The global gold standard in livestock biosecurity. Used for entry footbaths, vehicle wheel dips, crate sanitization, aerial spray disinfection, and terminal house cleanout between batches.',
    whyItMatters: 'Biosecurity is the first and most effective defense against disease. Diluting at 1:100 (10ml per Litre water) creates a fast-acting pink sanitizing solution that destroys pathogens on contact in under 10 minutes.',
    productionSpecs: {
      eggsPerWeek: 'N/A',
      hardiness: 'Heavy-duty 5L HDPE jerrycan with tamper-evident seal',
      climateAdaptability: 'Retains sanitizing potency even in hard water and organic matter',
      feedConversionRatio: 'N/A',
      matureWeight: '5.0 Litre liquid concentrate',
      temperatureTolerance: 'Store in cool chemical storeroom'
    },
    temperament: 'N/A',
    physicalDescription: 'Concentrated solution with built-in pink color indicator showing active disinfectant potency.',
    variantsConfig: {
      type: 'supply',
      supplySizes: [
        { label: '1.0 Litre Concentrate', unit: '1L Bottle', price: 950 },
        { label: '5.0 Litre Commercial Jerrycan', unit: '5L Jerrycan', price: 3800 }
      ]
    },
    shipWeekStatus: {
      currentShipWeek: 'In Stock • Ready to Dispatch',
      isSoldOutForWeek: false,
      nextAvailableWeek: 'Immediate Parcel Dispatch',
      availableShipWeeks: ['Daily Delivery Available'],
      allowNotifyMe: false
    },
    frequentlyBoughtTogether: {
      productIds: ['prod-automatic-bell-drinker', 'prod-avian-multivitamin-1kg'],
      bundleDiscountPercent: 10
    },
    supplyData: {
      supplyCategory: 'biosecurity',
      unit: '5L Jerrycan',
      priceFixed: 3800,
      stockQty: 75,
      requiresPrescription: false
    },
    reviewsList: [
      {
        id: 'rev-bio-1',
        author: 'Major Patrick Mwangi',
        rating: 5,
        date: '2026-08-09',
        comment: 'We use this in all farm entrance footbaths and for power-washing our broiler houses between cycles. Zero disease outbreaks across 4 batches.',
        avatarColor: 'bg-emerald-900',
        verifiedBuyer: true,
        buyerType: 'farmer',
        location: 'Naivasha'
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

