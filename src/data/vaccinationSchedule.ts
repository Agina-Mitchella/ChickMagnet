export interface ChickMagnetVaccinationScheduleItem {
  id: string;
  dayOrWeek: string;
  vaccine: string;
  route: string;
  instructions: string;
  notes: string;
}

export const CHICKMAGNET_VACCINATION_SCHEDULE: ChickMagnetVaccinationScheduleItem[] = [
  {
    id: 'vax-1',
    dayOrWeek: 'Day 1',
    vaccine: "Marek's, Gumboro, Newcastle & Infectious Bronchitis",
    route: 'Hatchery administration',
    instructions: 'Complete the hatchery doses before the chicks leave for delivery.',
    notes: 'Record every dose against the current batch.',
  },
  {
    id: 'vax-2',
    dayOrWeek: 'Days 10 to 12',
    vaccine: 'Newcastle & Infectious Bronchitis Booster',
    route: 'Veterinarian-approved protocol',
    instructions: 'Give the booster within the approved age window.',
    notes: 'Record the administration date against the current batch.',
  },
  {
    id: 'vax-3',
    dayOrWeek: 'Days 18 to 21',
    vaccine: 'Gumboro Booster',
    route: 'Veterinarian-approved protocol',
    instructions: 'Give the booster within the approved age window.',
    notes: 'Record the administration date against the current batch.',
  },
  {
    id: 'vax-4',
    dayOrWeek: 'Week 6',
    vaccine: 'Fowl Pox',
    route: 'Veterinarian-approved protocol',
    instructions: 'Administer when the flock reaches six weeks.',
    notes: 'Record the administration date against the current batch.',
  },
  {
    id: 'vax-5',
    dayOrWeek: 'Week 8',
    vaccine: 'Fowl Typhoid',
    route: 'Veterinarian-approved protocol',
    instructions: 'Administer when the flock reaches eight weeks.',
    notes: 'Record the administration date against the current batch.',
  },
  {
    id: 'vax-6',
    dayOrWeek: 'Week 18',
    vaccine: 'Newcastle Booster',
    route: 'Veterinarian-approved protocol',
    instructions: 'Administer at Week 18, then continue later boosters under veterinary guidance.',
    notes: 'The continuing programme is every three to four months under veterinary guidance.',
  },
];

export const CHICKMAGNET_VACCINATION_BULLETS = [
  "Day 1: Marek's disease, Gumboro, Newcastle disease and infectious bronchitis vaccines at the hatchery.",
  'Days 10 to 12: Newcastle disease and infectious bronchitis booster.',
  'Days 18 to 21: Gumboro booster.',
  'Week 6: Fowl pox vaccine.',
  'Week 8: Fowl typhoid vaccine.',
  'Week 18: Newcastle disease booster, then repeat every three to four months under veterinary guidance.',
];

export const CHICKMAGNET_VACCINATION_SUMMARY =
  'ChickMagnet follows a veterinarian-certified vaccination schedule. Every bird receives every dose due by its selected age, and each dose is recorded against the current batch.';
