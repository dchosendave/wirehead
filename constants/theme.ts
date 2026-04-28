import type { ThemeColors, ThemeDefinition, ThemeMode } from '../types';
export type { ThemeColors, ThemeDefinition } from '../types';

export const DARK_COLORS: ThemeColors = {
  background: '#060914',
  surface: '#10182A',
  surfaceElevated: '#172540',
  panelStroke: '#2A3D62',
  gridCell: '#10182A',
  cellBorder: '#2A3D62',
  wireDisconnected: '#52637D',
  wireConnected: '#FFB44D',
  powerSource: '#38BCFF',
  bulbUnlit: '#785E28',
  bulbLit: '#FFD76A',
  textPrimary: '#F5F8FF',
  textSecondary: '#A9BAD6',
  textMuted: '#7688A4',
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

export const NEON_LAB_COLORS: ThemeColors = {
  background: '#05070D',
  surface: '#0F1523',
  surfaceElevated: '#17223A',
  panelStroke: '#2C4E73',
  gridCell: '#0F1523',
  cellBorder: '#2C4E73',
  wireDisconnected: '#43526B',
  wireConnected: '#D8FF43',
  powerSource: '#2AE8FF',
  bulbUnlit: '#655A1F',
  bulbLit: '#F7FF88',
  textPrimary: '#F0FBFF',
  textSecondary: '#9BB4C8',
  textMuted: '#677E96',
  ctaButton: '#38F1FF',
  success: '#69F5A3',
  danger: '#FF6F91',
};

export const RETRO_TERMINAL_COLORS: ThemeColors = {
  background: '#07110A',
  surface: '#0D1A10',
  surfaceElevated: '#15311D',
  panelStroke: '#2B6840',
  gridCell: '#0D1A10',
  cellBorder: '#2B6840',
  wireDisconnected: '#4C6755',
  wireConnected: '#8DFF78',
  powerSource: '#78F0C3',
  bulbUnlit: '#495935',
  bulbLit: '#B8FF8C',
  textPrimary: '#E3FFE5',
  textSecondary: '#96C8A0',
  textMuted: '#6E9677',
  ctaButton: '#84F1A9',
  success: '#A7FF9A',
  danger: '#FF8D7A',
};

export const BLUEPRINT_MINIMAL_COLORS: ThemeColors = {
  background: '#EAF2FB',
  surface: '#F8FBFF',
  surfaceElevated: '#E2EBF6',
  panelStroke: '#B8C9DD',
  gridCell: '#F8FBFF',
  cellBorder: '#C7D5E6',
  wireDisconnected: '#8EA1B5',
  wireConnected: '#2E70D7',
  powerSource: '#1B8AFF',
  bulbUnlit: '#A9B8C9',
  bulbLit: '#F1C453',
  textPrimary: '#0F223B',
  textSecondary: '#4D6481',
  textMuted: '#748AA5',
  ctaButton: '#2E85E8',
  success: '#2F9A63',
  danger: '#D55259',
};

export const THEME_DEFINITIONS: Record<ThemeMode, ThemeDefinition> = {
  dark: {
    id: 'dark',
    label: 'Default Dark',
    description: 'The original control-room look with navy surfaces and amber current.',
    statusBarStyle: 'light',
    colors: DARK_COLORS,
  },
  light: {
    id: 'light',
    label: 'Default Light',
    description: 'A bright, cleaner variant with cooler surfaces and softer contrast.',
    statusBarStyle: 'dark',
    colors: LIGHT_COLORS,
  },
  'neon-lab': {
    id: 'neon-lab',
    label: 'Neon Lab',
    description: 'Electric cyan panels and acid-lime current for a vivid arcade feel.',
    statusBarStyle: 'light',
    colors: NEON_LAB_COLORS,
  },
  'retro-terminal': {
    id: 'retro-terminal',
    label: 'Retro Terminal',
    description: 'Green phosphor signals and terminal glass for an old-school ops vibe.',
    statusBarStyle: 'light',
    colors: RETRO_TERMINAL_COLORS,
  },
  'blueprint-minimal': {
    id: 'blueprint-minimal',
    label: 'Blueprint Minimal',
    description: 'Crisp schematic tones with cool blues and a calmer presentation.',
    statusBarStyle: 'dark',
    colors: BLUEPRINT_MINIMAL_COLORS,
  },
};

export const THEME_OPTIONS: ThemeDefinition[] = [
  THEME_DEFINITIONS.dark,
  THEME_DEFINITIONS.light,
  THEME_DEFINITIONS['neon-lab'],
  THEME_DEFINITIONS['retro-terminal'],
  THEME_DEFINITIONS['blueprint-minimal'],
];

export function getThemeDefinition(mode: ThemeMode): ThemeDefinition {
  return THEME_DEFINITIONS[mode];
}

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return getThemeDefinition(mode).colors;
}

export function getThemeStatusBarStyle(mode: ThemeMode): 'light' | 'dark' {
  return getThemeDefinition(mode).statusBarStyle;
}
