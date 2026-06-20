import type { WikiArticle } from '../types/wiki';

export const mockWikiArticles: WikiArticle[] = [
  {
    id: 'wiki-powdery-mildew',
    title: 'Powdery Mildew',
    category: 'Disease',
    summary: 'White powdery spots on leaves — common in humid greenhouses.',
    imageUri: 'https://picsum.photos/seed/aerea-wiki-mildew/600/340',
    symptoms: [
      'White or gray powdery coating on leaf surfaces',
      'Leaves curl, yellow, and drop prematurely',
      'Stunted growth on heavily infected plants',
    ],
    treatment: [
      'Improve airflow and reduce leaf wetness',
      'Remove heavily infected leaves',
      'Apply approved fungicide early at first sign',
      'Avoid overhead watering in the evening',
    ],
    body:
      'Powdery mildew is a fungal disease that thrives in warm, humid conditions with poor air circulation. It spreads quickly in dense canopies and can affect tomatoes, cucumbers, and leafy greens in hydroponic setups when humidity stays above 70%.',
    updatedAt: '2026-05-10T10:00:00.000Z',
  },
  {
    id: 'wiki-root-rot',
    title: 'Root Rot (Pythium)',
    category: 'Disease',
    summary: 'Brown, slimy roots and wilting despite adequate water.',
    imageUri: 'https://picsum.photos/seed/aerea-wiki-rootrot/600/340',
    symptoms: [
      'Roots turn brown or black and smell foul',
      'Plants wilt even when reservoir is full',
      'Slow growth and yellowing lower leaves',
    ],
    treatment: [
      'Lower reservoir temperature (aim below 22°C)',
      'Increase dissolved oxygen with an air stone',
      'Trim affected roots and sanitize the system',
      'Replace nutrient solution and monitor EC/pH daily',
    ],
    body:
      'Root rot in hydroponics is often caused by Pythium and related pathogens. Warm, stagnant, low-oxygen nutrient solution creates ideal conditions. Prevention is easier than cure — keep roots cool, oxygenated, and clean.',
    updatedAt: '2026-05-18T14:30:00.000Z',
  },
  {
    id: 'wiki-aphids',
    title: 'Aphids',
    category: 'Pest',
    summary: 'Tiny soft-bodied insects clustering on new growth.',
    imageUri: 'https://picsum.photos/seed/aerea-wiki-aphids/600/340',
    symptoms: [
      'Sticky honeydew on leaves and surfaces',
      'Curled or distorted new leaves',
      'Visible clusters on stems and undersides',
    ],
    treatment: [
      'Blast with water to dislodge early infestations',
      'Introduce beneficial insects (ladybugs, lacewings)',
      'Apply insecticidal soap on affected areas',
      'Inspect new plants before adding to the room',
    ],
    body:
      'Aphids reproduce rapidly and can transmit viruses between plants. In indoor grows they often enter on new seedlings or through vents. Regular scouting catches problems before they spread room-wide.',
    updatedAt: '2026-04-22T09:15:00.000Z',
  },
  {
    id: 'wiki-nitrogen-deficiency',
    title: 'Nitrogen Deficiency',
    category: 'Nutrient',
    summary: 'Older leaves turn pale yellow while new growth stays green.',
    imageUri: 'https://picsum.photos/seed/aerea-wiki-nitrogen/600/340',
    symptoms: [
      'Yellowing starts on oldest lower leaves',
      'Stunted overall plant size',
      'Weak stems and reduced fruit set',
    ],
    treatment: [
      'Increase nitrogen in nutrient formula gradually',
      'Check EC — solution may be too diluted',
      'Verify pH is in the optimal range for uptake',
      'Flush and rebalance if salts have accumulated',
    ],
    body:
      'Nitrogen is mobile in the plant, so deficiency shows on older leaves first. In hydroponics this usually means the nutrient ratio or concentration needs adjustment rather than a disease issue.',
    updatedAt: '2026-06-01T11:00:00.000Z',
  },
  {
    id: 'wiki-heat-stress',
    title: 'Heat Stress',
    category: 'Environmental',
    summary: 'Leaf edge burn and wilting when temps exceed optimal range.',
    imageUri: 'https://picsum.photos/seed/aerea-wiki-heat/600/340',
    symptoms: [
      'Leaf edges brown and crispy',
      'Flowers drop without setting fruit',
      'Wilting during peak light hours',
    ],
    treatment: [
      'Improve ventilation and exhaust hot air',
      'Adjust light intensity or raise fixtures',
      'Increase reservoir volume or chill nutrient solution',
      'Mist cautiously — humidity alone does not fix heat',
    ],
    body:
      'Most edible crops perform best between 18–28°C. Sustained heat above 32°C stresses roots and reduces pollination. Monitor canopy and reservoir temperatures separately.',
    updatedAt: '2026-06-12T08:45:00.000Z',
  },
];
