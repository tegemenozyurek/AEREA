import React, { useMemo, useState } from 'react';
import ProfileView from '../components/ProfileView';
import {
  getMockFollowerUsers,
  getMockFollowingUsers,
  MOCK_OWN_BIO,
} from '../data/mockUsers';
import { PROFILE_SELF_USER_ID } from '../data/mockProfilePosts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { ConnectionListType, UserProfile } from '../types/userProfile';
import { getProfileUsername } from '../utils/profile';
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
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [view, setView] = useState<AccountView>({ kind: 'self' });

  const username = useMemo(
    () => getProfileUsername(user?.email, user?.displayName),
    [user?.displayName, user?.email],
  );

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
        photoUrl: user?.photoURL,
        bio: MOCK_OWN_BIO,
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
