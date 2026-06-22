import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { withAlpha } from '../utils/color';
import { formatDateTime } from '../utils/formatDate';
import type { PlantProfile } from '../types/plantProfile';
import type { HistoryHours, MetricKey } from '../utils/mockMetricHistory';
import {
  buildMetricHistory,
  formatMetricValue,
  getMetricYAxisRange,
} from '../utils/mockMetricHistory';
import { useResponsive } from '../utils/responsive';

export const CHART_HEIGHT = 156;
export const CHART_PADDING = { top: 14, right: 14, bottom: 28, left: 14 };
const DOT_HIT_SIZE = 28;
const TOOLTIP_WIDTH = 108;
const TOOLTIP_HEIGHT = 40;

type ChartDot = {
  x: number;
  y: number;
  value: number;
  at: Date;
  index: number;
};

type Props = {
  metricKey: MetricKey;
  color: string;
  currentValue: number;
  machineId: string;
  chartWidth: number;
  historyHours?: HistoryHours;
  plantProfile?: PlantProfile | null;
  showStats?: boolean;
};

function valueToY(
  value: number,
  min: number,
  max: number,
  innerH: number,
  top: number,
): number {
  const range = max - min || 1;
  const normalized = (value - min) / range;
  return top + innerH - normalized * innerH;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function MetricHistoryChart({
  metricKey,
  color,
  currentValue,
  machineId,
  chartWidth,
  historyHours = 48,
  plantProfile = null,
  showStats = true,
}: Props) {
  const r = useResponsive();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const chartAreaRef = useRef<View>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartOrigin, setChartOrigin] = useState({ x: 0, y: 0 });

  const history = useMemo(
    () => buildMetricHistory(metricKey, currentValue, machineId, historyHours),
    [metricKey, currentValue, machineId, historyHours],
  );

  useEffect(() => {
    setSelectedIndex(null);
  }, [historyHours, metricKey, machineId]);

  const chart = useMemo(() => {
    const values = history.map((point) => point.value);
    const axis = getMetricYAxisRange(metricKey, values, plantProfile);
    const innerW = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
    const innerH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

    const dots: ChartDot[] = history.map((point, index) => {
      const x =
        CHART_PADDING.left +
        (history.length <= 1 ? innerW / 2 : (index / (history.length - 1)) * innerW);
      const y = valueToY(point.value, axis.min, axis.max, innerH, CHART_PADDING.top);
      return { x, y, value: point.value, at: point.at, index };
    });

    const linePoints = dots.map((dot) => `${dot.x},${dot.y}`).join(' ');

    const toleranceLines =
      axis.fixed && (metricKey === 'ppm' || metricKey === 'ph')
        ? [
            valueToY(axis.max, axis.min, axis.max, innerH, CHART_PADDING.top),
            valueToY(axis.min, axis.min, axis.max, innerH, CHART_PADDING.top),
          ]
        : null;

    return {
      dots,
      linePoints,
      min: axis.min,
      max: axis.max,
      toleranceLines,
      dataMin: Math.min(...values),
      dataMax: Math.max(...values),
    };
  }, [chartWidth, history, metricKey, plantProfile]);

  const selectedDot =
    selectedIndex !== null ? chart.dots.find((dot) => dot.index === selectedIndex) : null;

  const handleSelectDot = (index: number) => {
    chartAreaRef.current?.measureInWindow((x, y) => {
      setChartOrigin({ x, y });
      setSelectedIndex(index);
    });
  };

  const tooltipScreenLeft = selectedDot
    ? clamp(
        chartOrigin.x + selectedDot.x - TOOLTIP_WIDTH / 2,
        8,
        screenWidth - TOOLTIP_WIDTH - 8,
      )
    : 0;
  const tooltipScreenTop = selectedDot
    ? clamp(chartOrigin.y + selectedDot.y - TOOLTIP_HEIGHT - 10, 8, screenHeight - TOOLTIP_HEIGHT - 8)
    : 0;

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
        <View
          ref={chartAreaRef}
          style={{ width: chartWidth, height: CHART_HEIGHT, position: 'relative' }}
          collapsable={false}
        >
          <Svg width={chartWidth} height={CHART_HEIGHT} pointerEvents="none">
            {chart.toleranceLines?.map((y, index) => (
              <Line
                key={`tolerance-${index}`}
                x1={CHART_PADDING.left}
                y1={y}
                x2={chartWidth - CHART_PADDING.right}
                y2={y}
                stroke="rgba(248,113,113,0.7)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            ))}

            <Polyline
              points={chart.linePoints}
              fill="none"
              stroke={withAlpha(color, 0.5)}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {chart.dots.map((dot) => {
              const isSelected = selectedIndex === dot.index;
              const isLast = dot.index === chart.dots.length - 1;
              const radius = isSelected ? 5.5 : isLast ? 4.5 : 3.5;

              return (
                <Circle
                  key={`dot-${dot.index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={radius}
                  fill={isSelected || isLast ? color : withAlpha(color, 0.35)}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
              );
            })}
          </Svg>

          {chart.dots.map((dot) => (
            <Pressable
              key={`hit-${dot.index}`}
              style={[
                styles.dotHit,
                {
                  left: dot.x - DOT_HIT_SIZE / 2,
                  top: dot.y - DOT_HIT_SIZE / 2,
                  width: DOT_HIT_SIZE,
                  height: DOT_HIT_SIZE,
                },
              ]}
              onPress={() => handleSelectDot(dot.index)}
              accessibilityRole="button"
              accessibilityLabel={`${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`}
            />
          ))}
        </View>

        <View style={[styles.axisRow, { paddingHorizontal: CHART_PADDING.left }]}>
          <Text style={[styles.axisLabel, { fontSize: r.scale(10) }]}>{historyHours}h ago</Text>
          <Text style={[styles.axisLabel, { fontSize: r.scale(10) }]}>Now</Text>
        </View>
      </View>

      {showStats ? (
        <View style={[styles.statsRow, { marginTop: r.scale(12), gap: r.scale(10) }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: r.scale(11) }]}>Min</Text>
            <Text style={[styles.statValue, { fontSize: r.scale(14), color }]}>
              {formatMetricValue(metricKey, chart.dataMin)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, { fontSize: r.scale(11) }]}>Max</Text>
            <Text style={[styles.statValue, { fontSize: r.scale(14), color }]}>
              {formatMetricValue(metricKey, chart.dataMax)}
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

      <Modal
        visible={selectedIndex !== null}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedIndex(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedIndex(null)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss chart point details"
        >
          {selectedDot ? (
            <View
              style={[
                styles.tooltip,
                {
                  left: tooltipScreenLeft,
                  top: tooltipScreenTop,
                  width: TOOLTIP_WIDTH,
                  borderRadius: r.scale(8),
                  paddingVertical: r.scale(5),
                  paddingHorizontal: r.scale(8),
                },
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.tooltipValue, { fontSize: r.scale(11), color }]}>
                {formatMetricValue(metricKey, selectedDot.value)}
              </Text>
              <Text style={[styles.tooltipTime, { fontSize: r.scale(9), marginTop: r.scale(1) }]}>
                {formatDateTime(selectedDot.at)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
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
  dotHit: {
    position: 'absolute',
    borderRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipValue: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  tooltipTime: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    textAlign: 'center',
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
