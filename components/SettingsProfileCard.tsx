import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getProfileInitials } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

type Props = {
  username: string;
  bio?: string;
  photoUrl?: string | null;
  onEditPress?: () => void;
};

export default function SettingsProfileCard({ username, bio, photoUrl, onEditPress }: Props) {
  const r = useResponsive();
  const initials = getProfileInitials(username);
  const avatarSize = r.scale(56);

  const avatar = photoUrl ? (
    <Image
      source={{ uri: photoUrl }}
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    />
  ) : (
    <View
      style={[
        styles.avatarFallback,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: r.scale(20) }]}>{initials}</Text>
    </View>
  );

  return (
    <View style={[styles.card, { padding: r.scale(16), gap: r.scale(14) }]}>
      {onEditPress ? (
        <TouchableOpacity
          style={[styles.editButton, { top: r.scale(12), right: r.scale(14) }]}
          activeOpacity={0.7}
          onPress={onEditPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Text style={[styles.editText, { fontSize: r.scale(14) }]}>Edit</Text>
        </TouchableOpacity>
      ) : null}

      <View style={[styles.topRow, { gap: r.scale(14), paddingRight: onEditPress ? r.scale(44) : 0 }]}>
        {avatar}
        <View style={styles.textCol}>
          <Text style={[styles.username, { fontSize: r.scale(18) }]} numberOfLines={1}>
            {username}
          </Text>
        </View>
      </View>

      {bio ? (
        <Text style={[styles.bio, { fontSize: r.scale(14), lineHeight: r.scale(20) }]}>{bio}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    zIndex: 1,
  },
  editText: {
    color: '#60A5FA',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(96,165,250,0.18)',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bio: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '400',
  },
});
