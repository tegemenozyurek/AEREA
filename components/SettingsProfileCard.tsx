import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getProfileInitials } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

type EditButtonProps = {
  onPress: () => void;
  label: string;
  size: number;
};

function EditButton({ onPress, label, size }: EditButtonProps) {
  const r = useResponsive();
  const iconSize = r.scale(size <= 30 ? 14 : 16);

  return (
    <TouchableOpacity
      style={[
        styles.editButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="pencil-outline" size={iconSize} color="#fff" />
    </TouchableOpacity>
  );
}

type Props = {
  username: string;
  email?: string | null;
  bio?: string;
  photoUrl?: string | null;
  onEditPhoto?: () => void;
  onEditUsername?: () => void;
  onEditBio?: () => void;
};

export default function SettingsProfileCard({
  username,
  email,
  bio,
  photoUrl,
  onEditPhoto,
  onEditUsername,
  onEditBio,
}: Props) {
  const r = useResponsive();
  const initials = getProfileInitials(username);
  const avatarSize = r.scale(56);
  const photoEditSize = r.scale(28);
  const inlineEditSize = r.scale(32);

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
      <View style={[styles.topRow, { gap: r.scale(14) }]}>
        <View style={{ width: avatarSize, height: avatarSize }}>
          {avatar}
          {onEditPhoto ? (
            <View style={[styles.photoEditWrap, { top: -r.scale(4), right: -r.scale(4) }]}>
              <EditButton onPress={onEditPhoto} label="Change photo" size={photoEditSize} />
            </View>
          ) : null}
        </View>

        <View style={styles.textCol}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { fontSize: r.scale(18), flex: 1 }]} numberOfLines={1}>
              {username}
            </Text>
            {onEditUsername ? (
              <EditButton onPress={onEditUsername} label="Edit username" size={inlineEditSize} />
            ) : null}
          </View>
          {email ? (
            <Text style={[styles.email, { fontSize: r.scale(13), marginTop: r.scale(4) }]}>{email}</Text>
          ) : null}
        </View>
      </View>

      {bio || onEditBio ? (
        <View style={styles.bioRow}>
          {bio ? (
            <Text style={[styles.bio, { fontSize: r.scale(14), lineHeight: r.scale(20), flex: 1 }]}>
              {bio}
            </Text>
          ) : (
            <Text style={[styles.bioPlaceholder, { fontSize: r.scale(14), flex: 1 }]}>Add a bio</Text>
          )}
          {onEditBio ? (
            <EditButton onPress={onEditBio} label="Edit bio" size={inlineEditSize} />
          ) : null}
        </View>
      ) : null}
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
  photoEditWrap: {
    position: 'absolute',
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
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  email: {
    color: 'rgba(255,255,255,0.48)',
    fontWeight: '400',
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bio: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '400',
  },
  bioPlaceholder: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '400',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
