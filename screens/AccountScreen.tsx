import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useResponsive } from '../utils/responsive';

const MOCK_STATS = {
  following: 3,
  followers: 5,
  karma: 1240,
};

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

function getUsername(email?: string | null, displayName?: string | null): string {
  if (displayName?.trim()) {
    return displayName.trim();
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'grower';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type StatItemProps = {
  label: string;
  value: number;
  labelSize: number;
  valueSize: number;
};

function StatItem({ label, value, labelSize, valueSize }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { fontSize: valueSize }]}>{formatCount(value)}</Text>
      <Text style={[styles.statLabel, { fontSize: labelSize }]}>{label}</Text>
    </View>
  );
}

export default function AccountScreen() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  const username = useMemo(
    () => getUsername(user?.email, user?.displayName),
    [user?.displayName, user?.email],
  );
  const initials = useMemo(() => getInitials(username), [username]);
  const photoUri = user?.photoURL ?? null;

  return (
    <View style={styles.safeArea}>
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
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
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
                onPress={() => navigate('settings')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Settings"
              >
                <Ionicons name="settings-outline" size={r.scale(20)} color="#fff" />
              </TouchableOpacity>
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
            value={MOCK_STATS.following}
            labelSize={r.scale(12)}
            valueSize={r.scale(18)}
          />
          <View style={styles.statDivider} />
          <StatItem
            label="Followers"
            value={MOCK_STATS.followers}
            labelSize={r.scale(12)}
            valueSize={r.scale(18)}
          />
          <View style={styles.statDivider} />
          <StatItem
            label="Karma"
            value={MOCK_STATS.karma}
            labelSize={r.scale(12)}
            valueSize={r.scale(18)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(96,165,250,0.18)',
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
