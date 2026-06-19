import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string | number;
  color: string;
  size: number;
  labelSize: number;
  valueSize: number;
  icon?: ReactNode;
};

export default function MetricRing({
  label,
  value,
  color,
  size,
  labelSize,
  valueSize,
  icon,
}: Props) {
  const ringWidth = Math.max(2.5, Math.round(size * 0.055));
  const innerSize = size - ringWidth * 2 - 4;

  return (
    <View style={[styles.wrap, { width: size + 12 }]}>
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
              borderColor: `${color}55`,
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
      <Text style={[styles.label, { fontSize: labelSize, marginTop: 8 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
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
