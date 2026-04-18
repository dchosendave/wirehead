import type { Settings, Stats } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  hapticsEnabled: true,
  soundEnabled: true,
  tutorialCompleted: false,
  themeMode: 'dark',
};

export const DEFAULT_STATS: Stats = {
  totalLevelsCompleted: 0,
  highestLevelReached: 1,
};
