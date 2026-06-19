import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type Props = {
  title?: string;
  marginTop?: number;
  separated?: boolean;
  onEditPress?: () => void;
  headerAction?: ReactNode;
  children: ReactNode;
};

export default function SettingsSection({
  title,
  marginTop = 0,
  separated = false,
  onEditPress,
  headerAction,
  children,
}: Props) {
  const r = useResponsive();
  const gap = r.scale(12);
  const items = React.Children.toArray(children);
  const showHeader = Boolean(title || onEditPress || headerAction);

  const editButton = onEditPress ? (
    <TouchableOpacity
      style={[
        styles.editButton,
        { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
      ]}
      activeOpacity={0.7}
      onPress={onEditPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Edit profile"
    >
      <Ionicons name="pencil-outline" size={r.scale(16)} color="#fff" />
    </TouchableOpacity>
  ) : null;

  return (
    <View style={{ marginTop, marginBottom: r.scale(12) }}>
      {showHeader ? (
        <View
          style={[
            styles.headerRow,
            {
              marginBottom: r.scale(8),
              paddingHorizontal: r.scale(2),
            },
          ]}
        >
          {title ? (
            <Text style={[styles.title, { fontSize: r.scale(12) }]}>{title}</Text>
          ) : (
            <View />
          )}
          {headerAction ?? editButton}
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  group: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
});
