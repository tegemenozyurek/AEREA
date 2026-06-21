export type PlantProfile = {
  id: string;
  name: string;
  icon: string;
  optimum_pH: number;
  pH_tolerance: number;
  optimumPPM: number;
  PPM_tolerance: number;
};

export const CUSTOM_PLANT_PROFILE_ID = 'custom';

export function isCustomPlantProfileId(id?: string): boolean {
  return id === CUSTOM_PLANT_PROFILE_ID;
}

export function createCustomPlantProfile(source?: Partial<PlantProfile>): PlantProfile {
  return {
    id: CUSTOM_PLANT_PROFILE_ID,
    name: 'Custom profile',
    icon: '🧩',
    optimum_pH: source?.optimum_pH ?? 6,
    pH_tolerance: source?.pH_tolerance ?? 0.5,
    optimumPPM: source?.optimumPPM ?? 800,
    PPM_tolerance: source?.PPM_tolerance ?? 150,
  };
}
