import React, { createContext, ReactNode, useContext } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type CommunityScrollContextValue = {
  onContentScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

const CommunityScrollContext = createContext<CommunityScrollContextValue | null>(null);

export function CommunityScrollProvider({
  onContentScroll,
  children,
}: {
  onContentScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  children: ReactNode;
}) {
  return (
    <CommunityScrollContext.Provider value={{ onContentScroll }}>
      {children}
    </CommunityScrollContext.Provider>
  );
}

export function useCommunityScroll(): CommunityScrollContextValue | null {
  return useContext(CommunityScrollContext);
}

/** Attach to FlatList / SectionList / ScrollView when inside Community tab. */
export function useCommunityScrollHandler():
  | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
  | undefined {
  return useCommunityScroll()?.onContentScroll;
}
