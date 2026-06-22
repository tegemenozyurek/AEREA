import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { withAlpha } from '../utils/color';
import { formatDateTime } from '../utils/formatDate';
import type { PlantProfile } from '../types/plantProfile';
import type { HistoryHours, MetricKey, PhCorrection, PumpHistoryEntry } from '../utils/mockMetricHistory';
import {
  buildChartLineSegments,
  buildMetricHistory,
  extractPumpHistory,
  formatMetricValue,
  formatPumpVolumeLiters,
  getMetricOptimumValue,
  getMetricYAxisRange,
} from '../utils/mockMetricHistory';
import { useResponsive } from '../utils/responsive';

const OUT_OF_TOLERANCE_COLOR = 'rgba(248,113,113,0.88)';

export const CHART_HEIGHT = 188;
export const CHART_PADDING = { top: 22, right: 16, bottom: 30, left: 48 };
const Y_AXIS_LABEL_HEIGHT = 12;
const DOT_HIT_SIZE = 28;
const TOOLTIP_WIDTH = 108;
const TOOLTIP_HEIGHT = 40;

type ChartDot = {
  x: number;
  y: number;
  value: number;
  at: Date;
  index: number;
  nutrientDose?: boolean;
  phCorrection?: PhCorrection;
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
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(innerH)) {
    return top + innerH / 2;
  }

  const safeMax = max > min ? max : min + 1;
  const range = safeMax - min;
  const normalized = (value - min) / range;
  const y = top + innerH - normalized * innerH;
  return Number.isFinite(y) ? y : top + innerH / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isValueOutOfTolerance(
  value: number,
  toleranceMin?: number,
  toleranceMax?: number,
): boolean {
  if (toleranceMin === undefined || toleranceMax === undefined) return false;
  return value < toleranceMin || value > toleranceMax;
}

function yAxisLabelTop(y: number, index: number, tickCount: number, labelHeight: number): number {
  const centered = y - labelHeight / 2;
  if (index === 0) {
    return Math.max(centered, CHART_PADDING.top - 2);
  }
  if (index === tickCount - 1) {
    return Math.min(centered, CHART_HEIGHT - CHART_PADDING.bottom - labelHeight + 2);
  }
  return centered;
}

