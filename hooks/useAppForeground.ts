import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/** Runs callback when the app returns to the foreground. */
export function useAppForeground(onForeground: () => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        onForeground();
      }
    });
    return () => subscription.remove();
  }, [onForeground]);
}
