import type { Room, RoomEnvironment } from '../types/room';

export type RoomMetricKey =
  | 'temperatureC'
  | 'humidityPct'
  | 'waterLevelL'
  | 'phUpLevelL'
  | 'phDownLevelL';

export type RoomAlertIssue =
  | 'add_water'
  | 'overheated'
  | 'too_cold'
  | 'low_humidity'
  | 'high_humidity'
  | 'add_ph_up'
  | 'add_ph_down';

export type RoomMetricDisplay = {
  key: RoomMetricKey;
  label: string;
  value: string;
  critical: boolean;
};

export type GroupedRoomAlert = {
  issue: RoomAlertIssue;
  title: string;
  roomNames: string[];
};

export type RoomAlertSummary = {
  roomId: string;
  roomName: string;
  recommendations: Array<{
    issue: RoomAlertIssue;
    text: string;
  }>;
};

const THRESHOLDS = {
  temperatureC: { min: 20, max: 28 },
  humidityPct: { min: 45, max: 75 },
  waterLevelL: { min: 5 },
  phUpLevelL: { min: 0.5 },
  phDownLevelL: { min: 0.5 },
} as const;

const ALERT_ISSUE_ORDER: RoomAlertIssue[] = [
  'add_water',
  'overheated',
  'too_cold',
  'low_humidity',
  'high_humidity',
  'add_ph_up',
  'add_ph_down',
];

const ALERT_ISSUE_TITLES: Record<RoomAlertIssue, string> = {
  add_water: 'Add Water',
  overheated: 'Overheated',
  too_cold: 'Too Cold',
  low_humidity: 'Low Humidity',
  high_humidity: 'High Humidity',
  add_ph_up: 'Add pH Up',
  add_ph_down: 'Add pH Down',
};

const ALERT_ISSUE_RECOMMENDATIONS: Record<RoomAlertIssue, string> = {
  add_water: 'Refill the water tank',
  overheated: 'Lower the room temperature',
  too_cold: 'Increase room heating',
  low_humidity: 'Raise humidity levels',
  high_humidity: 'Reduce humidity or improve airflow',
  add_ph_up: 'Top up pH Up solution',
  add_ph_down: 'Top up pH Down solution',
};

function getRoomAlertIssues(environment: RoomEnvironment): RoomAlertIssue[] {
  const issues: RoomAlertIssue[] = [];

  if (environment.waterLevelL < THRESHOLDS.waterLevelL.min) {
    issues.push('add_water');
  }
  if (environment.temperatureC > THRESHOLDS.temperatureC.max) {
    issues.push('overheated');
  }
  if (environment.temperatureC < THRESHOLDS.temperatureC.min) {
    issues.push('too_cold');
  }
  if (environment.humidityPct < THRESHOLDS.humidityPct.min) {
    issues.push('low_humidity');
  }
  if (environment.humidityPct > THRESHOLDS.humidityPct.max) {
    issues.push('high_humidity');
  }
  if (environment.phUpLevelL < THRESHOLDS.phUpLevelL.min) {
    issues.push('add_ph_up');
  }
  if (environment.phDownLevelL < THRESHOLDS.phDownLevelL.min) {
    issues.push('add_ph_down');
  }

  return issues;
}

export function getRoomAlertSummaries(rooms: Room[]): RoomAlertSummary[] {
  return rooms.flatMap((room) => {
    const issues = getRoomAlertIssues(room.environment);
    if (issues.length === 0) {
      return [];
    }

    return [
      {
        roomId: room.id,
        roomName: room.name,
        recommendations: issues.map((issue) => ({
          issue,
          text: ALERT_ISSUE_RECOMMENDATIONS[issue],
        })),
      },
    ];
  });
}

export function getRoomAlertSummariesSignature(summaries: RoomAlertSummary[]): string {
  return JSON.stringify(summaries);
}

export function getGroupedRoomAlerts(rooms: Room[]): GroupedRoomAlert[] {
  const roomsByIssue = new Map<RoomAlertIssue, string[]>();

  for (const room of rooms) {
    for (const issue of getRoomAlertIssues(room.environment)) {
      const existing = roomsByIssue.get(issue) ?? [];
      existing.push(room.name);
      roomsByIssue.set(issue, existing);
    }
  }

  return ALERT_ISSUE_ORDER.filter((issue) => roomsByIssue.has(issue)).map((issue) => ({
    issue,
    title: ALERT_ISSUE_TITLES[issue],
    roomNames: roomsByIssue.get(issue) ?? [],
  }));
}

export function getGroupedRoomAlertsSignature(groups: GroupedRoomAlert[]): string {
  return JSON.stringify(
    groups.map((group) => ({
      issue: group.issue,
      roomNames: group.roomNames,
    })),
  );
}

export function isRoomMetricCritical(key: RoomMetricKey, value: number): boolean {
  switch (key) {
    case 'temperatureC':
      return value < THRESHOLDS.temperatureC.min || value > THRESHOLDS.temperatureC.max;
    case 'humidityPct':
      return value < THRESHOLDS.humidityPct.min || value > THRESHOLDS.humidityPct.max;
    case 'waterLevelL':
      return value < THRESHOLDS.waterLevelL.min;
    case 'phUpLevelL':
      return value < THRESHOLDS.phUpLevelL.min;
    case 'phDownLevelL':
      return value < THRESHOLDS.phDownLevelL.min;
  }
}

export function countRoomEnvironmentAlerts(environment: RoomEnvironment): number {
  return (
    Number(isRoomMetricCritical('temperatureC', environment.temperatureC)) +
    Number(isRoomMetricCritical('humidityPct', environment.humidityPct)) +
    Number(isRoomMetricCritical('waterLevelL', environment.waterLevelL)) +
    Number(isRoomMetricCritical('phUpLevelL', environment.phUpLevelL)) +
    Number(isRoomMetricCritical('phDownLevelL', environment.phDownLevelL))
  );
}

export function countAllRoomAlerts(rooms: Room[]): number {
  return rooms.reduce((total, room) => total + countRoomEnvironmentAlerts(room.environment), 0);
}

export function getRoomMetricDisplays(environment: RoomEnvironment): RoomMetricDisplay[] {
  return [
    {
      key: 'temperatureC',
      label: 'Temp',
      value: `${environment.temperatureC.toFixed(1)}°C`,
      critical: isRoomMetricCritical('temperatureC', environment.temperatureC),
    },
    {
      key: 'humidityPct',
      label: 'Humidity',
      value: `${environment.humidityPct}%`,
      critical: isRoomMetricCritical('humidityPct', environment.humidityPct),
    },
    {
      key: 'waterLevelL',
      label: 'Water',
      value: `${environment.waterLevelL.toFixed(1)} L`,
      critical: isRoomMetricCritical('waterLevelL', environment.waterLevelL),
    },
    {
      key: 'phUpLevelL',
      label: 'pH Up',
      value: `${environment.phUpLevelL.toFixed(1)} L`,
      critical: isRoomMetricCritical('phUpLevelL', environment.phUpLevelL),
    },
    {
      key: 'phDownLevelL',
      label: 'pH Down',
      value: `${environment.phDownLevelL.toFixed(1)} L`,
      critical: isRoomMetricCritical('phDownLevelL', environment.phDownLevelL),
    },
  ];
}
