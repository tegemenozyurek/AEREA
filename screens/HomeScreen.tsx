import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AppRoute, useNavigation } from '../contexts/NavigationContext';
import { useResponsive } from '../utils/responsive';

const DRAWER_ANIMATION_MS = 260;
const LOGO_ASPECT_RATIO = 1390 / 694;

const MENU_ITEMS: { label: string; route: AppRoute }[] = [
  { label: 'Rooms', route: 'rooms' },
  { label: 'Machines', route: 'machines' },
  { label: 'Analysis', route: 'analysis' },
];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const r = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

  const drawerWidth = r.isTablet ? 340 : Math.min(r.width * 0.78, 300);
  const drawerX = useRef(new Animated.Value(drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(drawerX, {
        toValue: menuOpen ? 0 : drawerWidth,
        duration: DRAWER_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: menuOpen ? 1 : 0,
        duration: DRAWER_ANIMATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen, drawerWidth, drawerX, backdropOpacity]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    setMenuOpen(false);
    setTimeout(() => {
      void logout();
    }, DRAWER_ANIMATION_MS);
  };

  const handleNavigate = (route: AppRoute) => {
    setMenuOpen(false);
    setTimeout(() => {
      navigate(route);
    }, DRAWER_ANIMATION_MS);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: r.horizontalPadding,
          },
        ]}
      >
        <Image
          source={require('../assets/aerea-logo.png')}
          style={[
            styles.headerLogo,
            { width: r.isTablet ? 90 : 75 },
          ]}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.burgerButton}
          activeOpacity={0.7}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome, {greetingName}</Text>
      </View>

      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={menuOpen ? 'auto' : 'none'}
      >
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              transform: [{ translateX: drawerX }],
            },
          ]}
        >
          <SafeAreaView edges={['top', 'right', 'bottom']} style={styles.drawerSafeArea}>
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerLabel}>Signed in as</Text>
                <Text style={styles.drawerUsername}>{greetingName}</Text>
              </View>

              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.drawerItem}
                  activeOpacity={0.75}
                  onPress={() => handleNavigate(item.route)}
                >
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.drawerItem}
                activeOpacity={0.75}
                onPress={handleLogout}
              >
                <Text style={styles.drawerItemText}>Logout</Text>
              </TouchableOpacity>

              <View style={styles.drawerSpacer} />

              {user ? (
                <Text style={styles.drawerUid} selectable>
                  #{user.uid}
                </Text>
              ) : null}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerLogo: {
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  burgerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  burgerLine: {
    width: 24,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2A4A9C',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: -4, height: 0 },
    elevation: 16,
  },
  drawerSafeArea: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  drawerSpacer: {
    flex: 1,
    minHeight: 16,
  },
  drawerHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  drawerLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  drawerUsername: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  drawerItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  drawerItemText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 12,
    marginHorizontal: 12,
  },
  drawerUid: {
    alignSelf: 'flex-start',
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});
