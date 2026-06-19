import { BlurView } from 'expo-blur';
import React, { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { RADIUS } from './communityPostShared';

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView
        intensity={Platform.OS === 'android' ? 84 : 68}
        tint="dark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={
          Platform.OS === 'android' ? 'dimezisBlurView' : undefined
        }
      />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      <View style={[StyleSheet.absoluteFill, styles.glassSheen]} pointerEvents="none" />
      <View style={styles.edgeHighlight} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderRadius: RADIUS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(0,0,0,0.16)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.28,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tint: {
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  glassSheen: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  edgeHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.card,
  },
  content: {
    position: 'relative',
  },
});
