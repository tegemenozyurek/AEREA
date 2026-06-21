import type { Machine } from './machine';

export type RoomEnvironment = {
  temperatureC: number;
  humidityPct: number;
  waterLevelL: number;
  phUpLevelL: number;
  phDownLevelL: number;
};

export type Room = {
  id: string;
  name: string;
  machines: Machine[];
  environment: RoomEnvironment;
};
