import type { Machine } from '../types/machine';
import type { Room, RoomEnvironment } from '../types/room';
import { DEFAULT_ROOM_COLOR_ID, type RoomColorId } from '../constants/roomColors';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function jitter(value: number, range: number): number {
  return value + (Math.random() - 0.5) * range * 2;
}

/** Simulates fetching fresh sensor readings while keeping local room layout. */
export function createDefaultRoomEnvironment(): RoomEnvironment {
  return {
    temperatureC: 24,
    humidityPct: 60,
    waterLevelL: 10,
    phUpLevelL: 2,
    phDownLevelL: 2,
  };
}

function refreshRoomEnvironment(env: RoomEnvironment): RoomEnvironment {
  return {
    temperatureC: round(clamp(jitter(env.temperatureC, 0.4), 18, 32), 1),
    humidityPct: Math.round(clamp(jitter(env.humidityPct, 2), 35, 85)),
    waterLevelL: round(clamp(jitter(env.waterLevelL, 0.8), 0, 50), 1),
    phUpLevelL: round(clamp(jitter(env.phUpLevelL, 0.3), 0, 10), 1),
    phDownLevelL: round(clamp(jitter(env.phDownLevelL, 0.3), 0, 10), 1),
  };
}

function refreshMachineMetrics(machine: Machine, base: Machine): Machine {
  return {
    ...machine,
    ppm: Math.round(clamp(jitter(base.ppm, 40), 400, 1600)),
    ph: round(clamp(jitter(base.ph, 0.15), 5.0, 7.0), 1),
    phDown: base.phDown,
    phUp: base.phUp,
    waterLevel: Math.round(clamp(jitter(base.waterLevel, 4), 0, 100)),
    tankLevel: Math.round(clamp(jitter(base.tankLevel ?? base.waterLevel, 4), 0, 100)),
    online: Math.random() > 0.08 ? base.online : !base.online,
    updatedAt: new Date().toISOString(),
  };
}

export function refreshSingleRoom(room: Room): Room {
  const mockRoom = MOCK_ROOMS.find((entry) => entry.id === room.id);
  const mockById = new Map<string, Machine>();
  MOCK_ROOMS.forEach((entry) => {
    entry.machines.forEach((machine) => mockById.set(machine.id, machine));
  });

  return {
    ...room,
    environment: refreshRoomEnvironment(mockRoom?.environment ?? room.environment),
    machines: room.machines.map((machine) =>
      refreshMachineMetrics(machine, mockById.get(machine.id) ?? machine),
    ),
  };
}

/** Simulates fetching fresh sensor readings while keeping local room layout. */
export function refreshRoomMetrics(rooms: Room[]): Room[] {
  const mockById = new Map<string, Machine>();
  const mockEnvByRoomId = new Map<string, RoomEnvironment>();
  MOCK_ROOMS.forEach((room) => {
    mockEnvByRoomId.set(room.id, room.environment);
    room.machines.forEach((machine) => mockById.set(machine.id, machine));
  });

  return rooms.map((room) => ({
    ...room,
    environment: refreshRoomEnvironment(
      mockEnvByRoomId.get(room.id) ?? room.environment ?? createDefaultRoomEnvironment(),
    ),
    machines: room.machines.map((machine) => {
      const base = mockById.get(machine.id) ?? machine;
      return refreshMachineMetrics(machine, base);
    }),
  }));
}

export function createDefaultRoom(name: string, colorId: RoomColorId = DEFAULT_ROOM_COLOR_ID): Room {
  return {
    id: `room-${Date.now()}`,
    name,
    machines: [],
    environment: createDefaultRoomEnvironment(),
    colorId,
  };
}

export const DEFAULT_ROOM_ID = 'room-default';
export const DEFAULT_ROOM_NAME = 'Default Room';

export function isDefaultRoom(roomId: string): boolean {
  return roomId === DEFAULT_ROOM_ID;
}

export function createDefaultMachine(
  roomId: string,
  name: string,
  pair?: { deviceId: string; model: string; plantProfileId?: string },
): Machine {
  return {
    id: pair ? `aerea-${pair.deviceId}` : `${roomId}-machine-${Date.now()}`,
    name,
    model: pair?.model ?? 'AEREA1',
    deviceId: pair?.deviceId ?? String(Math.floor(10000 + Math.random() * 90000)),
    plantProfileId: pair?.plantProfileId,
    online: !!pair,
    ppm: 800,
    ph: 6.0,
    phDown: 0,
    phUp: 0,
    waterLevel: 50,
    tankLevel: 50,
    updatedAt: new Date().toISOString(),
  };
}

export type NearbyMachine = {
  id: string;
  model: string;
  label: string;
};

