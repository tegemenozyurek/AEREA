import type { Machine } from '../types/machine';

/** Placeholder data — replace with Firestore/API fetch in MachinesScreen. */
export const MOCK_MACHINES: Machine[] = [
  {
    id: 'machine-1',
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
    id: 'machine-2',
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
    id: 'machine-3',
    name: 'Machine #3 - Pepper 🌶️',
    online: true,
    ppm: 1100,
    ph: 6.5,
    phDown: 0,
    phUp: 1,
    waterLevel: 92,
    updatedAt: '2026-06-19T16:48:03.000Z',
  },
];
