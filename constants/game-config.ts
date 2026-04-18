import type { Rotation, TileType } from '../types';

export interface LevelConfig {
  gridSize: number;
  bulbCount: number;
}

export interface LevelTier extends LevelConfig {
  minLevel: number;
  maxLevel: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { minLevel: 1, maxLevel: 10, gridSize: 4, bulbCount: 1 },
  { minLevel: 11, maxLevel: 25, gridSize: 5, bulbCount: 2 },
  { minLevel: 26, maxLevel: 50, gridSize: 6, bulbCount: 2 },
  { minLevel: 51, maxLevel: Number.POSITIVE_INFINITY, gridSize: 6, bulbCount: 3 },
];

export const LEVEL_SEED_MULTIPLIER = 7919;

export const GENERATOR_FILLER_TYPES: TileType[] = ['straight', 'elbow', 't-junction', 'dead-end'];
export const GENERATOR_ROTATIONS: Rotation[] = [0, 90, 180, 270];
export const GENERATOR_MIN_SCRAMBLED_TILE_RATIO = 0.5;

export const POWER_SOURCE_PLACEMENT = 'center' as const;

export const GAMEPLAY_FLOW = {
  completionRouteDelayMs: 800,
};

export function getLevelConfig(level: number): LevelConfig {
  const tier =
    LEVEL_TIERS.find((entry) => level >= entry.minLevel && level <= entry.maxLevel) ??
    LEVEL_TIERS[LEVEL_TIERS.length - 1];

  return {
    gridSize: tier.gridSize,
    bulbCount: tier.bulbCount,
  };
}

export function getLevelSeed(level: number): number {
  return level * LEVEL_SEED_MULTIPLIER;
}

export function getPowerSourcePosition(gridSize: number): { row: number; col: number } {
  if (POWER_SOURCE_PLACEMENT === 'center') {
    return {
      row: Math.floor(gridSize / 2),
      col: Math.floor(gridSize / 2),
    };
  }

  return { row: 0, col: 0 };
}
