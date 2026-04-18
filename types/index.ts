export type TileType =
  | 'straight'
  | 'elbow'
  | 't-junction'
  | 'cross'
  | 'dead-end'
  | 'power'
  | 'bulb';

export type Rotation = 0 | 90 | 180 | 270;
export type Direction = 'top' | 'right' | 'bottom' | 'left';
export type ThemeMode =
  | 'dark'
  | 'light'
  | 'neon-lab'
  | 'retro-terminal'
  | 'blueprint-minimal';

export interface TileCell {
  id: string;
  row: number;
  col: number;
  tileType: TileType;
  rotation: Rotation;
  isLocked: boolean;
  isPowerSource: boolean;
  isBulb: boolean;
}

export interface MoveRecord {
  tileId: string;
  prevRotation: Rotation;
  nextRotation: Rotation;
}

export interface GameState {
  currentLevel: number;
  totalCompleted: number;
  currentGrid: TileCell[];
  seed: number;
  gridSize: number;
  bulbCount: number;
  isComplete: boolean;
  undoStack: MoveRecord[];
}

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