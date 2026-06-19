function expandHex(hex: string): string | null {
  const normalized = hex.replace('#', '').trim();

  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }

  if (normalized.length === 6) {
    return normalized;
  }

  if (normalized.length === 8) {
    return normalized;
  }

  return null;
}

/** Apply alpha to #RGB or #RRGGBB hex colors for RN / SVG. */
export function withAlpha(color: string, alpha: number): string {
  const expanded = expandHex(color);
  if (!expanded) {
    return color;
  }

  const clamped = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');

  if (expanded.length === 8) {
    return `#${expanded.slice(0, 6)}${alphaHex}`;
  }

  return `#${expanded}${alphaHex}`;
}
