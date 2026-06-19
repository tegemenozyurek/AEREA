import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ConnectionListType, UserProfile } from '../types/userProfile';
import { getProfileInitials } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

type Props = {
  listType: ConnectionListType;
  users: UserProfile[];
  onBack: () => void;
  onUserPress: (user: UserProfile) => void;
};

export default function UserConnectionsScreen({ listType, users, onBack, onUserPress }: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const title = listType === 'following' ? 'Following' : 'Followers';

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + r.scale(8),
            paddingHorizontal: r.horizontalPadding,
            paddingBottom: r.scale(12),
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
        <Text style={[styles.headerTitle, { fontSize: r.scale(18) }]}>{title}</Text>
        <View style={{ width: r.scale(36) }} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: r.horizontalPadding,
          paddingTop: r.scale(16),
          paddingBottom: r.scale(24),
          maxWidth: r.contentMaxWidth,
          alignSelf: 'center',
          width: '100%',
        }}
        renderItem={({ item }) => {
          const initials = getProfileInitials(item.username);
          return (
            <TouchableOpacity
              style={[
                styles.userRow,
                {
                  borderRadius: r.scale(12),
                  paddingVertical: r.scale(12),
                  paddingHorizontal: r.scale(14),
                  marginBottom: r.scale(8),
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onUserPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.username} profile`}
            >
              <View
                style={[
                  styles.avatar,
                  {
                    width: r.scale(44),
                    height: r.scale(44),
                    borderRadius: r.scale(22),
                    borderColor: `${item.accentColor}73`,
                    backgroundColor: `${item.accentColor}2E`,
                  },
                ]}
              >
                <Text style={[styles.avatarInitials, { fontSize: r.scale(15) }]}>{initials}</Text>
              </View>
              <View style={styles.userTextCol}>
                <Text style={[styles.username, { fontSize: r.scale(16) }]} numberOfLines={1}>
                  {item.username}
                </Text>
                <Text style={[styles.karma, { fontSize: r.scale(12), marginTop: r.scale(2) }]}>
                  {item.karma.toLocaleString()} karma
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={r.scale(18)} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
  },
  userTextCol: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  karma: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
});
