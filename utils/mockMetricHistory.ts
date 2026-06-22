import type { PlantProfile } from '../types/plantProfile';

export type MetricKey = 'ppm' | 'ph' | 'waterLevel' | 'tankLevel' | 'phDown' | 'phUp';

export type HistoryHours = 12 | 24 | 48 | 72;

export const HISTORY_HOUR_OPTIONS: HistoryHours[] = [12, 24, 48, 72];

export const HISTORY_INTERVAL_HOURS = 6;

export type PhCorrection = 'up' | 'down';

export type MetricPoint = {
  at: Date;
  value: number;
  /** ppm nutrient / water refill — value rises on the next point */
  nutrientDose?: boolean;
  /** pH correction at out-of-tolerance point — value moves toward optimum after */
  phCorrection?: PhCorrection;
};

export type MetricYAxisRange = {
  min: number;
  max: number;
  fixed: boolean;
  toleranceMin?: number;
  toleranceMax?: number;
};

/** Extra Y-axis headroom around the visible data/tolerance band. */
const PROFILE_AXIS_PADDING_RATIO = 0.5;
const PPM_AXIS_PADDING_RATIO = 0.18;

const METRIC_BOUNDS: Record<MetricKey, { min: number; max: number; step: number }> = {
  ppm: { min: 0, max: 1800, step: 35 },
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

function finiteValues(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value));
}

function safeDataBounds(
  values: number[],
  fallbackMin: number,
  fallbackMax: number,
): { min: number; max: number } {
  const finite = finiteValues(values);
  if (finite.length === 0) {
    return { min: fallbackMin, max: fallbackMax };
  }

  return {
    min: Math.min(...finite),
    max: Math.max(...finite),
  };
}

function ensureAxisRange(
  min: number,
  max: number,
  floor = Number.NEGATIVE_INFINITY,
): { min: number; max: number } {
  let safeMin = Number.isFinite(min) ? min : 0;
  let safeMax = Number.isFinite(max) ? max : safeMin + 1;

  if (safeMax <= safeMin) {
    safeMax = safeMin + 1;
  }

  if (Number.isFinite(floor)) {
    safeMin = Math.max(floor, safeMin);
    if (safeMax <= safeMin) {
      safeMax = safeMin + 1;
    }
  }

  return { min: safeMin, max: safeMax };
}

function sanitizeProfileNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
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

/** Machines whose pH history mock crosses plant profile tolerance. */
const MOCK_PH_LOW_MACHINES = new Set(['r2-machine-2', 'r1-machine-2']);
const MOCK_PH_HIGH_MACHINES = new Set(['r3-machine-1']);

function pickTimelineEventIndices(pointCount: number, hours: HistoryHours, seed: number): number[] {
  if (pointCount < 5) return [];

  const eventCount = hours <= 12 ? 1 : hours <= 48 ? 2 : 3;
  const minIndex = 2;
  const maxIndex = pointCount - 3;
  const span = maxIndex - minIndex;
  const indices: number[] = [];

  for (let event = 0; event < eventCount; event += 1) {
    const slot = (event + 1) / (eventCount + 1);
    const jitter = (pseudoRandom(seed, 30 + event) - 0.5) * Math.min(2, span * 0.12);
    const index = Math.round(minIndex + span * slot + jitter);
    const clamped = clamp(index, minIndex, maxIndex);
    const last = indices[indices.length - 1];
    if (!indices.includes(clamped) && (last === undefined || clamped - last >= 4)) {
      indices.push(clamped);
    }
  }

  return indices.sort((a, b) => a - b);
}

export function getMetricToleranceBounds(
  metric: MetricKey,
  profile: PlantProfile | null,
): { min: number; max: number } | null {
  if (!profile) return null;
  if (metric === 'ppm') {
    return {
      min: profile.optimumPPM - profile.PPM_tolerance,
      max: profile.optimumPPM + profile.PPM_tolerance,
    };
  }
  if (metric === 'ph') {
    return {
      min: profile.optimum_pH - profile.pH_tolerance,
      max: profile.optimum_pH + profile.pH_tolerance,
    };
  }
  return null;
}

export type ChartLineSegment = {
  points: string;
  outOfTolerance: boolean;
};

