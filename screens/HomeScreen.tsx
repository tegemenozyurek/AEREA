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
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

const LOGO_ASPECT_RATIO = 1390 / 694;

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
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
            onPress={() => {}}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Inbox"
          >
            <Ionicons name="file-tray-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.horizontalPadding,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
