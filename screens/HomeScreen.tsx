import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationInboxModal from '../components/NotificationInboxModal';
import { mockNotifications } from '../data/mockNotifications';
import { useAuth } from '../contexts/AuthContext';
import type { AppNotification } from '../types/notification';
import { useResponsive } from '../utils/responsive';

const LOGO_ASPECT_RATIO = 1390 / 694;

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    mockNotifications.map((n) => ({ ...n })),
  );

  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleNotificationPress = useCallback((notification: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
  }, []);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: r.horizontalPadding,
            paddingTop: insets.top + 12,
            paddingBottom: 12,
          },
        ]}
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        <View style={styles.borderBottom} />

        <View style={styles.headerContent}>
          <Image
            source={require('../assets/aerea-logo.png')}
            style={[
              styles.headerLogo,
              { width: r.isTablet ? 110 : 90 },
            ]}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.inboxButton}
            activeOpacity={0.7}
            onPress={() => setInboxVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications inbox"
          >
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.inboxBadge}>
                <Text style={styles.inboxBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.horizontalPadding,
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
            paddingBottom: r.scale(120),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor="#fff"
            colors={['#008D41']}
          />
        }
      >
        <Text style={styles.welcome}>Welcome, {greetingName}</Text>
      </ScrollView>

      <NotificationInboxModal
        visible={inboxVisible}
        notifications={notifications}
        onClose={() => setInboxVisible(false)}
        onNotificationPress={handleNotificationPress}
        onMarkAllRead={handleMarkAllRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    width: '100%',
    overflow: 'hidden',
  },
  tint: {
    backgroundColor: 'rgba(10, 12, 20, 0.55)',
  },
  borderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: {
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  inboxButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inboxBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B8A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  inboxBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    flexGrow: 1,
  },
  welcome: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    alignSelf: 'flex-start',
  },
});