type ChartSegmentPoint = {
  x: number;
  y: number;
  value: number;
};

function isOutOfTolerance(value: number, toleranceMin: number, toleranceMax: number): boolean {
  return value < toleranceMin || value > toleranceMax;
}

function interpolateSegmentPoint(
  start: ChartSegmentPoint,
  end: ChartSegmentPoint,
  value: number,
): ChartSegmentPoint {
  const range = end.value - start.value;
  const t = range === 0 ? 0 : (value - start.value) / range;
  return {
    value,
    x: start.x + t * (end.x - start.x),
    y: start.y + t * (end.y - start.y),
  };
}

function splitChartSegment(
  start: ChartSegmentPoint,
  end: ChartSegmentPoint,
  toleranceMin: number,
  toleranceMax: number,
  valueToY: (value: number) => number,
): Array<{ start: ChartSegmentPoint; end: ChartSegmentPoint; outOfTolerance: boolean }> {
  const valueStart = start.value;
  const valueEnd = end.value;

  if (valueStart === valueEnd) {
    return [
      {
        start,
        end,
        outOfTolerance: isOutOfTolerance(valueStart, toleranceMin, toleranceMax),
      },
    ];
  }

  const boundaries: number[] = [];
  const lo = Math.min(valueStart, valueEnd);
  const hi = Math.max(valueStart, valueEnd);
  if (toleranceMin > lo && toleranceMin < hi) boundaries.push(toleranceMin);
  if (toleranceMax > lo && toleranceMax < hi) boundaries.push(toleranceMax);
  boundaries.sort((a, b) => (valueStart < valueEnd ? a - b : b - a));

  const values = [valueStart, ...boundaries, valueEnd];
  const parts: Array<{ start: ChartSegmentPoint; end: ChartSegmentPoint; outOfTolerance: boolean }> =
    [];

  for (let i = 0; i < values.length - 1; i += 1) {
    const segmentStartValue = values[i];
    const segmentEndValue = values[i + 1];
    const segmentStart =
      i === 0 ? start : interpolateSegmentPoint(start, end, segmentStartValue);
    const segmentEnd =
      i === values.length - 2 ? end : interpolateSegmentPoint(start, end, segmentEndValue);
    segmentStart.y = valueToY(segmentStartValue);
    segmentEnd.y = valueToY(segmentEndValue);

    parts.push({
      start: segmentStart,
      end: segmentEnd,
      outOfTolerance: isOutOfTolerance(
        (segmentStartValue + segmentEndValue) / 2,
        toleranceMin,
        toleranceMax,
      ),
    });
  }

  return parts;
}

export function buildChartLineSegments(
  dots: ChartSegmentPoint[],
  toleranceMin: number | undefined,
  toleranceMax: number | undefined,
  valueToY: (value: number) => number,
): ChartLineSegment[] {
  if (dots.length < 2) return [];

  const hasFiniteTolerance =
    toleranceMin !== undefined &&
    toleranceMax !== undefined &&
    Number.isFinite(toleranceMin) &&
    Number.isFinite(toleranceMax);

  if (!hasFiniteTolerance) {
    const points = dots
      .filter((dot) => Number.isFinite(dot.x) && Number.isFinite(dot.y))
      .map((dot) => `${dot.x},${dot.y}`)
      .join(' ');

    if (!points) return [];

    return [
      {
        points,
        outOfTolerance: false,
      },
    ];
  }

  const merged: ChartLineSegment[] = [];

  for (let i = 0; i < dots.length - 1; i += 1) {
    const parts = splitChartSegment(
      dots[i],
      dots[i + 1],
      toleranceMin,
      toleranceMax,
      valueToY,
    );

    for (const part of parts) {
      if (
        !Number.isFinite(part.start.x) ||
        !Number.isFinite(part.start.y) ||
        !Number.isFinite(part.end.x) ||
        !Number.isFinite(part.end.y)
      ) {
        continue;
      }

      const pointPair = `${part.start.x},${part.start.y} ${part.end.x},${part.end.y}`;
      const last = merged[merged.length - 1];

      if (last && last.outOfTolerance === part.outOfTolerance) {
        last.points = `${last.points} ${part.end.x},${part.end.y}`;
      } else {
        merged.push({
          points: pointPair,
          outOfTolerance: part.outOfTolerance,
        });
      }
    }
  }

  return merged;
}

