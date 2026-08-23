/**
 * HeritEdge Design System — Typography
 *
 * Elder-friendly: large readable text, minimum 16px body
 */

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,       // Minimum body text
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
