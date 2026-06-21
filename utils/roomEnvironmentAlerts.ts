import type { Room, RoomEnvironment } from '../types/room';

export type RoomMetricKey =
  | 'temperatureC'
  | 'humidityPct'
  | 'waterLevelL'
  | 'phUpLevelL'
  | 'phDownLevelL';

export type RoomMetricDisplay = {
  key: RoomMetricKey;
  label: string;
  value: string;
  critical: boolean;
};

const THRESHOLDS = {
  temperatureC: { min: 20, max: 28 },
  humidityPct: { min: 45, max: 75 },
  waterLevelL: { min: 5 },
  phUpLevelL: { min: 0.5 },
  phDownLevelL: { min: 0.5 },
} as const;

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