function buildPpmMetricHistory(
  currentValue: number,
  machineId: string,
  hours: HistoryHours,
  plantProfile: PlantProfile | null = null,
): MetricPoint[] {
  const safeCurrent = sanitizeProfileNumber(currentValue, 800);
  const optimum = plantProfile
    ? sanitizeProfileNumber(plantProfile.optimumPPM, 800)
    : safeCurrent;
  const tolerance = plantProfile
    ? sanitizeProfileNumber(plantProfile.PPM_tolerance, 150)
    : Math.max(80, optimum * 0.15);
  const tolMin = optimum - tolerance;
  const tolMax = optimum + tolerance;

  const seed = hashSeed(`${machineId}:ppm:${hours}`);
  const now = Date.now();
  const pointCount = historyPointCount(hours);
  const doseIndices = pickTimelineEventIndices(pointCount, hours, seed);
  const decayPerStep = 18 + pseudoRandom(seed, 10) * 14;
  const doseBoost = tolerance * (0.75 + pseudoRandom(seed, 11) * 0.5);
  const undershoot = tolerance * (0.18 + pseudoRandom(seed, 12) * 0.15);

  const startValue = clamp(
    optimum + tolerance * (0.1 + pseudoRandom(seed, 0) * 0.2),
    tolMin,
    tolMax,
  );

  const values: number[] = [];
  const points: MetricPoint[] = [];

  for (let i = 0; i < pointCount; i += 1) {
    const noise = (pseudoRandom(seed, i + 1) - 0.5) * 12;
    let value: number;

    if (i === 0) {
      value = startValue;
    } else if (doseIndices.includes(i)) {
      value = Math.min(values[i - 1] - decayPerStep * 1.35, tolMin - undershoot) + noise * 0.4;
    } else if (doseIndices.includes(i - 1)) {
      const towardOptimum = (optimum - values[i - 1]) * 0.4;
      value = values[i - 1] + doseBoost + towardOptimum + noise;
      value = Math.min(value, tolMax - tolerance * 0.08);
    } else {
      const nextDose = doseIndices.find((index) => index > i);
      value = values[i - 1] - decayPerStep + noise;
      if (nextDose !== undefined && nextDose - i <= 2) {
        value -= decayPerStep * 0.65;
      }
    }

    if (i === pointCount - 1) {
      value = safeCurrent;
    }

    value = clamp(roundMetric('ppm', value), 0, METRIC_BOUNDS.ppm.max);
    values.push(value);

    const hoursAgo =
      pointCount <= 1 ? 0 : Math.round(hours * (1 - i / (pointCount - 1)));
    const isBelowTolerance = value < tolMin;

    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value,
      nutrientDose: doseIndices.includes(i) && isBelowTolerance,
    });
  }

  return points;
}

function resolvePhCorrectionType(
  machineId: string,
  eventIndex: number,
  seed: number,
): PhCorrection {
  if (MOCK_PH_LOW_MACHINES.has(machineId)) return 'up';
  if (MOCK_PH_HIGH_MACHINES.has(machineId)) return 'down';
  return pseudoRandom(seed, 40 + eventIndex) > 0.5 ? 'up' : 'down';
}

