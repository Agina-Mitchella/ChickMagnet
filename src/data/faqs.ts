export interface FAQItem {
  id: string;
  q: string;
  a: string;
  category?: string;
}

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    q: 'What is the difference between Improved Kienyeji, Sasso, Kenbro and Kuroiler?',
    a: 'In Kenya, Sasso, Kenbro and Kuroiler are often grouped under improved kienyeji because they are improved dual-purpose birds for meat and eggs. They are still distinct types. Improved Kienyeji is the locally rooted option, Sasso is commonly chosen for stronger meat growth, Kenbro is a balanced free-range bird, and Kuroiler is known for active foraging and adaptability in lower-input systems. Results depend on feed, housing and flock management.',
    category: 'Choosing Live Chicken',
  },
  {
    id: 'faq-2',
    q: 'Are chicks male or female?',
    a: 'Chicks are sold unsexed, so ChickMagnet cannot guarantee a particular number of male or female birds. The farm team tries to provide a balanced mix where possible.',
    category: 'Choosing Live Chicken',
  },
  {
    id: 'faq-3',
    q: 'Which vaccinations do ChickMagnet birds receive?',
    a: 'ChickMagnet follows a veterinarian-certified vaccination schedule. It covers the day-old hatchery vaccines, Newcastle and infectious bronchitis at days 10 to 12, Gumboro at days 18 to 21, fowl pox at week 6, fowl typhoid at week 8, and a Newcastle booster at week 18. Every bird receives every dose due by its selected age. We provide the current batch record, and the buyer is responsible for any later doses after delivery.',
    category: 'Vaccination & Care',
  },
  {
    id: 'faq-4',
    q: 'What should I prepare before chicks arrive?',
    a: 'Prepare clean, dry and secure housing before delivery. Day-old and young chicks need a pre-heated brooder, suitable lighting, fresh air without cold draughts, dry litter, chick feed, clean water, feeders and drinkers. Keep basic farm records and arrange the remaining vaccination and veterinary plan. Older birds still need secure housing, ventilation, clean water, suitable feed and a gradual transition into the new flock.',
    category: 'Vaccination & Care',
  },
  {
    id: 'faq-5',
    q: 'Does a product shown on the website mean it is available immediately?',
    a: 'No. Place the order and make the product payment first. ChickMagnet will then confirm the current batch and contact you with the exact delivery date.',
    category: 'Availability & Delivery',
  },
  {
    id: 'faq-6',
    q: 'Can I mix breeds or ages to reach the wholesale minimum?',
    a: 'No. The minimum is 10 chickens of one breed and one age from the same product listing. Different breeds or age groups cannot be combined to reach that minimum.',
    category: 'Commercial Wholesale',
  },
  {
    id: 'faq-7',
    q: 'Do wholesale orders receive a discount?',
    a: 'There is no automatic wholesale discount. ChickMagnet may offer a discount at its discretion depending on the quantity ordered.',
    category: 'Commercial Wholesale',
  },
  {
    id: 'faq-8',
    q: 'Where does ChickMagnet deliver and how much does delivery cost?',
    a: 'ChickMagnet delivers countrywide in Kenya. Delivery is quoted separately after the order is reviewed because the fee depends on distance, order size and the handling required for live birds, chilled products or eggs. The website product total does not include delivery.',
    category: 'Availability & Delivery',
  },
  {
    id: 'faq-9',
    q: 'What should I do if chicks arrive weak, injured or dead?',
    a: 'Report the problem to ChickMagnet immediately after delivery. Keep the affected chicks and order details available so the farm team can review what happened and advise the next step.',
    category: 'After Delivery',
  },
  {
    id: 'faq-10',
    q: 'How does ChickMagnet keep dressed chicken and cuts fresh?',
    a: 'Fresh chicken and cuts are kept refrigerated. ChickMagnet aims to dress the chicken on the delivery day or one day before delivery, then keeps it cold until handover.',
    category: 'Fresh Chicken',
  },
  {
    id: 'faq-11',
    q: 'What happens if my requested product becomes unavailable after payment?',
    a: 'You can choose a suitable substitute or receive a full refund for the unavailable product.',
    category: 'Availability & Delivery',
  },
  {
    id: 'faq-12',
    q: 'How long does M-Pesa confirmation take?',
    a: 'Manual M-Pesa confirmation usually takes between 2 and 24 hours after you send the full confirmation message to ChickMagnet.',
    category: 'Payment',
  },
];

const LEGACY_FAQ_QUESTIONS = new Set([
  'How does ChickMagnet guarantee 100% Live Arrival for Day-Old Chicks?',
  'What bio-security measures are taken at partner hatcheries?',
  'How does Wholesale Net-30 work for commercial buyers?',
  'How are fresh dressed poultry weights handled for billing?',
]);

const PREVIOUS_VACCINATION_COPY = 'ChickMagnet keeps a care and vaccination record for each batch and completes the vaccinations due by the selected age. The exact record depends on the batch, age and veterinary direction. Ask for the current batch record and confirm the next dose with a qualified veterinary or livestock professional before the birds arrive.';

export function normalizeStoredFAQs(value: unknown): FAQItem[] {
  if (!Array.isArray(value)) return INITIAL_FAQS;

  const parsed = value.filter((faq): faq is FAQItem => (
    typeof faq === 'object'
    && faq !== null
    && typeof faq.id === 'string'
    && typeof faq.q === 'string'
    && typeof faq.a === 'string'
    && (faq.category === undefined || typeof faq.category === 'string')
  ));
  if (parsed.length !== value.length) return INITIAL_FAQS;

  const isUneditedLegacySet = parsed.length === LEGACY_FAQ_QUESTIONS.size
    && parsed.every(faq => LEGACY_FAQ_QUESTIONS.has(faq.q));
  if (isUneditedLegacySet) return INITIAL_FAQS;

  const approvedVaccinationFaq = INITIAL_FAQS.find(faq => faq.id === 'faq-3');
  return parsed.map(faq => (
    faq.id === 'faq-3' && faq.a === PREVIOUS_VACCINATION_COPY && approvedVaccinationFaq
      ? { ...faq, a: approvedVaccinationFaq.a }
      : faq
  ));
}
