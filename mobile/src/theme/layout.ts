/**
 * HeritEdge Design System — Layout
 *
 * Border radii, button/input heights, and other layout tokens
 */

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const buttonHeight = {
  sm: 36,
  md: 48,
  lg: 56,
} as const;

export const inputHeight = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type BorderRadius = keyof typeof borderRadius;
export type ButtonHeight = keyof typeof buttonHeight;
export type InputHeight = keyof typeof inputHeight;
export type IconSize = keyof typeof iconSize;