function buildPhMetricHistory(
  currentValue: number,
  machineId: string,
  hours: HistoryHours,
  profile: PlantProfile,
): MetricPoint[] {
  const optimum = sanitizeProfileNumber(profile.optimum_pH, 6);
  const tolerance = sanitizeProfileNumber(profile.pH_tolerance, 0.5);
  const tolMin = optimum - tolerance;
  const tolMax = optimum + tolerance;
  const safeCurrent = sanitizeProfileNumber(currentValue, optimum);
  const seed = hashSeed(`${machineId}:ph:${hours}`);
  const now = Date.now();
  const pointCount = historyPointCount(hours);
  const correctionIndices = pickTimelineEventIndices(pointCount, hours, seed);
  const correctionTypes = new Map(
    correctionIndices.map((index) => [index, resolvePhCorrectionType(machineId, index, seed)]),
  );

  const driftStep = 0.055 + pseudoRandom(seed, 10) * 0.045;
  const correctionBoost = tolerance * (0.45 + pseudoRandom(seed, 11) * 0.3);
  const overshoot = tolerance * (0.32 + pseudoRandom(seed, 12) * 0.22);
  const interventionMargin = tolerance * (0.1 + pseudoRandom(seed, 13) * 0.06);
  const minResponseDelta = tolerance * 0.14;

  const values: number[] = [];
  const points: MetricPoint[] = [];

  const markPhCorrection = (value: number, type: PhCorrection): PhCorrection | undefined => {
    if (type === 'up' && value < tolMin - interventionMargin) return 'up';
    if (type === 'down' && value > tolMax + interventionMargin) return 'down';
    return undefined;
  };

  const lastCorrectionBefore = (index: number): number | undefined =>
    correctionIndices.filter((correctionIndex) => correctionIndex < index).pop();

  for (let i = 0; i < pointCount; i += 1) {
    const noise = (pseudoRandom(seed, i + 1) - 0.5) * 0.04;
    let value: number;
    let phCorrection: PhCorrection | undefined;
    const prevCorrection = lastCorrectionBefore(i);
    const stepsSinceCorrection =
      prevCorrection !== undefined ? i - prevCorrection : Number.POSITIVE_INFINITY;

    if (i === 0) {
      value = optimum + (pseudoRandom(seed, 0) - 0.5) * tolerance * 0.2;
    } else if (correctionIndices.includes(i - 1)) {
      const type = correctionTypes.get(i - 1) ?? 'up';
      const prev = values[i - 1];
      if (type === 'up') {
        value = prev + correctionBoost + minResponseDelta + noise;
      } else {
        value = prev - correctionBoost - minResponseDelta + noise;
      }
    } else if (
      correctionIndices.includes(i) &&
      stepsSinceCorrection > 2 &&
      !correctionIndices.includes(i - 1)
    ) {
      const type = correctionTypes.get(i) ?? 'up';
      if (type === 'up') {
        value = Math.min(values[i - 1] - driftStep * 1.5, tolMin - overshoot) + noise * 0.2;
      } else {
        value = Math.max(values[i - 1] + driftStep * 1.5, tolMax + overshoot) + noise * 0.2;
      }
      phCorrection = markPhCorrection(value, type);
    } else if (prevCorrection !== undefined && stepsSinceCorrection <= 3) {
      const type = correctionTypes.get(prevCorrection) ?? 'up';
      const towardOptimum = (optimum - values[i - 1]) * 0.28;
      value = values[i - 1] + towardOptimum + noise;
      if (type === 'down') {
        value = Math.min(value, values[i - 1] - minResponseDelta * 0.15);
      } else {
        value = Math.max(value, values[i - 1] + minResponseDelta * 0.15);
      }
    } else {
      const nextCorrection = correctionIndices.find((index) => index > i);
      value = values[i - 1] + (optimum - values[i - 1]) * 0.12 + noise;

      if (nextCorrection !== undefined && nextCorrection - i <= 2) {
        const type = correctionTypes.get(nextCorrection) ?? 'up';
        value += type === 'up' ? -driftStep * 0.85 : driftStep * 0.85;
      }
    }

    if (i === pointCount - 1) {
      value = safeCurrent;
      phCorrection = undefined;
    }

    value = clamp(roundMetric('ph', value), METRIC_BOUNDS.ph.min, METRIC_BOUNDS.ph.max);

    if (correctionIndices.includes(i - 1)) {
      const type = correctionTypes.get(i - 1) ?? 'up';
      const prev = values[i - 1];
      if (type === 'up') {
        value = Math.max(value, roundMetric('ph', prev + minResponseDelta * 0.5));
      } else {
        value = Math.min(value, roundMetric('ph', prev - minResponseDelta * 0.5));
      }
    }

    values.push(value);

    const hoursAgo =
      pointCount <= 1 ? 0 : Math.round(hours * (1 - i / (pointCount - 1)));
    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value,
      phCorrection,
    });
  }

  return points;
}

