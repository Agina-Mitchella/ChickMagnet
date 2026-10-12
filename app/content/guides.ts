export type GuideSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type GuideDefinition = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  indexable: boolean;
  reviewNote?: string;
  sections: GuideSection[];
};

export const GUIDE_DEFINITIONS: Record<string, GuideDefinition> = {
  'sasso-vs-kenbro-vs-kuroiler-vs-improved-kienyeji': {
    slug: 'sasso-vs-kenbro-vs-kuroiler-vs-improved-kienyeji',
    title: 'Sasso, Kenbro, Kuroiler and Improved Kienyeji compared',
    description: 'A plain-language comparison of four improved chicken types sold by ChickMagnet.',
    eyebrow: 'Breed guide',
    indexable: false,
    reviewNote: 'This guide will remain out of Google until ChickMagnet’s farm manager or a qualified poultry professional reviews the breed-performance statements.',
    sections: [
      {
        heading: 'They are related, but they are not the same bird',
        body: 'Sasso, Kenbro and Kuroiler are commonly grouped with Improved Kienyeji in the Kenyan market because farmers raise them for both meat and eggs. Each type has a different balance of growth, foraging behaviour and production goals.',
      },
      {
        heading: 'Start with the job you need the flock to do',
        body: 'A farmer choosing birds for meat sales may make a different choice from someone building a laying flock or keeping chickens in a semi-intensive system. Housing, feed, water, flock health and day-to-day management still matter whichever type you choose.',
      },
      {
        heading: 'Ask about the current batch',
        body: 'Before paying, ask ChickMagnet to confirm the exact type, age, current batch record, minimum order and expected delivery date. Chicks are sold unsexed, so a particular male-to-female split is not guaranteed.',
      },
    ],
  },
  'preparing-for-day-old-chicks': {
    slug: 'preparing-for-day-old-chicks',
    title: 'How to prepare before day-old chicks arrive',
    description: 'A practical preparation checklist for housing, warmth, water, feed and flock records.',
    eyebrow: 'Flock preparation',
    indexable: false,
    reviewNote: 'This husbandry guide will remain out of Google until a qualified poultry professional reviews the final instructions.',
    sections: [
      {
        heading: 'Finish the brooder before delivery day',
        body: 'The chicks should arrive to clean, dry and secure housing. Check the heat source, lighting, ventilation and litter before the flock leaves the farm.',
        bullets: ['Clean the brooder, feeders and drinkers.', 'Protect the space from rain, cold draughts and predators.', 'Test the heat source and keep a backup ready.'],
      },
      {
        heading: 'Have feed and clean water ready',
        body: 'Buy suitable chick feed before delivery and place enough drinkers and feeders for the flock to reach them without crowding. Ask the farm team what the chicks are currently eating before changing feed.',
      },
      {
        heading: 'Confirm the continuing care plan',
        body: 'Ask for the current batch care and vaccination record, then confirm the next steps with a qualified veterinary or livestock professional. Keep those details with your own flock records.',
      },
    ],
  },
};
