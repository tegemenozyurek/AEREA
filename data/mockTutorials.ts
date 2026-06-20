import type { Tutorial } from '../types/tutorial';

export const mockTutorials: Tutorial[] = [
  {
    id: 'tut-1',
    kind: 'video',
    title: 'Hydroponics for Beginners — Complete Guide',
    description: 'Setup, nutrients, and common mistakes for your first DWC system.',
    youtubeVideoId: 'GPM0__1EmUE',
    url: 'https://www.youtube.com/watch?v=GPM0__1EmUE',
    duration: '12:34',
    updatedAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'tut-2',
    kind: 'video',
    title: 'pH & EC Explained for Hydroponic Growers',
    description: 'How to measure, adjust, and keep your nutrient solution balanced.',
    youtubeVideoId: 'jZKnWmQ0g9s',
    url: 'https://www.youtube.com/watch?v=jZKnWmQ0g9s',
    duration: '8:42',
    updatedAt: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 'tut-3',
    kind: 'video',
    title: 'Deep Water Culture (DWC) — Step by Step',
    description: 'Build a simple DWC bucket system for tomatoes and peppers.',
    youtubeVideoId: '0h3V5E8Q8wE',
    url: 'https://www.youtube.com/watch?v=0h3V5E8Q8wE',
    duration: '15:20',
    updatedAt: '2026-06-01T09:30:00.000Z',
  },
  {
    id: 'tut-4',
    kind: 'guide',
    title: 'AEREA Quick Start Guide',
    description: 'Pair your machine, calibrate sensors, and run your first grow cycle.',
    url: 'https://aerea.app/guides/quick-start',
    updatedAt: '2026-06-10T12:00:00.000Z',
  },
  {
    id: 'tut-6',
    kind: 'guide',
    title: 'Nutrient Deficiency Cheatsheet',
    description: 'Visual reference for common deficiencies — nitrogen, calcium, magnesium, and more.',
    url: 'https://aerea.app/guides/nutrient-deficiency',
    updatedAt: '2026-06-08T11:00:00.000Z',
  },
  {
    id: 'tut-7',
    kind: 'guide',
    title: 'Weekly Machine Maintenance',
    description: 'Reservoir checks, filter cleaning, and sensor care in a simple checklist.',
    url: 'https://aerea.app/guides/weekly-maintenance',
    updatedAt: '2026-06-12T09:00:00.000Z',
  },
  {
    id: 'tut-5',
    kind: 'video',
    title: 'Preventing Root Rot in Hydroponics',
    description: 'Temperature, oxygen, and hygiene tips to keep roots healthy.',
    youtubeVideoId: 'Y8JFxS1HlTE',
    url: 'https://www.youtube.com/watch?v=Y8JFxS1HlTE',
    duration: '10:05',
    updatedAt: '2026-06-14T16:00:00.000Z',
  },
];

export function youtubeThumbnail(videoId: string, quality: 'hq' | 'max' = 'hq'): string {
  const file = quality === 'max' ? 'maxresdefault' : 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${file}.jpg`;
}

export const mockVideoTutorials = mockTutorials.filter((t) => t.kind === 'video');
export const mockGuideTutorials = mockTutorials.filter((t) => t.kind === 'guide');
