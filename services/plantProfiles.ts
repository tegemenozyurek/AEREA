import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { PlantProfile } from '../types/plantProfile';

function parsePlantProfile(id: string, data: Record<string, unknown>): PlantProfile {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : id,
    icon: typeof data.icon === 'string' ? data.icon : '🌱',
    optimum_pH: Number(data.optimum_pH),
    pH_tolerance: Number(data.pH_tolerance),
    optimumPPM: Number(data.optimumPPM),
    PPM_tolerance: Number(data.PPM_tolerance),
  };
}

export async function fetchPlantProfiles(): Promise<PlantProfile[]> {
  const snapshot = await getDocs(collection(firestore, 'plantProfiles'));

  return snapshot.docs
    .map((entry) => parsePlantProfile(entry.id, entry.data()))
    .filter((profile) => profile.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPlantProfileById(id: string): Promise<PlantProfile | null> {
  const snapshot = await getDoc(doc(firestore, 'plantProfiles', id));
  if (!snapshot.exists()) {
    return null;
  }
  return parsePlantProfile(snapshot.id, snapshot.data());
}
