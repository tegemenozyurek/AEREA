import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type AppRoute =
  | 'home'
  | 'community'
  | 'machines'
  | 'analysis'
  | 'account'
  | 'settings';

type NavigationContextValue = {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
  goHome: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<AppRoute>('home');

  const navigate = useCallback((next: AppRoute) => setRoute(next), []);
  const goHome = useCallback(() => setRoute('home'), []);

  const value = useMemo<NavigationContextValue>(
    () => ({ route, navigate, goHome }),
    [route, navigate, goHome],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}
