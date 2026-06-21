import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { PlantProfile } from '../types/plantProfile';

const CACHE_KEY = '@aerea/plantProfiles/v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type StoredPlantProfilesCache = {
  fetchedAt: number;
  profiles: PlantProfile[];
};

type PlantProfilesMemoryCache = {
  profiles: PlantProfile[];
  byId: Map<string, PlantProfile>;
  fetchedAt: number;
};

let memoryCache: PlantProfilesMemoryCache | null = null;
let inflightFetch: Promise<PlantProfile[]> | null = null;

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

function sortProfiles(profiles: PlantProfile[]): PlantProfile[] {
  return [...profiles]
    .filter((profile) => profile.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildMemoryCache(profiles: PlantProfile[], fetchedAt: number): PlantProfilesMemoryCache {
  const sortedProfiles = sortProfiles(profiles);

  return {
    profiles: sortedProfiles,
    byId: new Map(sortedProfiles.map((profile) => [profile.id, profile])),
    fetchedAt,
  };
}

function isCacheFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

async function readStoredCache(): Promise<StoredPlantProfilesCache | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredPlantProfilesCache;
    if (
      typeof parsed.fetchedAt !== 'number' ||
      !Array.isArray(parsed.profiles) ||
      parsed.profiles.length === 0
    ) {
      return null;
    }

    return {
      fetchedAt: parsed.fetchedAt,
      profiles: parsed.profiles.filter(
        (profile): profile is PlantProfile =>
          typeof profile?.id === 'string' && typeof profile?.name === 'string',
      ),
    };
  } catch {
    return null;
  }
}

async function writeStoredCache(profiles: PlantProfile[], fetchedAt: number): Promise<void> {
  try {
    const payload: StoredPlantProfilesCache = { fetchedAt, profiles };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Cache persistence is best-effort; in-memory cache still works this session.
  }
}

async function fetchPlantProfilesFromFirestore(): Promise<PlantProfile[]> {
  const snapshot = await getDocs(collection(firestore, 'plantProfiles'));

  return sortProfiles(snapshot.docs.map((entry) => parsePlantProfile(entry.id, entry.data())));
}

async function ensurePlantProfiles(force = false): Promise<PlantProfile[]> {
  if (!force && memoryCache && isCacheFresh(memoryCache.fetchedAt)) {
    return memoryCache.profiles;
  }

  if (!force && !memoryCache) {
    const stored = await readStoredCache();
    if (stored && isCacheFresh(stored.fetchedAt)) {
      memoryCache = buildMemoryCache(stored.profiles, stored.fetchedAt);
      return memoryCache.profiles;
    }
  }

  if (inflightFetch && !force) {
    return inflightFetch;
  }

  const request = (async () => {
    try {
      const profiles = await fetchPlantProfilesFromFirestore();
      const fetchedAt = Date.now();
      memoryCache = buildMemoryCache(profiles, fetchedAt);
      await writeStoredCache(profiles, fetchedAt);
      return profiles;
    } catch (error) {
      const stored = await readStoredCache();
      if (stored) {
        memoryCache = buildMemoryCache(stored.profiles, stored.fetchedAt);
        return memoryCache.profiles;
      }
      throw error;
    }
  })();

  inflightFetch = request;

  try {
    return await request;
  } finally {
    if (inflightFetch === request) {
      inflightFetch = null;
    }
  }
}

export async function fetchPlantProfiles(options?: { force?: boolean }): Promise<PlantProfile[]> {
  return ensurePlantProfiles(options?.force ?? false);
}

export async function fetchPlantProfileById(
  id: string,
  options?: { force?: boolean },
): Promise<PlantProfile | null> {
  await ensurePlantProfiles(options?.force ?? false);
  return memoryCache?.byId.get(id) ?? null;
}

export async function invalidatePlantProfilesCache(): Promise<void> {
  memoryCache = null;
  inflightFetch = null;

  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}
