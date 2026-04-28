import type { ThemeMode } from './settings';

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

export interface ThemeDefinition {
  id: ThemeMode;
  label: string;
  description: string;
  statusBarStyle: 'light' | 'dark';
  colors: ThemeColors;
}
