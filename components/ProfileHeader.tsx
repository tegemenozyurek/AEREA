import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatProfileCount, getProfileInitials } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

type StatItemProps = {
  label: string;
  value: number;
  labelSize: number;
  valueSize: number;
  onPress?: () => void;
};

function StatItem({ label, value, labelSize, valueSize, onPress }: StatItemProps) {
  const content = (
    <>
      <Text style={[styles.statValue, { fontSize: valueSize }]}>{formatProfileCount(value)}</Text>
      <Text style={[styles.statLabel, { fontSize: labelSize }]}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.statItem}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.statItem}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${label.toLowerCase()}`}
    >
      {content}
    </TouchableOpacity>
  );
}

type Props = {
  username: string;
  photoUrl?: string | null;
  accentColor?: string;
  followingCount: number;
  followersCount: number;
  karma: number;
  showSettings?: boolean;
  onSettingsPress?: () => void;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
};

export default function ProfileHeader({
  username,
  photoUrl,
  accentColor = '#60A5FA',
  followingCount,
  followersCount,
  karma,
  showSettings = false,
  onSettingsPress,
  onFollowingPress,
  onFollowersPress,
}: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const initials = getProfileInitials(username);

  return (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: r.horizontalPadding,
          paddingTop: insets.top + r.scale(8),
          paddingBottom: r.scale(10),
        },
      ]}
    >
      <View style={[styles.profileRow, { gap: r.scale(14) }]}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={[
              styles.avatar,
              {
                width: r.scale(64),
                height: r.scale(64),
                borderRadius: r.scale(32),
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {
                width: r.scale(64),
                height: r.scale(64),
                borderRadius: r.scale(32),
                borderColor: `${accentColor}73`,
                backgroundColor: `${accentColor}2E`,
              },
            ]}
          >
            <Text style={[styles.avatarInitials, { fontSize: r.scale(22) }]}>{initials}</Text>
          </View>
        )}

        <View style={styles.profileTextCol}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, { fontSize: r.scale(22), flex: 1 }]} numberOfLines={1}>
              {username}
            </Text>
            {showSettings ? (
              <TouchableOpacity
                style={[
                  styles.settingsButton,
                  {
                    width: r.scale(36),
                    height: r.scale(36),
                    borderRadius: r.scale(18),
                    marginLeft: r.scale(8),
                  },
                ]}
                activeOpacity={0.7}
                onPress={onSettingsPress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Settings"
              >
                <Ionicons name="settings-outline" size={r.scale(20)} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <View
        style={[
          styles.statsRow,
          {
            marginTop: r.scale(12),
            paddingTop: r.scale(10),
            paddingBottom: r.scale(2),
            gap: r.scale(6),
          },
        ]}
      >
        <StatItem
          label="Following"
          value={followingCount}
          labelSize={r.scale(12)}
          valueSize={r.scale(18)}
          onPress={onFollowingPress}
        />
        <View style={styles.statDivider} />
        <StatItem
          label="Followers"
          value={followersCount}
          labelSize={r.scale(12)}
          valueSize={r.scale(18)}
          onPress={onFollowersPress}
        />
        <View style={styles.statDivider} />
        <StatItem label="Karma" value={karma} labelSize={r.scale(12)} valueSize={r.scale(18)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameRow: {
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
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileTextCol: {
    flex: 1,
    minWidth: 0,
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
