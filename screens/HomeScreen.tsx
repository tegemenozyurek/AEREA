import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
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

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MaterialName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type FA5Name = React.ComponentProps<typeof FontAwesome5>['name'];

type IconSpec =
  | { lib: 'ion'; name: IoniconName }
  | { lib: 'material'; name: MaterialName }
  | { lib: 'fa5'; name: FA5Name };

function MenuIcon({
  icon,
  size,
  color,
}: {
  icon: IconSpec;
  size: number;
  color: string;
}) {
  if (icon.lib === 'material') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  if (icon.lib === 'fa5') {
    return <FontAwesome5 name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}

const MENU_ITEMS: { label: string; route: AppRoute; icon: IconSpec }[] = [
  { label: 'Rooms', route: 'rooms', icon: { lib: 'ion', name: 'grid-outline' } },
  {
    label: 'Machines',
    route: 'machines',
    icon: { lib: 'fa5', name: 'seedling' },
  },
  {
    label: 'Analysis',
    route: 'analysis',
    icon: { lib: 'ion', name: 'analytics-outline' },
  },
];

const FOOTER_ITEMS: { label: string; route: AppRoute; icon: IconSpec }[] = [
  {
    label: 'Account',
    route: 'account',
    icon: { lib: 'ion', name: 'person-circle-outline' },
  },
  {
    label: 'Settings',
    route: 'settings',
    icon: { lib: 'ion', name: 'settings-outline' },
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const r = useResponsive();
  const [menuOpen, setMenuOpen] = useState(false);
  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

  const drawerWidth = r.isTablet ? 260 : Math.min(r.width * 0.6, 230);
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
          <Ionicons name="menu" size={28} color="#fff" />
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
          <BlurView
            intensity={60}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.drawerTint]} />
          <SafeAreaView edges={['top', 'right', 'bottom']} style={styles.drawerSafeArea}>
            <View style={styles.drawerContent}>
              <View style={styles.drawerTopBar}>
                <TouchableOpacity
                  onPress={closeMenu}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                >
                  <Ionicons name="close" size={26} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerMenu}>
                {MENU_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.route}
                    style={styles.drawerItem}
                    activeOpacity={0.6}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.drawerItemIcon}>
                      <MenuIcon
                        icon={item.icon}
                        size={22}
                        color="rgba(255,255,255,0.9)"
                      />
                    </View>
                    <Text style={styles.drawerItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.drawerFooter}>
                {FOOTER_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.route}
                    style={styles.drawerFooterButton}
                    activeOpacity={0.6}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <View style={styles.drawerFooterIcon}>
                      <MenuIcon
                        icon={item.icon}
                        size={18}
                        color="rgba(255,255,255,0.8)"
                      />
                    </View>
                    <Text style={styles.drawerFooterButtonText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.12)',
  },
  drawerTint: {
    backgroundColor: 'rgba(10, 12, 20, 0.45)',
  },
  drawerSafeArea: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  drawerTopBar: {
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  drawerMenu: {
    marginTop: 24,
    gap: 2,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  drawerItemIcon: {
    width: 28,
    marginRight: 14,
  },
  drawerItemText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  drawerFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  drawerFooterIcon: {
    width: 28,
    marginRight: 14,
    alignItems: 'flex-start',
  },
  drawerFooterButtonText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
