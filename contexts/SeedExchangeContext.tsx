import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { mockSeedListings } from '../data/mockSeedListings';
import type { CreateSeedListingInput, SeedListing } from '../types/seedExchange';
import { useAuth } from './AuthContext';

type SeedExchangeContextValue = {
  listings: SeedListing[];
  refreshing: boolean;
  createListing: (input: CreateSeedListingInput) => void;
  refresh: () => Promise<void>;
};

const SeedExchangeContext = createContext<SeedExchangeContextValue | null>(null);

function sortListings(list: SeedListing[]): SeedListing[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function SeedExchangeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<SeedListing[]>(() => [...mockSeedListings]);
  const [refreshing, setRefreshing] = useState(false);

  const authorName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'You';

  const createListing = useCallback(
    (input: CreateSeedListingInput) => {
      const listing: SeedListing = {
        id: `seed-${Date.now()}`,
        authorName,
        title: input.title.trim(),
        body: input.body.trim(),
        photoUris: input.photoUris,
        exchangeType: input.exchangeType,
        lookingFor: input.exchangeType === 'trade' ? input.lookingFor.trim() : '',
        createdAt: new Date().toISOString(),
      };
      setListings((prev) => sortListings([listing, ...prev]));
    },
    [authorName],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const value = useMemo<SeedExchangeContextValue>(
    () => ({
      listings: sortListings(listings),
      refreshing,
      createListing,
      refresh,
    }),
    [listings, refreshing, createListing, refresh],
  );

  return (
    <SeedExchangeContext.Provider value={value}>{children}</SeedExchangeContext.Provider>
  );
}

export function useSeedExchange(): SeedExchangeContextValue {
  const ctx = useContext(SeedExchangeContext);
  if (!ctx) {
    throw new Error('useSeedExchange must be used within a SeedExchangeProvider');
  }
  return ctx;
}
