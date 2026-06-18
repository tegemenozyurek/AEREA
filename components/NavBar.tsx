import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppRoute, useNavigation } from '../contexts/NavigationContext';
import { useResponsive } from '../utils/responsive';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type FA5Name = React.ComponentProps<typeof FontAwesome5>['name'];

type IconSpec =
  | { lib: 'ion'; name: IoniconName }
  | { lib: 'fa5'; name: FA5Name };

const NAV_ITEMS: { label: string; route: AppRoute; icon: IconSpec }[] = [
  { label: 'Home', route: 'home', icon: { lib: 'ion', name: 'home-outline' } },
  { label: 'Rooms', route: 'rooms', icon: { lib: 'ion', name: 'grid-outline' } },
  { label: 'Machines', route: 'machines', icon: { lib: 'fa5', name: 'seedling' } },
  {
    label: 'Analysis',
    route: 'analysis',
    icon: { lib: 'ion', name: 'analytics-outline' },
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

export default function NavBar() {
  const { route, navigate } = useNavigation();
  const insets = useSafeAreaInsets();
  const r = useResponsive();

  const iconSize = r.isTablet ? 24 : 22;
  const labelSize = r.isTablet ? 12 : 11;

  return (
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
          const active = route === item.route;
          const color = active ? '#fff' : 'rgba(255,255,255,0.55)';
          return (
            <Pressable
              key={item.route}
              onPress={() => navigate(item.route)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              hitSlop={6}
            >
              <NavIcon icon={item.icon} size={iconSize} color={color} />
              <Text
                style={[
                  styles.label,
                  {
                    color,
                    fontSize: labelSize,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {active ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
