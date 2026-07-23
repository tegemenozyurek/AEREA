import type { UserProfile } from '../types/userProfile';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-anna',
    username: 'greenleaf_anna',
    bio: 'Indoor jungle enthusiast 🌿',
    karma: 842,
    followingCount: 18,
    followersCount: 96,
    accentColor: '#34D399',
  },
  {
    id: 'user-mike',
    username: 'hydro_mike',
    bio: 'DWC or bust. pH is a lifestyle, not a number you check once a month. Running four buckets in a spare bedroom, three tents in the garage, and somehow still telling everyone I have a "small setup." Calibrate your probes, trust your EC, and never let a friend borrow your pH pen.',
    karma: 615,
    followingCount: 12,
    followersCount: 54,
    accentColor: '#60A5FA',
  },
  {
    id: 'user-sara',
    username: 'soil_sara',
    bio: 'Compost queen. Worms are friends.',
    karma: 1203,
    followingCount: 31,
    followersCount: 142,
    accentColor: '#FBBF24',
  },
  {
    id: 'user-tom',
    username: 'bloom_tom',
    bio: 'Lights on, vibes up ✨',
    karma: 428,
    followingCount: 9,
    followersCount: 37,
    accentColor: '#FB7185',
  },
  {
    id: 'user-pete',
    username: 'ppm_pete',
    bio: "If it isn't calibrated, it didn't happen.",
    karma: 976,
    followingCount: 22,
    followersCount: 88,
    accentColor: '#A78BFA',
  },
  {
    id: 'user-luna',
    username: 'ph_luna',
    bio: '6.2 club membership since 2019',
    karma: 531,
    followingCount: 14,
    followersCount: 61,
    accentColor: '#F472B6',
  },
  {
    id: 'user-ned',
    username: 'nutrient_ned',
    bio: 'Feeding schedules are my love language',
    karma: 689,
    followingCount: 16,
    followersCount: 49,
    accentColor: '#2DD4BF',
  },
  {
    id: 'user-cole',
    username: 'canopy_cole',
    bio: 'LST evangelist. Train early, train often.',
    karma: 1105,
    followingCount: 27,
    followersCount: 113,
    accentColor: '#818CF8',
  },
];

export const MOCK_FOLLOWING_IDS = ['user-anna', 'user-mike', 'user-sara'];
export const MOCK_FOLLOWER_IDS = ['user-tom', 'user-pete', 'user-luna', 'user-ned', 'user-cole'];

export function getMockUserById(userId: string): UserProfile | undefined {
  return MOCK_USERS.find((user) => user.id === userId);
}

export function getMockFollowingUsers(): UserProfile[] {
  return MOCK_FOLLOWING_IDS.map((id) => getMockUserById(id)).filter(
    (user): user is UserProfile => user !== undefined,
  );
}

export function getMockFollowerUsers(): UserProfile[] {
  return MOCK_FOLLOWER_IDS.map((id) => getMockUserById(id)).filter(
    (user): user is UserProfile => user !== undefined,
  );
}