function buildWaterMetricHistory(
  currentValue: number,
  machineId: string,
  hours: HistoryHours,
): MetricPoint[] {
  const safeCurrent = sanitizeProfileNumber(currentValue, 50);
  const seed = hashSeed(`${machineId}:water:${hours}`);
  const now = Date.now();
  const pointCount = historyPointCount(hours);
  const refillIndices = pickTimelineEventIndices(pointCount, hours, seed);
  const decayPerStep = 2.6 + pseudoRandom(seed, 10) * 2.4;
  const refillBoost = 13 + pseudoRandom(seed, 11) * 11;
  const lowMargin = 4 + pseudoRandom(seed, 12) * 4;
  const lowThreshold = Math.max(8, safeCurrent * 0.34);

  const startValue = clamp(
    safeCurrent + decayPerStep * (pointCount - 1) * 0.58 + refillIndices.length * refillBoost * 0.3,
    safeCurrent + 4,
    100,
  );

  const values: number[] = [];
  const points: MetricPoint[] = [];

  for (let i = 0; i < pointCount; i += 1) {
    const noise = (pseudoRandom(seed, i + 1) - 0.5) * 1.8;
    let value: number;

    if (i === 0) {
      value = startValue;
    } else if (refillIndices.includes(i)) {
      value = Math.min(values[i - 1] - decayPerStep * 1.35, lowThreshold - lowMargin) + noise * 0.35;
    } else if (refillIndices.includes(i - 1)) {
      value = Math.min(values[i - 1] + refillBoost + noise, 100);
    } else {
      const nextRefill = refillIndices.find((index) => index > i);
      value = values[i - 1] - decayPerStep + noise;
      if (nextRefill !== undefined && nextRefill - i <= 2) {
        value -= decayPerStep * 0.55;
      }
    }

    if (i === pointCount - 1) {
      value = safeCurrent;
    }

    value = clamp(roundMetric('waterLevel', value), 0, 100);
    if (i > 0 && !refillIndices.includes(i - 1)) {
      value = Math.min(value, values[i - 1]);
    }
    values.push(value);

    const hoursAgo =
      pointCount <= 1 ? 0 : Math.round(hours * (1 - i / (pointCount - 1)));

    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value,
      nutrientDose: refillIndices.includes(i) && value <= lowThreshold,
    });
  }

  return points;
}

function buildMonotonicDecayHistory(
  metric: 'phDown' | 'phUp' | 'tankLevel',
  currentValue: number,
  machineId: string,
  hours: HistoryHours,
): MetricPoint[] {
  const safeCurrent = sanitizeProfileNumber(currentValue, 0);
  const bounds = METRIC_BOUNDS[metric];
  const seed = hashSeed(`${machineId}:${metric}:${hours}`);
  const now = Date.now();
  const pointCount = historyPointCount(hours);
  const decayPerStep =
    metric === 'tankLevel'
      ? 2.2 + pseudoRandom(seed, 10) * 1.8
      : 0.2 + pseudoRandom(seed, 10) * 0.16;

  const startValue = clamp(
    safeCurrent + decayPerStep * (pointCount - 1) * (0.68 + pseudoRandom(seed, 11) * 0.22),
    safeCurrent + (metric === 'tankLevel' ? 3 : safeCurrent < bounds.max ? 0.35 : 0),
    bounds.max,
  );

  const values: number[] = [];
  const points: MetricPoint[] = [];

  for (let i = 0; i < pointCount; i += 1) {
    const noise =
      metric === 'tankLevel'
        ? (pseudoRandom(seed, i + 1) - 0.65) * 0.8
        : (pseudoRandom(seed, i + 1) - 0.65) * 0.07;
    let value: number;

    if (i === 0) {
      value = startValue;
    } else if (i === pointCount - 1) {
      value = safeCurrent;
    } else {
      value = values[i - 1] - decayPerStep + noise;
    }

    value = clamp(roundMetric(metric, value), 0, bounds.max);
    if (i > 0 && i < pointCount - 1) {
      value = Math.min(value, values[i - 1]);
      value = Math.max(value, safeCurrent);
    }

    values.push(value);

    const hoursAgo =
      pointCount <= 1 ? 0 : Math.round(hours * (1 - i / (pointCount - 1)));

    points.push({
      at: new Date(now - hoursAgo * 60 * 60 * 1000),
      value,
    });
  }

  return points;
}

