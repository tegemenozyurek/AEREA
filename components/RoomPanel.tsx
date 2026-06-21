import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RoomEnvironment } from '../types/room';

type Props = {
  roomName: string;
  machineCount: number;
  environment: RoomEnvironment;
  expanded: boolean;
  showContent?: boolean;
  refreshing?: boolean;
  scale: (value: number) => number;
  onToggle: () => void;
  onEdit: () => void;
  onRefresh?: () => void;
  children?: ReactNode;
};

type MetricItemProps = {
  label: string;
  value: string;
  scale: (value: number) => number;
  showDivider?: boolean;
};

function MetricItem({ label, value, scale, showDivider }: MetricItemProps) {
  return (
    <View style={[styles.metricCell, showDivider && styles.metricCellDivider]}>
      <Text
        style={[styles.metricLabel, { fontSize: scale(10) }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
      <Text
        style={[styles.metricValue, { fontSize: scale(14), marginTop: scale(4) }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
    </View>
  );
}

function MetricRow({
  items,
  scale,
  columns,
}: {
  items: { label: string; value: string }[];
  scale: (value: number) => number;
  columns?: number;
}) {
  const columnCount = columns ?? items.length;
  const cells: ({ label: string; value: string } | null)[] = [...items];
  while (cells.length < columnCount) {
    cells.push(null);
  }

  return (
    <View style={styles.metricRow}>
      {cells.map((metric, index) =>
        metric ? (
          <MetricItem
            key={metric.label}
            label={metric.label}
            value={metric.value}
            scale={scale}
            showDivider={index < columnCount - 1}
          />
        ) : (
          <View
            key={`metric-spacer-${index}`}
            style={[styles.metricCell, index < columnCount - 1 && styles.metricCellDivider]}
          />
        ),
      )}
    </View>
  );
}

export default function RoomPanel({
  roomName,
  machineCount,
  environment,
  expanded,
  showContent,
  refreshing = false,
  scale,
  onToggle,
  onEdit,
  onRefresh,
  children,
}: Props) {
  const machinesVisible = showContent ?? expanded;

  const topMetrics = [
    { label: 'Temp', value: `${environment.temperatureC.toFixed(1)}°C` },
    { label: 'Humidity', value: `${environment.humidityPct}%` },
    { label: 'Water', value: `${environment.waterLevelL.toFixed(1)} L` },
  ];

  const bottomMetrics = [
    { label: 'pH Up', value: `${environment.phUpLevelL.toFixed(1)} L` },
    { label: 'pH Down', value: `${environment.phDownLevelL.toFixed(1)} L` },
  ];

  return (
    <View
      style={[
        styles.panel,
        expanded && styles.panelExpanded,
        expanded && styles.panelExpandedOverflow,
        {
          borderRadius: scale(14),
          paddingTop: scale(12),
          paddingBottom: scale(12),
          paddingHorizontal: scale(12),
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.titleGroup, { gap: scale(6) }]}>
          <Text style={[styles.roomTitle, { fontSize: scale(18) }]} numberOfLines={1}>
            {roomName}
          </Text>
          <TouchableOpacity
            style={[styles.editButton, { width: scale(26), height: scale(26) }]}
            activeOpacity={0.7}
            onPress={onEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${roomName}`}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={scale(16)}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.toggleButton, { paddingVertical: scale(4), paddingLeft: scale(8) }]}
          activeOpacity={0.7}
          onPress={onToggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={expanded ? `Show less in ${roomName}` : `Show more in ${roomName}`}
        >
          <Text style={[styles.toggleText, { fontSize: scale(12) }]}>
            {expanded ? 'Show less' : `Show more (${machineCount})`}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={scale(14)}
            color="rgba(147,197,253,0.85)"
            style={{ marginLeft: scale(2) }}
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.metricsBand,
          {
            marginTop: scale(10),
            paddingVertical: scale(8),
            paddingHorizontal: scale(6),
            borderRadius: scale(10),
            gap: scale(6),
          },
        ]}
      >
        <MetricRow items={topMetrics} scale={scale} columns={3} />
        <View style={styles.metricRowDivider} />
        <View style={styles.metricRow}>
          {bottomMetrics.map((metric) => (
            <MetricItem
              key={metric.label}
              label={metric.label}
              value={metric.value}
              scale={scale}
              showDivider
            />
          ))}
          <View style={styles.metricCell}>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                {
                  paddingHorizontal: scale(12),
                  paddingVertical: scale(8),
                  borderRadius: scale(12),
                  minWidth: scale(44),
                },
              ]}
              activeOpacity={0.7}
              onPress={onRefresh}
              disabled={refreshing || !onRefresh}
              accessibilityRole="button"
              accessibilityLabel="Refresh room metrics"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#93C5FD" />
              ) : (
                <Ionicons name="refresh" size={scale(18)} color="rgba(255,255,255,0.85)" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {machinesVisible && children ? (
        <>
          <View
            style={[
              styles.divider,
              { marginTop: scale(10), marginBottom: scale(10) },
            ]}
          />
          <View style={styles.machinesSection}>{children}</View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(38, 46, 62, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  panelExpanded: {
    backgroundColor: 'rgba(44, 54, 72, 0.92)',
    borderColor: 'rgba(96,165,250,0.28)',
  },
  panelExpandedOverflow: {
    overflow: 'visible',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  roomTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  toggleText: {
    color: 'rgba(147,197,253,0.9)',
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  metricsBand: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metricRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  metricCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  metricValue: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  machinesSection: {
    overflow: 'visible',
  },
});
