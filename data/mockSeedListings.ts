import type { SeedListing } from '../types/seedExchange';

function daysAgo(days: number, hours = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const mockSeedListings: SeedListing[] = [
  {
    id: 'seed-1',
    authorName: 'WildGarden',
    title: 'Wild tomato seeds — open pollination',
    body: 'Hey guys, I got some wild tomato seeds from last season. Any berry-type heirloom is okay to exchange. Happy to share extras!',
    photoUris: ['https://picsum.photos/seed/aerea-seed-tomato/400/400'],
    exchangeType: 'trade',
    lookingFor: 'Berry-type tomato or pepper seeds',
    createdAt: daysAgo(1, 10),
  },
  {
    id: 'seed-2',
    authorName: 'BasilBuddy',
    title: 'Genovese basil seeds — free to a good home',
    body: 'I saved way too many basil seeds this year. Donating small packets — just cover postage or pass some along to another grower.',
    photoUris: ['https://picsum.photos/seed/aerea-seed-basil/400/400'],
    exchangeType: 'donate',
    lookingFor: '',
    createdAt: daysAgo(3, 15),
  },
  {
    id: 'seed-3',
    authorName: 'PepperPro',
    title: 'Mixed hot pepper seeds',
    body: 'Jalapeño, cayenne, and one mystery red — looking to trade for lettuce or herb seeds. Local pickup preferred.',
    photoUris: [
      'https://picsum.photos/seed/aerea-seed-pepper1/400/400',
      'https://picsum.photos/seed/aerea-seed-pepper2/400/400',
    ],
    exchangeType: 'trade',
    lookingFor: 'Lettuce, cilantro, or dill seeds',
    createdAt: daysAgo(5, 9),
  },
  {
    id: 'seed-4',
    authorName: 'LeafLover',
    title: 'Kale & spinach seed mix',
    body: 'Donating leftover seed from my spring planting. Great for fall succession. No trade needed — just message me.',
    photoUris: [],
    exchangeType: 'donate',
    lookingFor: '',
    createdAt: daysAgo(7, 14),
  },
];
