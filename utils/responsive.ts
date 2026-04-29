import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  largeTablet: 1024,
} as const;

export const CONTENT_MAX_WIDTH = 440;

export type Responsive = {
  width: number;
  height: number;
  isTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  topPadding: number;
  logoMaxWidth: number;
  splashLogoMaxWidth: number;
};

/**
 * Single source of truth for responsive layout values across screens.
 * Reactive — updates on rotation, split-screen, browser resize, etc.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;
  const isLargeTablet = width >= BREAKPOINTS.largeTablet;
  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isLandscape,
    contentMaxWidth: CONTENT_MAX_WIDTH,
    horizontalPadding: isTablet ? 32 : 24,
    topPadding: clamp(height * 0.18, 80, 240),
    logoMaxWidth: isTablet ? 320 : 240,
    splashLogoMaxWidth: isTablet ? 380 : 280,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
