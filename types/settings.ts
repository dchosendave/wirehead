export type ThemeMode =
  | 'dark'
  | 'light'
  | 'neon-lab'
  | 'retro-terminal'
  | 'blueprint-minimal';

export interface Settings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  tutorialCompleted: boolean;
  themeMode: ThemeMode;
}

export interface Stats {
  totalLevelsCompleted: number;
  highestLevelReached: number;
}
