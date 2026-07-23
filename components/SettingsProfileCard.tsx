import { Ionicons } from '@expo/vector-icons';
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
  const avatarSize = r.isTablet ? r.scale(64) : r.scale(56);

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
    <View style={[styles.card, { padding: r.scale(16) }]}>
      <View style={[styles.topRow, { gap: r.scale(14) }]}>
        {avatar}
        <View style={styles.textCol}>
          <Text style={[styles.username, { fontSize: r.scale(18) }]} numberOfLines={1}>
            {username}
          </Text>
        </View>
        {onEditPress ? (
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                paddingVertical: r.scale(8),
                paddingHorizontal: r.scale(12),
                borderRadius: r.scale(20),
                gap: r.scale(4),
              },
            ]}
            activeOpacity={0.7}
            onPress={onEditPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="pencil-outline" size={r.scale(14)} color="#93C5FD" />
            <Text style={[styles.editText, { fontSize: r.scale(13) }]}>Edit</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {bio ? (
        <Text
          style={[
            styles.bio,
            {
              fontSize: r.scale(14),
              lineHeight: r.scale(21),
              marginTop: r.scale(18),
            },
          ]}
        >
          {bio}
        </Text>
      ) : (
        <Text
          style={[
            styles.bioPlaceholder,
            {
              fontSize: r.scale(13),
              lineHeight: r.scale(19),
              marginTop: r.scale(18),
            },
          ]}
        >
          Add bio
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.28)',
    flexShrink: 0,
  },
  editText: {
    color: '#93C5FD',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  bio: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '400',
  },
  bioPlaceholder: {
    color: 'rgba(255,255,255,0.32)',
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
