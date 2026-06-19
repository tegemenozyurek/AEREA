import { mockCommunityPosts } from './mockCommunityPosts';
import type { ChatUser } from '../types/chat';

export const CURRENT_USER_ID = 'user-me';

const EXTRA_USERS: ChatUser[] = [
  { id: 'user-soilsage', displayName: 'SoilSage' },
  { id: 'user-urbanfarmer', displayName: 'UrbanFarmer' },
  { id: 'user-greenthumb42', displayName: 'GreenThumb42' },
  { id: 'user-drylandgrower', displayName: 'DryLandGrower' },
  { id: 'user-compostqueen', displayName: 'CompostQueen' },
  { id: 'user-hydroharry', displayName: 'HydroHarry' },
  { id: 'user-leaflover', displayName: 'LeafLover' },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const postAuthors = mockCommunityPosts.map((post) => post.authorName);
const uniqueNames = [...new Set(postAuthors)].filter((name) => name !== 'TestUser');

const fromPosts: ChatUser[] = uniqueNames.map((displayName) => ({
  id: `user-${slugify(displayName)}`,
  displayName,
}));

const byId = new Map<string, ChatUser>();
[...EXTRA_USERS, ...fromPosts].forEach((user) => {
  if (!byId.has(user.id)) {
    byId.set(user.id, user);
  }
});

export const MOCK_CHAT_USERS: ChatUser[] = [...byId.values()];

const nameToUser = new Map(
  MOCK_CHAT_USERS.map((user) => [user.displayName.toLowerCase(), user]),
);

export function getChatUserById(id: string): ChatUser | undefined {
  if (id === CURRENT_USER_ID) return undefined;
  return byId.get(id);
}

export function getChatUserByDisplayName(name: string): ChatUser | undefined {
  return nameToUser.get(name.toLowerCase());
}

export function getChatUserIdForAuthorName(authorName: string): string {
  const existing = getChatUserByDisplayName(authorName);
  if (existing) return existing.id;
  return `user-${slugify(authorName)}`;
}
