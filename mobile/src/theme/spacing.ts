/**
 * HeritEdge Design System — Spacing
 *
 * Consistent spacing scale for mobile UI
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  section: 48,
} as const;

// Touch target minimum (44x44pt for accessibility)
export const touchTarget = {
  min: 44,
  recommended: 48,
} as const;

export type Spacing = keyof typeof spacing;
