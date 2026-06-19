import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type Props = {
  title?: string;
  marginTop?: number;
  separated?: boolean;
  children: ReactNode;
};

export default function SettingsSection({ title, marginTop = 0, separated = false, children }: Props) {
  const r = useResponsive();
  const gap = r.scale(12);
  const items = React.Children.toArray(children);

  return (
    <View style={{ marginTop, marginBottom: r.scale(12) }}>
      {title ? (
        <Text
          style={[
            styles.title,
            {
              fontSize: r.scale(12),
              marginBottom: r.scale(8),
              marginLeft: r.scale(2),
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      {separated ? (
        <View style={{ gap }}>
          {items.map((child, index) => (
            <View
              key={index}
              style={[
                styles.group,
                {
                  borderRadius: r.scale(12),
                },
              ]}
            >
              {child}
            </View>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.group,
            {
              borderRadius: r.scale(12),
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  group: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});
