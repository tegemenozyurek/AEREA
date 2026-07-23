export type CommunitySubTab = 'forum' | 'wiki' | 'seeds' | 'tutorials';

export const COMMUNITY_SUB_TABS: {
  key: CommunitySubTab;
  label: string;
  title: string;
  icon: string;
}[] = [
  { key: 'forum', label: 'Forum', title: 'Forum', icon: 'chatbubbles-outline' },
  { key: 'wiki', label: 'Plant Wiki', title: 'Plant Wiki', icon: 'leaf-outline' },
  { key: 'seeds', label: 'Seed Exchange', title: 'Seed Exchange', icon: 'swap-horizontal-outline' },
  { key: 'tutorials', label: 'Tutorials', title: 'Tutorials', icon: 'play-circle-outline' },
];
