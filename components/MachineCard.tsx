import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Machine } from '../types/machine';
import { formatUpdatedAt } from '../utils/formatDate';
import { useResponsive } from '../utils/responsive';

const DRAG_HOLD_MS = 2000;

type Props = {
  machine: Machine;
  onLongPressDrag?: () => void;
  isDragging?: boolean;
  dragHoldMs?: number;
};

function CenteredStat({
  label,
  value,
  labelSize,
  valueSize,
  shiftX = 0,
}: {
  label: string;
  value: string | number;
  labelSize: number;
  valueSize: number;
  shiftX?: number;
}) {
  return (
    <View style={[styles.summaryStatCol, shiftX !== 0 && { transform: [{ translateX: shiftX }] }]}>
      <Text style={[styles.metricLabel, { fontSize: labelSize }]}>{label}</Text>
      <Text style={[styles.metricValue, { fontSize: valueSize, marginTop: 2 }]}>{value}</Text>
    </View>
  );
}

export default function MachineCard({
  machine,
  onLongPressDrag,
  isDragging = false,
  dragHoldMs = DRAG_HOLD_MS,
}: Props) {
  const r = useResponsive();
  const [expanded, setExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const layout = useMemo(
    () => ({
      paddingH: r.scale(16),
      paddingTop: r.scale(14),
      paddingBottom: r.scale(14),
      borderRight: r.scale(9),
      borderRadius: r.scale(16),
      titleSize: r.scale(16),
      labelSize: r.scale(13),
      valueSize: r.scale(15),
      updatedSize: r.scale(11),
      waterIcon: r.scale(18),
      detailsGap: r.scale(12),
    }),
    [r],
  );

  const toggle = () => {
    if (isDragging) {
      return;
    }
    const next = !expanded;
    setIsAnimating(true);
    setExpanded(next);

    Animated.spring(expandAnim, {
      toValue: next ? 1 : 0,
      friction: 5,
      tension: 110,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsAnimating(false);
      }
    });
  };

  const constrainDetails = isAnimating || !expanded;

  const detailsMaxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, detailsHeight],
  });

  const detailsOpacity = expandAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.7, 1],
  });

  const detailsScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  useEffect(() => {
    if (!isDragging || !expanded) {
      return;
    }
    setExpanded(false);
    setIsAnimating(false);
    expandAnim.setValue(0);
  }, [isDragging, expanded, expandAnim]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          borderRightColor: machine.online ? '#34D399' : '#F87171',
          borderRightWidth: layout.borderRight,
          borderRadius: layout.borderRadius,
          paddingHorizontal: layout.paddingH,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        },
        isDragging && styles.cardDragging,
        pressed && !isDragging && styles.cardPressed,
      ]}
      onPress={toggle}
      onLongPress={onLongPressDrag}
      delayLongPress={dragHoldMs}
      disabled={isDragging}
      accessibilityRole="button"
      accessibilityState={{ expanded, selected: isDragging }}
      accessibilityHint="Hold for two seconds to reorder"
      accessibilityLabel={`${machine.name}, ${expanded ? 'collapse' : 'expand'} details`}
    >
      <Text
        style={[styles.cardTitle, { fontSize: layout.titleSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {machine.name}
      </Text>

      <View style={[styles.summaryRow, { marginTop: r.scale(10) }]}>
        <CenteredStat
          label="ppm"
          value={machine.ppm}
          labelSize={layout.labelSize}
          valueSize={layout.valueSize}
        />
        <CenteredStat
          label="pH"
          value={machine.ph}
          labelSize={layout.labelSize}
          valueSize={layout.valueSize}
        />
        <View style={styles.summaryStatCol}>
          <Ionicons name="water" size={layout.waterIcon} color="#60A5FA" />
          <Text style={[styles.metricValue, { fontSize: layout.valueSize, marginTop: 2 }]}>
            {machine.waterLevel}%
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          constrainDetails &&
            detailsHeight > 0 && {
              maxHeight: detailsMaxHeight,
              overflow: 'hidden',
            },
          isAnimating && {
            opacity: detailsOpacity,
            transform: [{ scaleY: detailsScale }],
          },
          !expanded &&
            !isAnimating && {
              height: 0,
              overflow: 'hidden',
              opacity: 0,
            },
        ]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <View
          style={[styles.details, { paddingTop: layout.detailsGap, gap: layout.detailsGap }]}
          onLayout={(e) => {
            const height = Math.ceil(e.nativeEvent.layout.height);
            if (height > 0 && height !== detailsHeight) {
              setDetailsHeight(height);
            }
          }}
        >
          <View style={styles.detailsRow}>
            <CenteredStat
              label="pH down"
              value={machine.phDown}
              labelSize={layout.labelSize}
              valueSize={layout.valueSize}
            />
            <CenteredStat
              label="pH up"
              value={machine.phUp}
              labelSize={layout.labelSize}
              valueSize={layout.valueSize}
            />
            <CenteredStat
              label="tank %"
              value={`${machine.waterLevel}%`}
              labelSize={layout.labelSize}
              valueSize={layout.valueSize}
            />
          </View>

          <Text style={[styles.updatedAt, { fontSize: layout.updatedSize }]}>
            updated at {formatUpdatedAt(machine.updatedAt)}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardDragging: {
    opacity: 0.92,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryStatCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {},
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  metricValue: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  updatedAt: {
    alignSelf: 'flex-end',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
