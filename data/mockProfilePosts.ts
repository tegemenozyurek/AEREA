import type { CommunityPost } from '../types/community';

export const PROFILE_SELF_USER_ID = 'self';

function daysAgo(days: number, hours = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

type PostTemplate = Omit<CommunityPost, 'id' | 'authorName' | 'createdAt'> & {
  daysAgo: number;
  hours?: number;
};

function buildUserPosts(
  userId: string,
  authorName: string,
  templates: PostTemplate[],
): CommunityPost[] {
  return templates.map((template, index) => {
    const { daysAgo: dayOffset, hours = 12, ...rest } = template;
    return {
      ...rest,
      id: `profile-${userId}-${index + 1}`,
      authorName,
      createdAt: daysAgo(dayOffset, hours),
    };
  });
}

const MOCK_PROFILE_POST_TEMPLATES: Record<string, PostTemplate[]> = {
  [PROFILE_SELF_USER_ID]: [
    {
      topic: 'My Experience',
      title: 'First season with AEREA sensors',
      body: 'Hooked up two probes last month and finally stopped guessing when to top off the reservoir.',
      photoUris: ['https://picsum.photos/seed/aerea-self-1/400/300'],
      likeCount: 34,
      comments: [],
      daysAgo: 2,
    },
    {
      topic: 'Question',
      title: 'Best EC range for leafy greens?',
      body: 'Running butter lettuce in DWC. Curious what everyone keeps EC at during veg.',
      photoUris: [],
      likeCount: 19,
      comments: [
        {
          id: 'profile-self-c1',
          authorName: 'hydro_mike',
          body: 'I stay around 1.2–1.4 mS/cm until they size up.',
          createdAt: daysAgo(1, 16),
        },
      ],
      daysAgo: 4,
    },
    {
      topic: 'Advice',
      title: 'Label your reservoirs',
      body: 'Sounds obvious, but date + EC notes on tape saved me from a bad top-off twice this week.',
      photoUris: [],
      likeCount: 52,
      comments: [],
      daysAgo: 9,
    },
    {
      topic: 'My Experience',
      title: 'Potato harvest update 🥔',
      body: 'Full time potato farmer :D — bins are full and the grow room smells like earth.',
      photoUris: [
        'https://picsum.photos/seed/aerea-self-2a/400/300',
        'https://picsum.photos/seed/aerea-self-2b/400/300',
      ],
      likeCount: 88,
      comments: [],
      daysAgo: 14,
    },
  ],
  'user-anna': [
    {
      topic: 'My Experience',
      title: 'Monstera finally unfurled a new leaf',
      body: 'Moved it 30 cm closer to the panel and humidity at 62% did the rest.',
      photoUris: ['https://picsum.photos/seed/aerea-anna-1/400/300'],
      likeCount: 74,
      comments: [],
      daysAgo: 1,
    },
    {
      topic: 'Advice',
      title: 'Mist vs humidifier for tropicals',
      body: 'Short bursts of mist in the morning plus a small humidifier at night kept ferns happy.',
      photoUris: [],
      likeCount: 41,
      comments: [],
      daysAgo: 5,
    },
    {
      topic: 'Question',
      title: 'Brown tips on calathea — tap water?',
      body: 'Using filtered water now but tips still crisp. Could it be low humidity alone?',
      photoUris: [],
      likeCount: 23,
      comments: [],
      daysAgo: 8,
    },
    {
      topic: 'My Experience',
      title: 'Indoor jungle tour v2',
      body: 'Added three trailing pothos cuttings to the top shelf. The wall is officially green.',
      photoUris: ['https://picsum.photos/seed/aerea-anna-2/400/300'],
      likeCount: 96,
      comments: [],
      daysAgo: 12,
    },
  ],
  'user-mike': [
    {
      topic: 'Advice',
      title: 'Calibrate pH probes every two weeks',
      body: 'DWC or bust. A drifting probe cost me a whole bucket once — never again.',
      photoUris: [],
      likeCount: 112,
      comments: [],
      daysAgo: 0,
      hours: 9,
    },
    {
      topic: 'Question',
      title: 'Air stone size for 20 L buckets?',
      body: 'Running four buckets in the bedroom. Is a 2" stone overkill or just right?',
      photoUris: [],
      likeCount: 28,
      comments: [],
      daysAgo: 3,
    },
    {
      topic: 'My Experience',
      title: 'Garage tent hit target EC all week',
      body: 'Three tents, one spare bedroom, still a "small setup" according to my partner.',
      photoUris: [
        'https://picsum.photos/seed/aerea-mike-1a/400/300',
        'https://picsum.photos/seed/aerea-mike-1b/400/300',
      ],
      likeCount: 67,
      comments: [],
      daysAgo: 6,
    },
    {
      topic: 'Advice',
      title: 'Trust your EC, not the bottle chart',
      body: 'Feed charts are a starting point. Your water, temps, and uptake change the math daily.',
      photoUris: [],
      likeCount: 89,
      comments: [],
      daysAgo: 11,
    },
  ],
  'user-sara': [
    {
      topic: 'My Experience',
      title: 'Worm bin passed the smell test',
      body: 'Compost queen reporting in — bedding stayed fluffy and no sour notes.',
      photoUris: ['https://picsum.photos/seed/aerea-sara-1/400/300'],
      likeCount: 58,
      comments: [],
      daysAgo: 2,
    },
    {
      topic: 'Advice',
      title: 'Greens and browns cheat sheet',
      body: 'Two parts browns to one part greens, moist like a wrung sponge. Worms are friends.',
      photoUris: [],
      likeCount: 44,
      comments: [],
      daysAgo: 7,
    },
    {
      topic: 'Question',
      title: 'Can I compost citrus peels?',
      body: 'Small amounts okay? My bin is only 40 L indoors.',
      photoUris: [],
      likeCount: 17,
      comments: [],
      daysAgo: 10,
    },
    {
      topic: 'My Experience',
      title: 'Top dress with homemade compost',
      body: 'Tomatoes loved a thin layer before flower. Soil structure looks better already.',
      photoUris: [],
      likeCount: 71,
      comments: [],
      daysAgo: 15,
    },
  ],
  'user-tom': [
    {
      topic: 'My Experience',
      title: 'New panel, new PPFD map',
      body: 'Lights on, vibes up ✨ — finally measured PAR at canopy height.',
      photoUris: ['https://picsum.photos/seed/aerea-tom-1/400/300'],
      likeCount: 39,
      comments: [],
      daysAgo: 1,
    },
    {
      topic: 'Question',
      title: 'Dimming vs raising lights?',
      body: 'Seedlings look slightly bleached. Should I dim to 60% or lift the fixture?',
      photoUris: [],
      likeCount: 21,
      comments: [],
      daysAgo: 4,
    },
    {
      topic: 'Advice',
      title: 'Run lights on a schedule, not vibes',
      body: 'Consistent photoperiod beat my manual on/off habit within a week.',
      photoUris: [],
      likeCount: 33,
      comments: [],
      daysAgo: 9,
    },
    {
      topic: 'My Experience',
      title: 'Bloom stretch under full spectrum',
      body: 'Stretch tightened up after dropping DLI slightly in week three.',
      photoUris: ['https://picsum.photos/seed/aerea-tom-2/400/300'],
      likeCount: 46,
      comments: [],
      daysAgo: 13,
    },
  ],
  'user-pete': [
    {
      topic: 'Advice',
      title: 'If it isn’t calibrated, it didn’t happen',
      body: 'Two-point cal on EC and pH meters every Monday. Logs or it’s folklore.',
      photoUris: [],
      likeCount: 93,
      comments: [],
      daysAgo: 0,
      hours: 11,
    },
    {
      topic: 'Question',
      title: 'TDS vs EC on cheap pens',
      body: 'My pen shows ppm500. Anyone convert to mS/cm reliably on budget gear?',
      photoUris: [],
      likeCount: 26,
      comments: [],
      daysAgo: 3,
    },
    {
      topic: 'My Experience',
      title: 'Caught a drift before a crash',
      body: 'Weekly cal caught a 0.4 drift on probe #2. Bucket saved.',
      photoUris: ['https://picsum.photos/seed/aerea-pete-1/400/300'],
      likeCount: 61,
      comments: [],
      daysAgo: 6,
    },
    {
      topic: 'Advice',
      title: 'Store probes in storage solution',
      body: 'Dry caps kill sensors fast. Keep a small bottle of KCl solution handy.',
      photoUris: [],
      likeCount: 48,
      comments: [],
      daysAgo: 12,
    },
  ],
  'user-luna': [
    {
      topic: 'My Experience',
      title: '6.2 club membership still going',
      body: 'Holding root zone at 6.2 since 2019. Stable pH = fewer rescue nights.',
      photoUris: [],
      likeCount: 55,
      comments: [],
      daysAgo: 2,
    },
    {
      topic: 'Question',
      title: 'pH up or down with tap water?',
      body: 'My tap comes out 7.8. Phosphoric down okay every top-off?',
      photoUris: [],
      likeCount: 31,
      comments: [],
      daysAgo: 5,
    },
    {
      topic: 'Advice',
      title: 'Check runoff, not just the tank',
      body: 'Reservoir pH can lie. Runoff told me my medium was creeping acidic.',
      photoUris: [],
      likeCount: 42,
      comments: [],
      daysAgo: 8,
    },
    {
      topic: 'My Experience',
      title: 'Week of perfect pH logs',
      body: 'First time every reading landed in range without a midnight panic.',
      photoUris: ['https://picsum.photos/seed/aerea-luna-1/400/300'],
      likeCount: 63,
      comments: [],
      daysAgo: 14,
    },
  ],
  'user-ned': [
    {
      topic: 'Advice',
      title: 'Feeding schedules are my love language',
      body: 'Write the week on paper, then set reminders. Plants don’t care about your memory.',
      photoUris: [],
      likeCount: 47,
      comments: [],
      daysAgo: 1,
    },
    {
      topic: 'My Experience',
      title: 'Switched to half-strength early veg',
      body: 'Less tip burn, same growth rate. Gentle feeds won this round.',
      photoUris: ['https://picsum.photos/seed/aerea-ned-1/400/300'],
      likeCount: 38,
      comments: [],
      daysAgo: 4,
    },
    {
      topic: 'Question',
      title: 'Silica with every feed or weekly?',
      body: 'Using a silica additive in coco. Daily micro-dose or once a week?',
      photoUris: [],
      likeCount: 22,
      comments: [],
      daysAgo: 7,
    },
    {
      topic: 'Advice',
      title: 'Flush before you blame the nutes',
      body: 'Lockout looks like deficiency. Run clean water once before upping EC.',
      photoUris: [],
      likeCount: 54,
      comments: [],
      daysAgo: 11,
    },
  ],
  'user-cole': [
    {
      topic: 'Advice',
      title: 'LST evangelist check-in',
      body: 'Train early, train often. First tie-down at node three changed my canopy.',
      photoUris: ['https://picsum.photos/seed/aerea-cole-1/400/300'],
      likeCount: 81,
      comments: [],
      daysAgo: 0,
      hours: 10,
    },
    {
      topic: 'My Experience',
      title: 'Even canopy, even light',
      body: 'Spent an hour tucking leaves. PPFD variance dropped across the mat.',
      photoUris: [],
      likeCount: 59,
      comments: [],
      daysAgo: 3,
    },
    {
      topic: 'Question',
      title: 'Supercrop or top at node five?',
      body: 'Plant is vigorous but tight on height. Which would you pick?',
      photoUris: [],
      likeCount: 27,
      comments: [],
      daysAgo: 6,
    },
    {
      topic: 'My Experience',
      title: 'Before / after LST photos',
      body: 'Same plant, six days apart. Horizontal growth beats vertical chase every time.',
      photoUris: [
        'https://picsum.photos/seed/aerea-cole-2a/400/300',
        'https://picsum.photos/seed/aerea-cole-2b/400/300',
      ],
      likeCount: 94,
      comments: [],
      daysAgo: 10,
    },
  ],
};

const MOCK_USERNAMES: Record<string, string> = {
  [PROFILE_SELF_USER_ID]: 'grower',
  'user-anna': 'greenleaf_anna',
  'user-mike': 'hydro_mike',
  'user-sara': 'soil_sara',
  'user-tom': 'bloom_tom',
  'user-pete': 'ppm_pete',
  'user-luna': 'ph_luna',
  'user-ned': 'nutrient_ned',
  'user-cole': 'canopy_cole',
};

export const mockProfilePosts: CommunityPost[] = Object.entries(MOCK_PROFILE_POST_TEMPLATES).flatMap(
  ([userId, templates]) =>
    buildUserPosts(userId, MOCK_USERNAMES[userId] ?? userId, templates),
);

export function getMockProfilePostsForUser(
  userId: string,
  authorName?: string,
): CommunityPost[] {
  const templates = MOCK_PROFILE_POST_TEMPLATES[userId];
  if (!templates) {
    return [];
  }

  const resolvedAuthor = authorName ?? MOCK_USERNAMES[userId] ?? userId;
  return buildUserPosts(userId, resolvedAuthor, templates);
}

export function isProfilePostId(postId: string): boolean {
  return postId.startsWith('profile-');
}

export function getProfilePostUserId(postId: string): string | null {
  if (!isProfilePostId(postId)) {
    return null;
  }

  const withoutPrefix = postId.slice('profile-'.length);
  const lastDash = withoutPrefix.lastIndexOf('-');
  if (lastDash <= 0) {
    return null;
  }

  return withoutPrefix.slice(0, lastDash);
}
