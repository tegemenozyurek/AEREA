import type { PlantProfile } from './plantProfile';

export type Machine = {
  id: string;
  name: string;
  model: string;
  deviceId: string;
  plantProfileId?: string;
  customPlantProfile?: PlantProfile;
  online: boolean;
  ppm: number;
  ph: number;
  phDown: number;
  phUp: number;
  tankLevel: number;
  waterLevel: number;
  updatedAt: string;
};

export function formatDeviceId(deviceId: string): string {
  const normalized = deviceId.replace(/^#/, '');
  return `#${normalized}`;
}
