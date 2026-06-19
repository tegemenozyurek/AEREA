import React, { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { withAlpha } from '../utils/color';

type Props = {
  label: string;
  value: string | number;
  color: string;
  size: number;
  labelSize: number;
  valueSize: number;
  icon?: ReactNode;
  floatIndex?: number;
  onPress?: () => void;
  labelGap?: number;
  shiftX?: number;
};

export default function MetricRing({
  label,
  value,
  color,
  size,
  labelSize,
  valueSize,
  icon,
  floatIndex = 0,
  onPress,
  labelGap = 8,
  shiftX = 0,
}: Props) {
  const ringWidth = Math.max(2.5, Math.round(size * 0.055));
  const innerSize = size - ringWidth * 2 - 4;
  const driftY = useSharedValue(0);
  const driftX = useSharedValue(0);

  useEffect(() => {
    const phase = floatIndex * 420;
    const duration = 2400 + floatIndex * 220;
    const yAmount = Math.max(4, size * 0.07);
    const xAmount = Math.max(2.5, size * 0.045);
    const easing = Easing.inOut(Easing.sin);

    driftY.value = withDelay(
      phase,
      withRepeat(
        withSequence(
          withTiming(-yAmount, { duration, easing }),
          withTiming(yAmount, { duration, easing }),
        ),
        -1,
        true,
      ),
    );

    driftX.value = withDelay(
      phase + 260,
      withRepeat(
        withSequence(
          withTiming(xAmount, { duration: duration * 1.15, easing }),
          withTiming(-xAmount, { duration: duration * 1.15, easing }),
        ),
        -1,
        true,
      ),
    );
  }, [driftX, driftY, floatIndex, size]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: driftY.value }, { translateX: driftX.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, show 48 hour history`}
      style={shiftX !== 0 ? { transform: [{ translateX: shiftX }] } : undefined}
    >
      <Animated.View style={[styles.wrap, { width: size + 12 }, floatStyle]}>
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ringWidth,
            borderColor: color,
            shadowColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.innerRing,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              borderColor: withAlpha(color, 0.33),
            },
          ]}
        >
          {icon}
          <Text
            style={[styles.value, { fontSize: valueSize, color }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {value}
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { fontSize: labelSize, marginTop: labelGap }]} numberOfLines={1}>
        {label}
      </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  outerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  innerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  value: {
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
