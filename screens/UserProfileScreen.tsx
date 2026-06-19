import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProfileHeader from '../components/ProfileHeader';
import type { UserProfile } from '../types/userProfile';

type Props = {
  user: UserProfile;
  onBack: () => void;
};

export default function UserProfileScreen({ user, onBack }: Props) {
  return (
    <View style={styles.root}>
      <ProfileHeader
        username={user.username}
        photoUrl={user.photoUrl}
        accentColor={user.accentColor}
        followingCount={user.followingCount}
        followersCount={user.followersCount}
        karma={user.karma}
        showBack
        onBack={onBack}
        showMessage
        onMessagePress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
