import type { Machine } from '../types/machine';
import type { Room } from '../types/room';

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
export function refreshRoomMetrics(rooms: Room[]): Room[] {
  const mockById = new Map<string, Machine>();
  MOCK_ROOMS.forEach((room) => {
    room.machines.forEach((machine) => mockById.set(machine.id, machine));
  });

  return rooms.map((room) => ({
    ...room,
    machines: room.machines.map((machine) => {
      const base = mockById.get(machine.id) ?? machine;
      return {
        ...machine,
        ppm: Math.round(clamp(jitter(base.ppm, 40), 400, 1600)),
        ph: round(clamp(jitter(base.ph, 0.15), 5.0, 7.0), 1),
        phDown: base.phDown,
        phUp: base.phUp,
        waterLevel: Math.round(clamp(jitter(base.waterLevel, 4), 0, 100)),
        online: Math.random() > 0.08 ? base.online : !base.online,
        updatedAt: new Date().toISOString(),
      };
    }),
  }));
}

/** Placeholder data — replace with Firestore/API fetch in MachinesScreen. */export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Room #1',
    machines: [
      {
        id: 'r1-machine-1',
        name: 'Machine #1 - Tomato 🍅',
        online: true,
        ppm: 1200,
        ph: 6.2,
        phDown: 0,
        phUp: 0,
        waterLevel: 80,
        updatedAt: '2026-06-19T14:32:18.000Z',
      },
      {
        id: 'r1-machine-2',
        name: 'Machine #2 - Strawberry 🍓',
        online: false,
        ppm: 980,
        ph: 5.8,
        phDown: 2,
        phUp: 0,
        waterLevel: 45,
        updatedAt: '2026-06-19T11:05:42.000Z',
      },
      {
        id: 'r1-machine-3',
        name: 'Machine #3 - Pepper 🌶️',
        online: true,
        ppm: 1100,
        ph: 6.5,
        phDown: 0,
        phUp: 1,
        waterLevel: 92,
        updatedAt: '2026-06-19T16:48:03.000Z',
      },
      {
        id: 'r1-machine-4',
        name: 'Machine #4 - Lettuce 🥬',
        online: true,
        ppm: 850,
        ph: 6.0,
        phDown: 1,
        phUp: 0,
        waterLevel: 67,
        updatedAt: '2026-06-19T09:15:30.000Z',
      },
      {
        id: 'r1-machine-5',
        name: 'Machine #5 - Basil 🌿',
        online: true,
        ppm: 720,
        ph: 6.3,
        phDown: 0,
        phUp: 0,
        waterLevel: 88,
        updatedAt: '2026-06-19T13:22:11.000Z',
      },
    ],
  },
  {
    id: 'room-2',
    name: 'Room #2',
    machines: [
      {
        id: 'r2-machine-1',
        name: 'Machine #1 - Cucumber 🥒',
        online: true,
        ppm: 1050,
        ph: 6.1,
        phDown: 0,
        phUp: 0,
        waterLevel: 74,
        updatedAt: '2026-06-19T10:40:55.000Z',
      },
      {
        id: 'r2-machine-2',
        name: 'Machine #2 - Mint 🍃',
        online: false,
        ppm: 640,
        ph: 5.9,
        phDown: 3,
        phUp: 0,
        waterLevel: 38,
        updatedAt: '2026-06-18T22:18:07.000Z',
      },
    ],
  },
  {
    id: 'room-3',
    name: 'Room #3',
    machines: [
      {
        id: 'r3-machine-1',
        name: 'Machine #1 - Kale 🥗',
        online: true,
        ppm: 900,
        ph: 6.4,
        phDown: 0,
        phUp: 1,
        waterLevel: 81,
        updatedAt: '2026-06-19T08:05:20.000Z',
      },
      {
        id: 'r3-machine-2',
        name: 'Machine #2 - Spinach 🌱',
        online: true,
        ppm: 780,
        ph: 6.0,
        phDown: 0,
        phUp: 0,
        waterLevel: 95,
        updatedAt: '2026-06-19T15:33:44.000Z',
      },
      {
        id: 'r3-machine-3',
        name: 'Machine #3 - Blueberry 🫐',
        online: false,
        ppm: 1150,
        ph: 5.5,
        phDown: 1,
        phUp: 2,
        waterLevel: 52,
        updatedAt: '2026-06-19T07:50:12.000Z',
      },
    ],
  },
];
