import type { Machine } from './machine';
import type { RoomColorId } from '../constants/roomColors';
import { DEFAULT_ROOM_COLOR_ID } from '../constants/roomColors';

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
  colorId: RoomColorId;
};
