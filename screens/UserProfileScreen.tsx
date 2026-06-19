import React from 'react';
import ProfileView from '../components/ProfileView';
import type { UserProfile } from '../types/userProfile';

type Props = {
  user: UserProfile;
  onBack: () => void;
};

export default function UserProfileScreen({ user, onBack }: Props) {
  return (
    <ProfileView
      userId={user.id}
      authorName={user.username}
      headerProps={{
        username: user.username,
        photoUrl: user.photoUrl,
        bio: user.bio,
        accentColor: user.accentColor,
        followingCount: user.followingCount,
        followersCount: user.followersCount,
        karma: user.karma,
        showBack: true,
        onBack,
        showMessage: true,
        onMessagePress: () => {},
      }}
    />
  );
}