export const MOCK_NEARBY_MACHINES: NearbyMachine[] = [
  { id: '34932', model: 'AEREA1', label: 'AEREA1 - #34932' },
  { id: '94857', model: 'AEREA2 mini', label: 'AEREA2 mini - #94857' },
];

/** Simulates scanning for nearby unpaired AEREA devices. */
export async function fetchNearbyMachines(): Promise<NearbyMachine[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_NEARBY_MACHINES;
}

/** Firestore `plantProfiles` document ids — keep in sync with seeded collection. */
export const PLANT_PROFILE_IDS = {
  lettuce: 'lettuce',
  basil: 'basil',
  strawberry: 'strawberry',
  mint: 'mint',
  cherryTomato: 'cherry-tomato',
} as const;

/** Placeholder data — replace with Firestore/API fetch in MachinesScreen. */
export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Room #1',
    colorId: 'slate',
    environment: {
      temperatureC: 31.2,
      humidityPct: 58,
      waterLevelL: 2.8,
      phUpLevelL: 2.4,
      phDownLevelL: 1.6,
    },
    machines: [
      {
        id: 'r1-machine-1',
        name: 'Machine #1 - Cherry Tomato 🍅',
        model: 'AEREA1',
        deviceId: '12487',
        plantProfileId: PLANT_PROFILE_IDS.cherryTomato,
        online: true,
        ppm: 1580,
        ph: 6.3,
        phDown: 0,
        phUp: 0,
        waterLevel: 80,
        tankLevel: 65,
        updatedAt: '2026-06-19T14:32:18.000Z',
      },
      {
        id: 'r1-machine-2',
        name: 'Machine #2 - Strawberry 🍓',
        model: 'AEREA2 mini',
        deviceId: '39281',
        plantProfileId: PLANT_PROFILE_IDS.strawberry,
        online: false,
        ppm: 980,
        ph: 5.8,
        phDown: 2,
        phUp: 0,
        waterLevel: 45,
        tankLevel: 38,
        updatedAt: '2026-06-19T11:05:42.000Z',
      },
      {
        id: 'r1-machine-3',
        name: 'Machine #3 - Basil 🌿',
        model: 'AEREA1',
        deviceId: '98732',
        plantProfileId: PLANT_PROFILE_IDS.basil,
        online: true,
        ppm: 900,
        ph: 6.2,
        phDown: 0,
        phUp: 1,
        waterLevel: 92,
        tankLevel: 78,
        updatedAt: '2026-06-19T16:48:03.000Z',
      },
    ],
  },
  {
    id: 'room-2',
    name: 'Room #2',
    colorId: 'sky',
    environment: {
      temperatureC: 23.6,
      humidityPct: 42,
      waterLevelL: 14.2,
      phUpLevelL: 0.3,
      phDownLevelL: 0.2,
    },
    machines: [
      {
        id: 'r2-machine-1',
        name: 'Machine #1 - Lettuce 🥬',
        model: 'AEREA1',
        deviceId: '45621',
        plantProfileId: PLANT_PROFILE_IDS.lettuce,
        online: true,
        ppm: 700,
        ph: 6.0,
        phDown: 0,
        phUp: 0,
        waterLevel: 74,
        tankLevel: 61,
        updatedAt: '2026-06-19T10:40:55.000Z',
      },
      {
        id: 'r2-machine-2',
        name: 'Machine #2 - Mint 🍃',
        model: 'AEREA2 mini',
        deviceId: '77309',
        plantProfileId: PLANT_PROFILE_IDS.mint,
        online: false,
        ppm: 640,
        ph: 5.9,
        phDown: 3,
        phUp: 0,
        waterLevel: 38,
        tankLevel: 29,
        updatedAt: '2026-06-18T22:18:07.000Z',
      },
    ],
  },
  {
    id: 'room-3',
    name: 'Room #3',
    colorId: 'lavender',
    environment: {
      temperatureC: 25.1,
      humidityPct: 55,
      waterLevelL: 11.0,
      phUpLevelL: 3.0,
      phDownLevelL: 0.9,
    },
    machines: [
      {
        id: 'r3-machine-1',
        name: 'Machine #1 - Basil 🌿',
        model: 'AEREA1',
        deviceId: '58194',
        plantProfileId: PLANT_PROFILE_IDS.basil,
        online: true,
        ppm: 880,
        ph: 6.2,
        phDown: 0,
        phUp: 1,
        waterLevel: 81,
        tankLevel: 68,
        updatedAt: '2026-06-19T08:05:20.000Z',
      },
    ],
  },
  {
    id: 'room-default',
    name: 'Default Room',
    colorId: 'slate',
    environment: createDefaultRoomEnvironment(),
    machines: [],
  },
];
