import React, { useState } from 'react';
import ProfileView from '../components/ProfileView';
import {
  getMockFollowerUsers,
  getMockFollowingUsers,
} from '../data/mockUsers';
import { PROFILE_SELF_USER_ID } from '../data/mockProfilePosts';
import { useNavigation } from '../contexts/NavigationContext';
import { useProfile } from '../contexts/ProfileContext';
import type { ConnectionListType, UserProfile } from '../types/userProfile';
import UserConnectionsScreen from './UserConnectionsScreen';
import UserProfileScreen from './UserProfileScreen';

const MOCK_STATS = {
  following: 3,
  followers: 5,
  karma: 1240,
};

type AccountView =
  | { kind: 'self' }
  | { kind: 'connections'; listType: ConnectionListType }
  | { kind: 'profile'; user: UserProfile; returnTo: ConnectionListType };

export default function AccountScreen() {
  const { username, bio, photoUrl } = useProfile();
  const { navigate } = useNavigation();
  const [view, setView] = useState<AccountView>({ kind: 'self' });

  if (view.kind === 'connections') {
    const users =
      view.listType === 'following' ? getMockFollowingUsers() : getMockFollowerUsers();

    return (
      <UserConnectionsScreen
        listType={view.listType}
        users={users}
        onBack={() => setView({ kind: 'self' })}
        onUserPress={(selectedUser) =>
          setView({ kind: 'profile', user: selectedUser, returnTo: view.listType })
        }
      />
    );
  }

  if (view.kind === 'profile') {
    return (
      <UserProfileScreen
        user={view.user}
        onBack={() => setView({ kind: 'connections', listType: view.returnTo })}
      />
    );
  }

  return (
    <ProfileView
      userId={PROFILE_SELF_USER_ID}
      authorName={username}
      headerProps={{
        username,
        photoUrl,
        bio,
        followingCount: MOCK_STATS.following,
        followersCount: MOCK_STATS.followers,
        karma: MOCK_STATS.karma,
        showSettings: true,
        onSettingsPress: () => navigate('settings'),
        onFollowingPress: () => setView({ kind: 'connections', listType: 'following' }),
        onFollowersPress: () => setView({ kind: 'connections', listType: 'followers' }),
      }}
    />
  );
}
