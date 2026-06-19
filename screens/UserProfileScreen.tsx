import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import type { UserProfile } from '../types/userProfile';
import { useResponsive } from '../utils/responsive';

type Props = {
  user: UserProfile;
  onBack: () => void;
};

export default function UserProfileScreen({ user, onBack }: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.backBar,
          {
            position: 'absolute',
            top: insets.top + r.scale(8),
            left: r.horizontalPadding,
            zIndex: 2,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
          ]}
          activeOpacity={0.7}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={r.scale(24)} color="#fff" />
        </TouchableOpacity>
      </View>

      <ProfileHeader
        username={user.username}
        photoUrl={user.photoUrl}
        accentColor={user.accentColor}
        followingCount={user.followingCount}
        followersCount={user.followersCount}
        karma={user.karma}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backBar: {},
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
