import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const showApple = Platform.OS === 'ios';

type SocialOption = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  size?: number;
};

const SOCIAL_OPTIONS: SocialOption[] = [
  ...(showApple
    ? [{ key: 'apple', icon: 'logo-apple' as const, label: 'Apple', size: 20 }]
    : []),
  { key: 'google', icon: 'logo-google', label: 'Google', size: 18 },
];

/** Visual-only social sign-in placeholders (not wired up yet). */
export default function AuthSocialOptions() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.row}>
        {SOCIAL_OPTIONS.map((option) => (
          <View
            key={option.key}
            style={styles.iconButton}
            accessibilityLabel={`Sign in with ${option.label}`}
          >
            <Ionicons name={option.icon} size={option.size ?? 18} color="#fff" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 8,
    width: '100%',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  orText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginTop: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
});
