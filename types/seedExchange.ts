export type SeedExchangeType = 'trade' | 'donate';

export type SeedListing = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  photoUris: string[];
  exchangeType: SeedExchangeType;
  /** What the author is looking for in a trade (empty for donate). */
  lookingFor: string;
  createdAt: string;
};

export type CreateSeedListingInput = {
  title: string;
  body: string;
  photoUris: string[];
  exchangeType: SeedExchangeType;
  lookingFor: string;
};
