import type { GameState, MoveRecord, TileCell } from '../types';

export function createGameState(
  level: number,
  totalCompleted: number,
  grid: TileCell[],
  gridSize: number,
  seed: number,
  undoStack: MoveRecord[],
  isComplete: boolean,
): GameState {
  return {
    currentLevel: level,
    totalCompleted,
    currentGrid: grid,
    seed,
    gridSize,
    bulbCount: grid.filter((cell) => cell.isBulb).length,
    isComplete,
    undoStack,
  };
}
