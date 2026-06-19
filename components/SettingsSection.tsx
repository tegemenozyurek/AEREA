import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type Props = {
  title: string;
  children: ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
  const r = useResponsive();

  return (
    <View style={{ marginBottom: r.scale(20) }}>
      <Text
        style={[
          styles.title,
          {
            fontSize: r.scale(12),
            marginBottom: r.scale(8),
            marginLeft: r.scale(4),
          },
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.card,
          {
            borderRadius: r.scale(14),
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
});