function pumpEntryColor(entry: PumpHistoryEntry, metricColor: string): string {
  if (entry.kind === 'ph-up') return '#A78BFA';
  if (entry.kind === 'ph-down') return '#FB7185';
  return metricColor;
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
    () => buildMetricHistory(metricKey, currentValue, machineId, historyHours, plantProfile),
    [metricKey, currentValue, machineId, historyHours, plantProfile],
  );

  useEffect(() => {
    setSelectedIndex(null);
  }, [historyHours, metricKey, machineId]);

  const pumpHistory = useMemo(
    () => extractPumpHistory(metricKey, history),
    [history, metricKey],
  );

  const chart = useMemo(() => {
    const values = history.map((point) => point.value);
    const axis = getMetricYAxisRange(metricKey, values, plantProfile);
    const innerW = Math.max(1, chartWidth - CHART_PADDING.left - CHART_PADDING.right);
    const innerH = Math.max(1, CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);
    const pointCount = Math.max(history.length, 1);

    const dots: ChartDot[] = history.map((point, index) => {
      const x =
        CHART_PADDING.left +
        (pointCount <= 1 ? innerW / 2 : (index / (pointCount - 1)) * innerW);
      const safeValue = Number.isFinite(point.value) ? point.value : axis.min;
      const y = valueToY(safeValue, axis.min, axis.max, innerH, CHART_PADDING.top);
      return {
        x: Number.isFinite(x) ? x : CHART_PADDING.left,
        y,
        value: safeValue,
        at: point.at,
        index,
        nutrientDose: point.nutrientDose,
        phCorrection: point.phCorrection,
      };
    });

    const valueToAxisY = (value: number) =>
      valueToY(value, axis.min, axis.max, innerH, CHART_PADDING.top);
    const lineSegments = buildChartLineSegments(
      dots,
      axis.toleranceMin,
      axis.toleranceMax,
      valueToAxisY,
    );

    const toleranceLines =
      axis.toleranceMin !== undefined && axis.toleranceMax !== undefined
        ? [
            valueToY(axis.toleranceMax, axis.min, axis.max, innerH, CHART_PADDING.top),
            valueToY(axis.toleranceMin, axis.min, axis.max, innerH, CHART_PADDING.top),
          ]
        : null;

    const optimumValue = getMetricOptimumValue(metricKey, plantProfile);
    const optimumLineY =
      optimumValue !== null
        ? valueToY(optimumValue, axis.min, axis.max, innerH, CHART_PADDING.top)
        : null;

    const hasProfileAxis =
      (metricKey === 'ppm' || metricKey === 'ph') &&
      axis.toleranceMin !== undefined &&
      axis.toleranceMax !== undefined &&
      optimumValue !== null &&
      Number.isFinite(optimumValue);

    const yAxisTickValues: number[] = hasProfileAxis
      ? [axis.toleranceMax as number, optimumValue, axis.toleranceMin as number]
      : [axis.max, (axis.max + axis.min) / 2, axis.min];

    const yAxisTicks = yAxisTickValues.map((value, index, ticks) => ({
      value,
      y: valueToY(value, axis.min, axis.max, innerH, CHART_PADDING.top),
      position: index === 0 || index === ticks.length - 1 ? ('edge' as const) : ('mid' as const),
    }));

    return {
      dots,
      lineSegments,
      min: axis.min,
      max: axis.max,
      toleranceMin: axis.toleranceMin,
      toleranceMax: axis.toleranceMax,
      toleranceLines,
      optimumLineY,
      yAxisTicks,
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

  const labelHeight = r.scale(Y_AXIS_LABEL_HEIGHT);

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
          {chart.yAxisTicks.map((tick, index) => (
            <View
              key={`y-axis-${index}`}
              style={[
                styles.yAxisTick,
                {
                  top: yAxisLabelTop(tick.y, index, chart.yAxisTicks.length, labelHeight),
                  width: CHART_PADDING.left - r.scale(8),
                  height: labelHeight,
                },
              ]}
            >
              <Text
                style={[
                  styles.yAxisLabel,
                  tick.position === 'edge' ? styles.yAxisLabelEdge : styles.yAxisLabelMid,
                  {
                    fontSize: r.scale(tick.position === 'edge' ? 10 : 9),
                    lineHeight: labelHeight,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {formatMetricValue(metricKey, tick.value)}
              </Text>
            </View>
          ))}

          <Svg width={chartWidth} height={CHART_HEIGHT} pointerEvents="none">
            <Line
              x1={CHART_PADDING.left}
              y1={CHART_PADDING.top}
              x2={CHART_PADDING.left}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />

            {chart.yAxisTicks.map((tick, index) => (
              <React.Fragment key={`y-grid-${index}`}>
                <Line
                  x1={CHART_PADDING.left - 4}
                  y1={tick.y}
                  x2={CHART_PADDING.left}
                  y2={tick.y}
                  stroke={
                    tick.position === 'edge'
                      ? 'rgba(255,255,255,0.28)'
                      : 'rgba(255,255,255,0.16)'
                  }
                  strokeWidth={1}
                />
                <Line
                  x1={CHART_PADDING.left}
                  y1={tick.y}
                  x2={chartWidth - CHART_PADDING.right}
                  y2={tick.y}
                  stroke={
                    tick.position === 'edge'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.04)'
                  }
                  strokeWidth={1}
                />
              </React.Fragment>
            ))}

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

            {chart.optimumLineY !== null ? (
              <Line
                x1={CHART_PADDING.left}
                y1={chart.optimumLineY}
                x2={chartWidth - CHART_PADDING.right}
                y2={chart.optimumLineY}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={1}
              />
            ) : null}

            {chart.lineSegments.map((segment, index) => (
              <Polyline
                key={`segment-${index}`}
                points={segment.points}
                fill="none"
                stroke={
                  segment.outOfTolerance ? OUT_OF_TOLERANCE_COLOR : withAlpha(color, 0.5)
                }
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {chart.dots.map((dot) => {
              const isSelected = selectedIndex === dot.index;
              const isLast = dot.index === chart.dots.length - 1;
              const radius = isSelected ? 5.5 : isLast ? 4.5 : 3.5;
              const outOfTolerance = isValueOutOfTolerance(
                dot.value,
                chart.toleranceMin,
                chart.toleranceMax,
              );
              const dotColor = outOfTolerance ? OUT_OF_TOLERANCE_COLOR : color;

              return (
                <Circle
                  key={`dot-${dot.index}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={radius}
                  fill={
                    isSelected || isLast
                      ? dotColor
                      : withAlpha(dotColor, outOfTolerance ? 0.75 : 0.35)
                  }
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
              accessibilityLabel={
                dot.nutrientDose
                  ? metricKey === 'waterLevel'
                    ? `Water added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                    : metricKey === 'phUp'
                      ? `pH up added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                      : metricKey === 'phDown'
                        ? `pH down added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                        : `Nutrient added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                  : dot.phCorrection === 'up'
                    ? `pH up added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                    : dot.phCorrection === 'down'
                      ? `pH down added, ${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
                      : `${formatDateTime(dot.at)}, ${formatMetricValue(metricKey, dot.value)}`
              }
            />
          ))}

          {(metricKey === 'ppm' ||
            metricKey === 'waterLevel' ||
            metricKey === 'phUp' ||
            metricKey === 'phDown')
            ? chart.dots
                .filter((dot) => dot.nutrientDose)
                .map((dot) => (
                  <View
                    key={`dose-${dot.index}`}
                    style={[
                      styles.doseMarker,
                      {
                        left: dot.x - r.scale(8),
                        top: dot.y - r.scale(22),
                        width: r.scale(15),
                        height: r.scale(15),
                        borderRadius: r.scale(7.5),
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={[styles.doseMarkerText, { fontSize: r.scale(11), color }]}>
                      +
                    </Text>
                  </View>
                ))
            : null}

          {metricKey === 'ph'
            ? chart.dots
                .filter((dot) => dot.phCorrection)
                .map((dot) => (
                  <View
                    key={`ph-correction-${dot.index}`}
                    style={[
                      styles.phCorrectionMarker,
                      {
                        left: dot.x - r.scale(14),
                        top: dot.y - r.scale(22),
                        minWidth: r.scale(28),
                        height: r.scale(14),
                        borderRadius: r.scale(7),
                        paddingHorizontal: r.scale(4),
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text
                      style={[
                        styles.phCorrectionMarkerText,
                        {
                          fontSize: r.scale(8),
                          color: dot.phCorrection === 'up' ? '#A78BFA' : '#FB7185',
                        },
                      ]}
                    >
                      {dot.phCorrection === 'up' ? 'pH+' : 'pH-'}
                    </Text>
                  </View>
                ))
            : null}
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

      {pumpHistory.length > 0 ? (
        <View
          style={[
            styles.pumpHistorySection,
            {
              marginTop: r.scale(12),
              borderRadius: r.scale(12),
              padding: r.scale(12),
              gap: r.scale(8),
            },
          ]}
        >
          <View style={[styles.pumpHistoryHeader, { gap: r.scale(6), marginBottom: r.scale(2) }]}>
            <Ionicons
              name="time-outline"
              size={r.scale(14)}
              color="rgba(255,255,255,0.55)"
            />
            <Text style={[styles.pumpHistoryTitle, { fontSize: r.scale(12) }]}>History</Text>
          </View>
          {pumpHistory.map((entry) => {
            const entryColor = pumpEntryColor(entry, color);
            return (
              <View
                key={entry.id}
                style={[
                  styles.pumpHistoryRow,
                  {
                    borderRadius: r.scale(10),
                    paddingVertical: r.scale(8),
                    paddingHorizontal: r.scale(10),
                    gap: r.scale(10),
                  },
                ]}
              >
                <View
                  style={[
                    styles.pumpBadge,
                    {
                      borderColor: withAlpha(entryColor, 0.45),
                      backgroundColor: withAlpha(entryColor, 0.14),
                      minWidth: r.scale(entry.kind === 'add' ? 28 : 36),
                      height: r.scale(22),
                      borderRadius: r.scale(11),
                      paddingHorizontal: r.scale(6),
                    },
                  ]}
                >
                  <Text style={[styles.pumpBadgeText, { fontSize: r.scale(10), color: entryColor }]}>
                    {entry.label}
                  </Text>
                </View>
                <Text
                  style={[styles.pumpHistoryTime, { fontSize: r.scale(11) }]}
                  numberOfLines={1}
                >
                  {formatDateTime(entry.at)}
                </Text>
                <Text style={[styles.pumpHistoryValue, { fontSize: r.scale(11), color: entryColor }]}>
                  {formatPumpVolumeLiters(entry.volumeLiters)}
                </Text>
              </View>
            );
          })}
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
  doseMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  doseMarkerText: {
    fontWeight: '700',
    lineHeight: 12,
    marginTop: -1,
  },
  phCorrectionMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  phCorrectionMarkerText: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  yAxisTick: {
    position: 'absolute',
    left: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  yAxisLabel: {
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  yAxisLabelEdge: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  yAxisLabelMid: {
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
    letterSpacing: 0.05,
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
  pumpHistorySection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pumpHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pumpHistoryTitle: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pumpHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pumpBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pumpBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  pumpHistoryTime: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  pumpHistoryValue: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    minWidth: 52,
  },
});
