import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon?: IoniconName;
  label: string;
  value?: string;
  showChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  rightElement?: ReactNode;
  isLast?: boolean;
};

export default function SettingsRow({
  icon,
  label,
  value,
  showChevron = false,
  destructive = false,
  onPress,
  rightElement,
  isLast = false,
}: Props) {
  const r = useResponsive();
  const content = (
    <>
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              width: r.scale(32),
              height: r.scale(32),
              borderRadius: r.scale(10),
            },
            destructive && styles.iconWrapDestructive,
          ]}
        >
          <Ionicons
            name={icon}
            size={r.scale(17)}
            color={destructive ? '#FCA5A5' : 'rgba(255,255,255,0.85)'}
          />
        </View>
      ) : null}

      <Text
        style={[
          styles.label,
          { fontSize: r.scale(15) },
          destructive && styles.labelDestructive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      <View style={styles.right}>
        {value ? (
          <Text style={[styles.value, { fontSize: r.scale(13), maxWidth: r.scale(140) }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {rightElement}
        {showChevron ? (
          <Ionicons name="chevron-forward" size={r.scale(16)} color="rgba(255,255,255,0.35)" />
        ) : null}
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.row,
          { paddingVertical: r.scale(13), paddingHorizontal: r.scale(14) },
          !isLast && styles.rowBorder,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { paddingVertical: r.scale(13), paddingHorizontal: r.scale(14) },
        !isLast && styles.rowBorder,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconWrapDestructive: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  label: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  labelDestructive: {
    color: '#FCA5A5',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    textAlign: 'right',
  },
});
