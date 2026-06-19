import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { withAlpha } from '../utils/color';
import type { MetricKey } from '../utils/mockMetricHistory';
import {
  build48hHistory,
  formatMetricValue,
} from '../utils/mockMetricHistory';
import { useResponsive } from '../utils/responsive';

export const CHART_HEIGHT = 156;
export const CHART_PADDING = { top: 14, right: 14, bottom: 28, left: 14 };

type Props = {
  metricKey: MetricKey;
  color: string;
  currentValue: number;
  machineId: string;
  chartWidth: number;
  showStats?: boolean;
};

export default function MetricHistoryChart({
  metricKey,
  color,
  currentValue,
  machineId,
  chartWidth,
  showStats = true,
}: Props) {
  const r = useResponsive();

  const history = useMemo(
    () => build48hHistory(metricKey, currentValue, machineId),
    [metricKey, currentValue, machineId],
  );

  const chart = useMemo(() => {
    const values = history.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerW = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    const innerH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

    const dots = history.map((point, index) => {
      const x = CHART_PADDING.left + (index / (history.length - 1)) * innerW;
      const y = CHART_PADDING.top + innerH - ((point.value - min) / range) * innerH;
      return { x, y, value: point.value };
    });

    const linePoints = dots.map((dot) => `${dot.x},${dot.y}`).join(' ');
    const lastDot = dots[dots.length - 1];

    return { linePoints, lastDot, min, max };
  }, [chartWidth, history]);

  return (
    <View>
      <View
        style={[
          styles.chartCard,
          {
            borderRadius: r.scale(14),
            paddingVertical: r.scale(8),
          },
        ]}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Polyline
            points={chart.linePoints}
            fill="none"
            stroke={withAlpha(color, 0.45)}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {chart.lastDot ? (
            <Circle
              cx={chart.lastDot.x}
              cy={chart.lastDot.y}
              r={5}
              fill={color}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1.5}
            />
          ) : null}
        </Svg>

        <View style={[styles.axisRow, { paddingHorizontal: CHART_PADDING.left }]}>
          <Text style={[styles.axisLabel, { fontSize: r.scale(10) }]}>48h ago</Text>
          <Text style={[styles.axisLabel, { fontSize: r.scale(10) }]}>Now</Text>
        </View>
      </View>

      {showStats ? (
        <View style={[styles.statsRow, { marginTop: r.scale(12), gap: r.scale(10) }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: r.scale(11) }]}>Min</Text>
            <Text style={[styles.statValue, { fontSize: r.scale(14), color }]}>
              {formatMetricValue(metricKey, chart.min)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: r.scale(11) }]}>Max</Text>
            <Text style={[styles.statValue, { fontSize: r.scale(14), color }]}>
              {formatMetricValue(metricKey, chart.max)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: r.scale(11) }]}>Now</Text>
            <Text style={[styles.statValue, { fontSize: r.scale(14), color }]}>
              {formatMetricValue(metricKey, currentValue)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: CHART_PADDING.right,
    marginTop: -6,
  },
  axisLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
  },
});
