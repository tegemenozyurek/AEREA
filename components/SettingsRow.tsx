import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  value?: string;
  icon?: IoniconName;
  /** Show only icon + value (no visible label). Label still used for accessibility. */
  iconOnly?: boolean;
  destructive?: boolean;
  centered?: boolean;
  stacked?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  rightElement?: ReactNode;
  isLast?: boolean;
  spacingBelow?: number;
  valueEllipsize?: 'head' | 'middle' | 'tail' | 'clip';
};

export default function SettingsRow({
  label,
  value,
  icon,
  iconOnly = false,
  destructive = false,
  centered = false,
  stacked = false,
  showChevron = false,
  onPress,
  rightElement,
  isLast = false,
  spacingBelow,
  valueEllipsize = 'tail',
}: Props) {
  const r = useResponsive();
  const valueMaxWidth = Math.max(r.scale(96), r.width * 0.38);
  const iconColor = destructive ? '#FCA5A5' : 'rgba(255,255,255,0.55)';

  const iconNode = icon ? (
    <View
      style={[
        styles.iconWrap,
        {
          width: r.scale(32),
          height: r.scale(32),
          borderRadius: r.scale(10),
          marginRight: r.scale(10),
        },
        destructive && styles.iconWrapDestructive,
      ]}
    >
      <Ionicons name={icon} size={r.scale(17)} color={iconColor} />
    </View>
  ) : null;

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
  ) : iconOnly ? (
    <>
      {iconNode}
      {value ? (
        <Text
          style={[styles.valueIconOnly, { fontSize: r.scale(14) }]}
          numberOfLines={1}
          ellipsizeMode={valueEllipsize}
          selectable
        >
          {value}
        </Text>
      ) : null}
      <View style={styles.right}>
        {rightElement}
        {showChevron ? (
          <Ionicons name="chevron-forward" size={r.scale(15)} color="rgba(255,255,255,0.28)" />
        ) : null}
      </View>
    </>
  ) : stacked ? (
    <View style={styles.stackedBody}>
      <View style={styles.stackedHeader}>
        {iconNode}
        <Text
          style={[
            styles.label,
            styles.labelStacked,
            { fontSize: r.scale(14) },
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
        <Text
          style={[
            styles.valueStacked,
            {
              fontSize: r.scale(14),
              marginTop: r.scale(6),
              marginLeft: icon ? r.scale(42) : 0,
            },
          ]}
          selectable
        >
          {value}
        </Text>
      ) : null}
      {rightElement}
    </View>
  ) : (
    <>
      {iconNode}
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
          <Text
            style={[styles.value, { fontSize: r.scale(13), maxWidth: valueMaxWidth }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
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
    {
      paddingVertical: r.scale(stacked ? 14 : 13),
      paddingHorizontal: r.scale(14),
      minHeight: r.scale(52),
    },
    spacingBelow !== undefined && { marginBottom: spacingBelow },
    !isLast && spacingBelow === undefined && styles.rowBorder,
  ];

  if (!onPress) {
    return (
      <View
        style={rowStyle}
        accessibilityLabel={iconOnly && value ? `${label}, ${value}` : label}
      >
        {content}
      </View>
    );
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
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  stackedBody: {
    width: '100%',
  },
  stackedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCentered: {
    justifyContent: 'center',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  iconWrapDestructive: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.22)',
  },
  label: {
    flex: 1,
    color: '#fff',
    fontWeight: '500',
    letterSpacing: 0.1,
    minWidth: 0,
  },
  labelStacked: {
    flex: 1,
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
    marginLeft: 8,
  },
  value: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
    textAlign: 'right',
  },
  valueStacked: {
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '400',
    lineHeight: 20,
  },
  valueIconOnly: {
    flex: 1,
    minWidth: 0,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    letterSpacing: 0.05,
  },
});
