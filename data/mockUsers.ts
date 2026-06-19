import type { UserProfile } from '../types/userProfile';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-anna',
    username: 'greenleaf_anna',
    karma: 842,
    followingCount: 18,
    followersCount: 96,
    accentColor: '#34D399',
  },
  {
    id: 'user-mike',
    username: 'hydro_mike',
    karma: 615,
    followingCount: 12,
    followersCount: 54,
    accentColor: '#60A5FA',
  },
  {
    id: 'user-sara',
    username: 'soil_sara',
    karma: 1203,
    followingCount: 31,
    followersCount: 142,
    accentColor: '#FBBF24',
  },
  {
    id: 'user-tom',
    username: 'bloom_tom',
    karma: 428,
    followingCount: 9,
    followersCount: 37,
    accentColor: '#FB7185',
  },
  {
    id: 'user-pete',
    username: 'ppm_pete',
    karma: 976,
    followingCount: 22,
    followersCount: 88,
    accentColor: '#A78BFA',
  },
  {
    id: 'user-luna',
    username: 'ph_luna',
    karma: 531,
    followingCount: 14,
    followersCount: 61,
    accentColor: '#F472B6',
  },
  {
    id: 'user-ned',
    username: 'nutrient_ned',
    karma: 689,
    followingCount: 16,
    followersCount: 49,
    accentColor: '#2DD4BF',
  },
  {
    id: 'user-cole',
    username: 'canopy_cole',
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
