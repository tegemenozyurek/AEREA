export type CommunitySubTab = 'forum' | 'wiki' | 'seeds' | 'tutorials';

export const COMMUNITY_SUB_TABS: { key: CommunitySubTab; label: string; icon: string }[] = [
  { key: 'forum', label: 'Forum', icon: 'chatbubbles-outline' },
  { key: 'wiki', label: 'Plant Wiki', icon: 'leaf-outline' },
  { key: 'seeds', label: 'Seed Exchange', icon: 'swap-horizontal-outline' },
  { key: 'tutorials', label: 'Tutorials', icon: 'play-circle-outline' },
];
