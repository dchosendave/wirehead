import type { ThemeMode } from '../types';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  panelStroke: string;
  gridCell: string;
  cellBorder: string;
  wireDisconnected: string;
  wireConnected: string;
  powerSource: string;
  bulbUnlit: string;
  bulbLit: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  ctaButton: string;
  success: string;
  danger: string;
}

export const DARK_COLORS: ThemeColors = {
  // Base surfaces
  background: '#060914',
  surface: '#10182A',
  surfaceElevated: '#172540',
  panelStroke: '#2A3D62',

  // Legacy aliases used across existing components
  gridCell: '#10182A',
  cellBorder: '#2A3D62',

  // Circuit colors
  wireDisconnected: '#52637D',
  wireConnected: '#FFB44D',
  powerSource: '#38BCFF',
  bulbUnlit: '#785E28',
  bulbLit: '#FFD76A',

  // Text
  textPrimary: '#F5F8FF',
  textSecondary: '#A9BAD6',
  textMuted: '#7688A4',

  // Actions and status
  ctaButton: '#79E6FF',
  success: '#7CF2B4',
  danger: '#FF6B6B',
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#EEF3FB',
  surface: '#FBFDFF',
  surfaceElevated: '#E6EDF8',
  panelStroke: '#CCD8EA',
  gridCell: '#FBFDFF',
  cellBorder: '#D2DDEC',
  wireDisconnected: '#8EA0B6',
  wireConnected: '#D2881C',
  powerSource: '#1D86FF',
  bulbUnlit: '#D7B97A',
  bulbLit: '#E9B94A',
  textPrimary: '#0E1728',
  textSecondary: '#506177',
  textMuted: '#74869D',
  ctaButton: '#1592D4',
  success: '#177E57',
  danger: '#D94D4D',
};

export const COLORS: ThemeColors = DARK_COLORS;

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === 'light' ? LIGHT_COLORS : DARK_COLORS;
}

export function getLevelConfig(level: number): { gridSize: number; bulbCount: number } {
  if (level <= 10) return { gridSize: 4, bulbCount: 1 };
  if (level <= 25) return { gridSize: 5, bulbCount: 2 };
  if (level <= 50) return { gridSize: 6, bulbCount: 2 };
  return { gridSize: 6, bulbCount: 3 };
}
