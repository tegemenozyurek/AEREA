import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { PlantProfile } from '../types/plantProfile';

export async function fetchPlantProfiles(): Promise<PlantProfile[]> {
  const snapshot = await getDocs(collection(firestore, 'plantProfiles'));

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: typeof data.name === 'string' ? data.name : doc.id,
        icon: typeof data.icon === 'string' ? data.icon : '🌱',
        optimum_pH: Number(data.optimum_pH),
        pH_tolerance: Number(data.pH_tolerance),
        optimumPPM: Number(data.optimumPPM),
        PPM_tolerance: Number(data.PPM_tolerance),
      };
    })
    .filter((profile) => profile.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
