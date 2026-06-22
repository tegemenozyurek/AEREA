import type { PlantProfile } from '../types/plantProfile';

export type MetricKey = 'ppm' | 'ph' | 'waterLevel' | 'tankLevel' | 'phDown' | 'phUp';

export type HistoryHours = 12 | 24 | 48 | 72;

export const HISTORY_HOUR_OPTIONS: HistoryHours[] = [12, 24, 48, 72];

export const HISTORY_INTERVAL_HOURS = 6;

export type MetricPoint = {
  at: Date;
  value: number;
};

export type MetricYAxisRange = {
  min: number;
  max: number;
  fixed: boolean;
};

const METRIC_BOUNDS: Record<MetricKey, { min: number; max: number; step: number }> = {
  ppm: { min: 400, max: 1800, step: 35 },
  ph: { min: 4.5, max: 7.5, step: 0.08 },
  waterLevel: { min: 10, max: 100, step: 3 },
  tankLevel: { min: 10, max: 100, step: 3 },
  phDown: { min: 0, max: 10, step: 0.4 },
  phUp: { min: 0, max: 10, step: 0.4 },
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pseudoRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundMetric(metric: MetricKey, value: number): number {
  if (metric === 'ph' || metric === 'phDown' || metric === 'phUp') {
    return Math.round(value * 10) / 10;
  }
  return Math.round(value);
}

function historyPointCount(hours: HistoryHours): number {
  return Math.floor(hours / HISTORY_INTERVAL_HOURS) + 1;
}

/** Placeholder — replace with Firestore/API time series. */
export function buildMetricHistory(
  metric: MetricKey,
  currentValue: number,
  machineId: string,
  hours: HistoryHours = 48,
): MetricPoint[] {
  const bounds = METRIC_BOUNDS[metric];
  const seed = hashSeed(`${machineId}:${metric}:${hours}`);
  const now = Date.now();
  const pointCount = historyPointCount(hours);
  const points: MetricPoint[] = [];

  let value = clamp(
    currentValue + (pseudoRandom(seed, 0) - 0.5) * bounds.step * 8,
    bounds.min,
    bounds.max,
  );

  for (let i = 0; i < pointCount; i += 1) {
    if (i > 0 && i < pointCount - 1) {
      const drift = (pseudoRandom(seed, i) - 0.5) * bounds.step * 3.5;
      value = clamp(value + drift, bounds.min, bounds.max);
    }
    if (i === pointCount - 1) {
      value = currentValue;
    }

    const hoursAgo = Math.round(hours * (1 - i / (pointCount - 1)));

    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value: roundMetric(metric, value),
    });
  }

  return points;
}

/** @deprecated Use buildMetricHistory */
export function build48hHistory(
  metric: MetricKey,
  currentValue: number,
  machineId: string,
): MetricPoint[] {
  return buildMetricHistory(metric, currentValue, machineId, 48);
}

export function getMetricYAxisRange(
  metric: MetricKey,
  values: number[],
  profile: PlantProfile | null,
): MetricYAxisRange {
  if (profile && metric === 'ppm') {
    return {
      min: profile.optimumPPM - profile.PPM_tolerance,
      max: profile.optimumPPM + profile.PPM_tolerance,
      fixed: true,
    };
  }

  if (profile && metric === 'ph') {
    return {
      min: profile.optimum_pH - profile.pH_tolerance,
      max: profile.optimum_pH + profile.pH_tolerance,
      fixed: true,
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = range * 0.12;

  return {
    min: min - padding,
    max: max + padding,
    fixed: false,
  };
}

export function getMetricOptimumValue(
  metric: MetricKey,
  profile: PlantProfile | null,
): number | null {
  if (!profile) return null;
  if (metric === 'ppm') return profile.optimumPPM;
  if (metric === 'ph') return profile.optimum_pH;
  return null;
}

export function formatHistoryRangeLabel(hours: HistoryHours): string {
  return `Last ${hours}h`;
}

export function formatMetricValue(metric: MetricKey, value: number): string {
  if (metric === 'waterLevel' || metric === 'tankLevel') {
    return `${value}%`;
  }
  if (metric === 'ph' || metric === 'phDown' || metric === 'phUp') {
    return value.toFixed(1);
  }
  return String(Math.round(value));
}
