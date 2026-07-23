import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../contexts/ChatContext';
import { useHomeNotifications } from '../contexts/HomeNotificationsContext';
import { useMachinesAlerts } from '../contexts/MachinesAlertsContext';
import { AppRoute, isRouteLocked, useNavigation } from '../contexts/NavigationContext';
import { useResponsive } from '../utils/responsive';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type FA5Name = React.ComponentProps<typeof FontAwesome5>['name'];

type IconSpec =
  | { lib: 'ion'; name: IoniconName }
  | { lib: 'fa5'; name: FA5Name };

const NAV_ITEMS: { label: string; route: AppRoute; icon: IconSpec }[] = [
  { label: 'Home', route: 'home', icon: { lib: 'ion', name: 'home-outline' } },
  { label: 'Machines', route: 'machines', icon: { lib: 'fa5', name: 'seedling' } },
  {
    label: 'Market',
    route: 'market',
    icon: { lib: 'ion', name: 'storefront-outline' },
  },
  {
    label: 'Community',
    route: 'community',
    icon: { lib: 'ion', name: 'people-outline' },
  },
  {
    label: 'Profile',
    route: 'account',
    icon: { lib: 'ion', name: 'person-circle-outline' },
  },
];

function NavIcon({
  icon,
  size,
  color,
}: {
  icon: IconSpec;
  size: number;
  color: string;
}) {
  if (icon.lib === 'fa5') {
    return <FontAwesome5 name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}

function formatBadgeCount(count: number): string {
  if (count > 99) return '99+';
  if (count > 9) return '9+';
  return String(count);
}

const TOAST_VISIBLE_MS = 1200;
const TOAST_FADE_MS = 180;
const MARKET_TAB_INDEX = NAV_ITEMS.findIndex((item) => item.route === 'market');

export default function NavBar() {
  const { route, navigate } = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const { unreadCount: homeUnreadCount } = useHomeNotifications();
  const { totalUnread: communityUnreadCount } = useChat();
  const { alertCount: machinesAlertCount } = useMachinesAlerts();
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastScale = useRef(new Animated.Value(0.92)).current;
  const toastTranslateY = useRef(new Animated.Value(8)).current;
  const toastAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const showComingSoonToast = useCallback(() => {
    toastAnimRef.current?.stop();

    toastOpacity.setValue(0);
    toastScale.setValue(0.92);
    toastTranslateY.setValue(8);
    toastAnimRef.current = Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: TOAST_FADE_MS,
          useNativeDriver: true,
        }),
        Animated.spring(toastScale, {
          toValue: 1,
          damping: 16,
          stiffness: 220,
          mass: 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: TOAST_FADE_MS,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(TOAST_VISIBLE_MS),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: TOAST_FADE_MS + 40,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 4,
          duration: TOAST_FADE_MS + 40,
          useNativeDriver: true,
        }),
      ]),
    ]);
    toastAnimRef.current.start();
  }, [toastOpacity, toastScale, toastTranslateY]);

  const handleTabPress = useCallback(
    (itemRoute: AppRoute, locked: boolean) => {
      if (locked) {
        showComingSoonToast();
        return;
      }
      navigate(itemRoute);
    },
    [navigate, showComingSoonToast],
  );

  const badgeByRoute = useMemo<Partial<Record<AppRoute, number>>>(
    () => ({
      home: homeUnreadCount,
      machines: machinesAlertCount,
      community: communityUnreadCount,
    }),
    [homeUnreadCount, machinesAlertCount, communityUnreadCount],
  );

  const iconSize = r.isTablet ? 24 : 22;
  const labelSize = r.isTablet ? 11 : 10;
  const toastWidth = r.scale(88);
  const navWidth = r.isTablet ? Math.min(screenWidth, 560) : screenWidth;
  const navLeft = r.isTablet ? (screenWidth - navWidth) / 2 : 0;
  const toastLeft =
    navLeft + (navWidth / NAV_ITEMS.length) * (MARKET_TAB_INDEX + 0.5) - toastWidth / 2;

  return (
    <View style={styles.navRoot}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toastWrap,
          {
            opacity: toastOpacity,
            left: toastLeft,
            width: toastWidth,
            bottom: Math.max(insets.bottom, 8) + r.scale(52),
            transform: [{ scale: toastScale }, { translateY: toastTranslateY }],
          },
        ]}
      >
        <View style={[styles.toastShell, { borderRadius: r.scale(12) }]}>
          <BlurView
            intensity={Platform.OS === 'android' ? 72 : 58}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          />
          <View style={[StyleSheet.absoluteFill, styles.toastTint]} />
          <View
            style={[
              styles.toastContent,
              {
                paddingVertical: r.scale(7),
                paddingHorizontal: r.scale(10),
              },
            ]}
          >
            <Text style={[styles.toastKicker, { fontSize: r.scale(9) }]}>MARKET</Text>
            <Text style={[styles.toastText, { fontSize: r.scale(12), marginTop: r.scale(1) }]}>
              Yakında
            </Text>
          </View>
        </View>
        <View style={[styles.toastCaret, { borderTopColor: 'rgba(255,255,255,0.14)' }]} />
      </Animated.View>

      <View
        style={[
          styles.wrap,
          {
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      <View style={styles.borderTop} />

      <View
        style={[
          styles.row,
          {
            maxWidth: r.isTablet ? 560 : undefined,
            paddingHorizontal: r.isTablet ? 16 : 6,
          },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const locked = isRouteLocked(item.route);
          const active = route === item.route;
          const color = locked
            ? 'rgba(255,255,255,0.35)'
            : active
              ? '#fff'
              : 'rgba(255,255,255,0.55)';
          const badgeCount = locked ? 0 : (badgeByRoute[item.route] ?? 0);
          return (
            <Pressable
              key={item.route}
              onPress={() => handleTabPress(item.route, locked)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={locked ? `${item.label}, Yakında` : item.label}
              accessibilityState={{ selected: active, disabled: locked }}
              hitSlop={6}
            >
              <View style={styles.iconWrap}>
                <NavIcon icon={item.icon} size={iconSize} color={color} />
                {badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{formatBadgeCount(badgeCount)}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color,
                    fontSize: labelSize,
                    fontWeight: active && !locked ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {active && !locked ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navRoot: {
    position: 'relative',
  },
  toastWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  toastShell: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(10, 12, 20, 0.35)',
  },
  toastTint: {
    backgroundColor: 'rgba(10, 12, 20, 0.42)',
  },
  toastContent: {
    alignItems: 'center',
  },
  toastKicker: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  toastText: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  toastCaret: {
    width: 10,
    height: 10,
    marginTop: -5,
    backgroundColor: 'rgba(10, 12, 20, 0.72)',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    transform: [{ rotate: '45deg' }],
  },
  wrap: {
    paddingTop: 8,
    overflow: 'hidden',
  },
  tint: {
    backgroundColor: 'rgba(10, 12, 20, 0.55)',
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
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
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});
