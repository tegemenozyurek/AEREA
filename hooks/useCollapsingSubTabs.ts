import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  AppState,
  AppStateStatus,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

/** Approximate height of CommunitySubTabs (chip row + padding + border). */
export const COMMUNITY_SUB_TABS_HEIGHT = 44;

const SCROLL_THRESHOLD = 12;
const ANIM_MS = 220;

export function useCollapsingSubTabs() {
  const visibility = useRef(new Animated.Value(1)).current;
  const lastOffset = useRef(0);
  const isVisible = useRef(true);

  const setVisible = useCallback(
    (visible: boolean) => {
      if (isVisible.current === visible) return;
      isVisible.current = visible;
      Animated.timing(visibility, {
        toValue: visible ? 1 : 0,
        duration: ANIM_MS,
        useNativeDriver: false,
      }).start();
    },
    [visibility],
  );

  const showSubTabs = useCallback(() => setVisible(true), [setVisible]);
  const hideSubTabs = useCallback(() => setVisible(false), [setVisible]);

  const forceShowSubTabs = useCallback(() => {
    lastOffset.current = 0;
    isVisible.current = true;
    visibility.stopAnimation();
    visibility.setValue(1);
  }, [visibility]);

  const onContentScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const diff = y - lastOffset.current;

      if (y <= 4) {
        showSubTabs();
      } else if (diff > SCROLL_THRESHOLD) {
        hideSubTabs();
      } else if (diff < -SCROLL_THRESHOLD) {
        showSubTabs();
      }

      lastOffset.current = y;
    },
    [showSubTabs, hideSubTabs],
  );

  const resetScrollTracking = useCallback(() => {
    forceShowSubTabs();
  }, [forceShowSubTabs]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        forceShowSubTabs();
      }
    });
    return () => subscription.remove();
  }, [forceShowSubTabs]);

  const animatedContainerStyle = {
    height: visibility.interpolate({
      inputRange: [0, 1],
      outputRange: [0, COMMUNITY_SUB_TABS_HEIGHT],
    }),
    opacity: visibility,
    overflow: 'hidden' as const,
  };

  return {
    animatedContainerStyle,
    onContentScroll,
    showSubTabs,
    resetScrollTracking,
  };
}
