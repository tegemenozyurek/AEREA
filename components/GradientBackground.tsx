import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientBackgroundProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const GRADIENT_COLORS = ['#3861C9', '#6D2B96'] as const;
export const GRADIENT_LOCATIONS = [0.23, 0.79] as const;

export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
