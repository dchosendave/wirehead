import type { Rotation, TileCell } from './tile';

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
