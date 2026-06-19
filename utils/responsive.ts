import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  smallPhone: 375,
  tablet: 768,
  largeTablet: 1024,
} as const;

export const CONTENT_MAX_WIDTH = 440;
const BASE_WIDTH = 390;

export type Responsive = {
  width: number;
  height: number;
  isSmallPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  topPadding: number;
  logoMaxWidth: number;
  splashLogoMaxWidth: number;
  scale: (size: number) => number;
  cardInsetLeft: number;
  cardInsetRight: number;
  cardGap: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Scale a value relative to a ~390pt phone baseline (iPhone 14/15/16 class). */
export function scaleSize(
  size: number,
  width: number,
  minScale = 0.85,
  maxScale = 1.15,
): number {
  return Math.round(size * clamp(width / BASE_WIDTH, minScale, maxScale));
}

/**
 * Single source of truth for responsive layout values across screens.
 * Reactive — updates on rotation, split-screen, browser resize, etc.
 */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < BREAKPOINTS.smallPhone;
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLargeTablet = width >= BREAKPOINTS.largeTablet;
  const isLandscape = width > height;
  const scale = (size: number) => scaleSize(size, width);

  return {
    width,
    height,
    isSmallPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    contentMaxWidth: isLargeTablet ? 520 : CONTENT_MAX_WIDTH,
    horizontalPadding: isTablet ? 32 : isSmallPhone ? 16 : 24,
    topPadding: clamp(height * 0.18, 80, 240),
    logoMaxWidth: isTablet ? 320 : 240,
    splashLogoMaxWidth: isTablet ? 380 : 280,
    scale,
    cardInsetLeft: isSmallPhone ? 0 : scaleSize(4, width),
    cardInsetRight: scaleSize(32, width, 0.78, 1.2),
    cardGap: scaleSize(12, width),
  };
}
