import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type Props = {
  label: string;
  value?: string;
  destructive?: boolean;
  centered?: boolean;
  stacked?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: ReactNode;
  isLast?: boolean;
  spacingBelow?: number;
};

export default function SettingsRow({
  label,
  value,
  destructive = false,
  centered = false,
  stacked = false,
  showChevron = false,
  onPress,
  rightElement,
  isLast = false,
  spacingBelow,
}: Props) {
  const r = useResponsive();

  const content = centered ? (
    <Text
      style={[
        styles.label,
        styles.labelCentered,
        { fontSize: r.scale(15) },
        destructive && styles.labelDestructive,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  ) : stacked ? (
    <>
      <View style={styles.stackedHeader}>
        <Text
          style={[
            styles.label,
            styles.labelStacked,
            { fontSize: r.scale(15) },
            destructive && styles.labelDestructive,
          ]}
        >
          {label}
        </Text>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={r.scale(15)} color="rgba(255,255,255,0.28)" />
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.valueStacked, { fontSize: r.scale(14), marginTop: r.scale(6) }]}>
          {value}
        </Text>
      ) : null}
      {rightElement}
    </>
  ) : (
    <>
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
          <Text style={[styles.value, { fontSize: r.scale(13), maxWidth: r.scale(170) }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {rightElement}
        {showChevron ? (
          <Ionicons name="chevron-forward" size={r.scale(15)} color="rgba(255,255,255,0.28)" />
        ) : null}
      </View>
    </>
  );

  const rowStyle = [
    stacked ? styles.rowStacked : styles.row,
    centered && styles.rowCentered,
    { paddingVertical: r.scale(15), paddingHorizontal: r.scale(14) },
    spacingBelow !== undefined && { marginBottom: spacingBelow },
    !isLast && spacingBelow === undefined && styles.rowBorder,
  ];

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={rowStyle}
      activeOpacity={0.65}
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
    justifyContent: 'space-between',
    gap: 12,
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  stackedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelStacked: {
    flex: 0,
  },
  labelCentered: {
    flex: 0,
    width: '100%',
    textAlign: 'center',
  },
  labelDestructive: {
    color: '#FCA5A5',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  value: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '400',
    textAlign: 'right',
  },
  valueStacked: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
    lineHeight: 20,
  },
});
