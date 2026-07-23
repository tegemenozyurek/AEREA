import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';

type Props = {
  message: string | null;
  onHide: () => void;
  durationMs?: number;
};

export default function SettingsToast({ message, onHide, durationMs = 2600 }: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (!message) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(-12);

    const show = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
    ]);

    const hide = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -8,
        duration: 220,
        useNativeDriver: true,
      }),
    ]);

    show.start();
    const timer = setTimeout(() => {
      hide.start(({ finished }) => {
        if (finished) onHide();
      });
    }, durationMs);

    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
      translateY.stopAnimation();
    };
  }, [message, durationMs, onHide, opacity, translateY]);

  if (!message) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + r.scale(58),
          paddingHorizontal: r.horizontalPadding,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.toast,
          {
            opacity,
            transform: [{ translateY }],
            borderRadius: r.scale(14),
            paddingVertical: r.scale(12),
            paddingHorizontal: r.scale(14),
            gap: r.scale(10),
            maxWidth: r.contentMaxWidth,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              width: r.scale(28),
              height: r.scale(28),
              borderRadius: r.scale(14),
            },
          ]}
        >
          <Ionicons name="checkmark" size={r.scale(16)} color="#fff" />
        </View>
        <Text style={[styles.text, { fontSize: r.scale(14) }]} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 40,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 120, 60, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  text: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
