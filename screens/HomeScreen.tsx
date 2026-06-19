import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

const LOGO_ASPECT_RATIO = 1390 / 694;

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

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
          <View style={[styles.headerActionWrap, { right: r.horizontalPadding }]}>
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
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome, {greetingName}</Text>
      </View>
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
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerLogo: {
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  headerActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
  body: {
    flex: 1,
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