/** Placeholder — replace with Firestore/API time series. */
export function buildMetricHistory(
  metric: MetricKey,
  currentValue: number,
  machineId: string,
  hours: HistoryHours = 48,
  plantProfile: PlantProfile | null = null,
): MetricPoint[] {
  if (metric === 'ppm') {
    return buildPpmMetricHistory(currentValue, machineId, hours, plantProfile);
  }

  if (metric === 'ph' && plantProfile) {
    return buildPhMetricHistory(currentValue, machineId, hours, plantProfile);
  }

  if (metric === 'waterLevel') {
    return buildWaterMetricHistory(currentValue, machineId, hours);
  }

  if (metric === 'phDown' || metric === 'phUp' || metric === 'tankLevel') {
    return buildMonotonicDecayHistory(metric, currentValue, machineId, hours);
  }

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

    const hoursAgo =
      pointCount <= 1 ? 0 : Math.round(hours * (1 - i / (pointCount - 1)));

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
  const { min: dataMin, max: dataMax } = safeDataBounds(
    values,
    metric === 'ppm' ? 0 : metric === 'ph' ? 5 : 0,
    metric === 'ppm' ? 1000 : metric === 'ph' ? 7 : 100,
  );

  if (profile && metric === 'ppm') {
    const optimumPPM = sanitizeProfileNumber(profile.optimumPPM, 800);
    const ppmTolerance = sanitizeProfileNumber(profile.PPM_tolerance, 150);
    const toleranceMin = optimumPPM - ppmTolerance;
    const toleranceMax = optimumPPM + ppmTolerance;
    const bandMin = Math.min(toleranceMin, dataMin);
    const bandMax = Math.max(toleranceMax, dataMax);
    const band = Math.max(bandMax - bandMin, 1);
    const padding = band * PPM_AXIS_PADDING_RATIO;
    const axis = ensureAxisRange(bandMin - padding, bandMax + padding, 0);

    return {
      min: axis.min,
      max: axis.max,
      fixed: true,
      toleranceMin,
      toleranceMax,
    };
  }

  if (profile && metric === 'ph') {
    const optimumPh = sanitizeProfileNumber(profile.optimum_pH, 6);
    const phTolerance = sanitizeProfileNumber(profile.pH_tolerance, 0.5);
    const toleranceMin = optimumPh - phTolerance;
    const toleranceMax = optimumPh + phTolerance;
    const bandMin = Math.min(toleranceMin, dataMin);
    const bandMax = Math.max(toleranceMax, dataMax);
    const band = Math.max(bandMax - bandMin, 1);
    const padding = band * PROFILE_AXIS_PADDING_RATIO;
    const axis = ensureAxisRange(bandMin - padding, bandMax + padding);

    return {
      min: axis.min,
      max: axis.max,
      fixed: true,
      toleranceMin,
      toleranceMax,
    };
  }

  const range = Math.max(dataMax - dataMin, 1);
  const padding = range * 0.12;

  if (metric === 'ppm') {
    const axis = ensureAxisRange(dataMin - padding, dataMax + padding, 0);
    return {
      min: axis.min,
      max: axis.max,
      fixed: false,
    };
  }

  if (metric === 'waterLevel' || metric === 'tankLevel') {
    const axis = ensureAxisRange(dataMin - padding, dataMax + padding, 0);
    return {
      min: 0,
      max: Math.min(100, axis.max),
      fixed: false,
    };
  }

  if (metric === 'phDown' || metric === 'phUp') {
    const axis = ensureAxisRange(dataMin - padding, dataMax + padding, 0);
    return {
      min: 0,
      max: axis.max,
      fixed: false,
    };
  }

  const axis = ensureAxisRange(dataMin - padding, dataMax + padding);
  return {
    min: axis.min,
    max: axis.max,
    fixed: false,
  };
}

export function getMetricOptimumValue(
  metric: MetricKey,
  profile: PlantProfile | null,
): number | null {
  if (!profile) return null;
  if (metric === 'ppm') {
    const value = profile.optimumPPM;
    return Number.isFinite(value) ? value : null;
  }
  if (metric === 'ph') {
    const value = profile.optimum_pH;
    return Number.isFinite(value) ? value : null;
  }
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
