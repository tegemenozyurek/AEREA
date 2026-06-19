export type UserProfile = {
  id: string;
  username: string;
  bio: string;
  karma: number;
  followingCount: number;
  followersCount: number;
  photoUrl?: string;
  accentColor: string;
};

export type ConnectionListType = 'following' | 'followers';
