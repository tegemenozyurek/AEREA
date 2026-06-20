import type { AppNotification } from '../types/notification';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function daysAgo(days: number, hours = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const mockNotifications: AppNotification[] = [
  {
    id: 'n-machine-1',
    kind: 'machine_alert',
    createdAt: hoursAgo(1),
    read: false,
    machineId: 'r1-machine-3',
    machineName: 'Machine #3 - Pepper 🌶️',
    metric: 'waterLevel',
    metricValue: 12,
    message: 'Water level 12% — refill soon!',
  },
  {
    id: 'n-like-1',
    kind: 'like',
    createdAt: hoursAgo(3),
    read: false,
    actorName: 'SoilSage',
    postTitle: 'Best time to transplant seedlings outdoors?',
  },
  {
    id: 'n-comment-1',
    kind: 'comment',
    createdAt: hoursAgo(5),
    read: false,
    actorName: 'UrbanFarmer',
    postTitle: 'Mulching saved my beds during the heat wave',
  },
  {
    id: 'n-follow-1',
    kind: 'follow',
    createdAt: hoursAgo(8),
    read: true,
    actorName: 'HydroHarry',
  },
  {
    id: 'n-machine-2',
    kind: 'machine_alert',
    createdAt: daysAgo(1, 9),
    read: true,
    machineId: 'r2-machine-2',
    machineName: 'Machine #2 - Mint 🍃',
    metric: 'tankLevel',
    metricValue: 18,
    message: 'Tank level 18% — check reservoir.',
  },
  {
    id: 'n-like-2',
    kind: 'like',
    createdAt: daysAgo(1, 14),
    read: true,
    actorName: 'LeafLover',
    postTitle: 'DWC setup for cherry tomatoes',
  },
];

