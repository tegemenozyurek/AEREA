export type MetricKey = 'ppm' | 'ph' | 'waterLevel' | 'phDown' | 'phUp';

export type MetricPoint = {
  at: Date;
  value: number;
};

const METRIC_BOUNDS: Record<MetricKey, { min: number; max: number; step: number }> = {
  ppm: { min: 400, max: 1800, step: 35 },
  ph: { min: 4.5, max: 7.5, step: 0.08 },
  waterLevel: { min: 10, max: 100, step: 3 },
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

const HISTORY_HOURS = 48;
const HISTORY_POINTS = 8;

/** Placeholder — replace with Firestore/API time series. */
export function build48hHistory(
  metric: MetricKey,
  currentValue: number,
  machineId: string,
): MetricPoint[] {
  const bounds = METRIC_BOUNDS[metric];
  const seed = hashSeed(`${machineId}:${metric}`);
  const now = Date.now();
  const points: MetricPoint[] = [];

  let value = clamp(
    currentValue + (pseudoRandom(seed, 0) - 0.5) * bounds.step * 8,
    bounds.min,
    bounds.max,
  );

  for (let i = 0; i < HISTORY_POINTS; i += 1) {
    if (i > 0 && i < HISTORY_POINTS - 1) {
      const drift = (pseudoRandom(seed, i) - 0.5) * bounds.step * 3.5;
      value = clamp(value + drift, bounds.min, bounds.max);
    }
    if (i === HISTORY_POINTS - 1) {
      value = currentValue;
    }

    const hoursAgo = Math.round(HISTORY_HOURS * (1 - i / (HISTORY_POINTS - 1)));

    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value: roundMetric(metric, value),
    });
  }

  return points;
}

export function formatMetricValue(metric: MetricKey, value: number): string {
  if (metric === 'waterLevel') {
    return `${value}%`;
  }
  if (metric === 'ph' || metric === 'phDown' || metric === 'phUp') {
    return value.toFixed(1);
  }
  return String(value);
}
