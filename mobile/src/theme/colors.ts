/**
 * HeritEdge Design System — Colors
 *
 * Primary action color: RED
 * Warm, culturally respectful palette
 */

export const colors = {
  // Primary — RED (action buttons, active states)
  primary: {
    main: '#C62828',
    light: '#EF5350',
    dark: '#8E0000',
    contrast: '#FFFFFF',
  },

  // Secondary — Warm amber/gold (cultural accent)
  secondary: {
    main: '#F9A825',
    light: '#FFD54F',
    dark: '#C17900',
    contrast: '#1A1A1A',
  },

  // Background
  background: {
    primary: '#FAFAFA',
    secondary: '#F5F5F5',
    warm: '#FFF8E1',
  },

  // Surface / Cards
  surface: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    elevated: '#FFFFFF',
    border: '#E0E0E0',
  },

  // Text
  text: {
    primary: '#1A1A1A',
    secondary: '#616161',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    link: '#C62828',
  },

  // Semantic
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#B71C1C',
    contrast: '#FFFFFF',
  },
  success: {
    main: '#2E7D32',
    light: '#66BB6A',
    dark: '#1B5E20',
    contrast: '#FFFFFF',
  },
  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
    contrast: '#FFFFFF',
  },
  info: {
    main: '#0288D1',
    light: '#4FC3F7',
    dark: '#01579B',
    contrast: '#FFFFFF',
  },

  // Interactive states
  disabled: {
    background: '#E0E0E0',
    text: '#9E9E9E',
  },

  // Splash screen
  splash: {
    background: '#C75B39',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;
