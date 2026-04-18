import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from '../constants/app-defaults';
import { getLevelSeed } from '../constants/game-config';
import type { GameState, Settings, Stats } from '../types';

const KEYS = {
  GAME_STATE: 'game_state',
  SETTINGS: 'settings',
  STATS: 'stats',
} as const;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function loadGameState(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GAME_STATE);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (
      !parsed ||
      !Array.isArray(parsed.currentGrid) ||
      !isFiniteNumber(parsed.currentLevel) ||
      !isFiniteNumber(parsed.gridSize)
    ) {
      return null;
    }

    return {
      currentLevel: parsed.currentLevel,
      totalCompleted: isFiniteNumber(parsed.totalCompleted) ? parsed.totalCompleted : 0,
      currentGrid: parsed.currentGrid,
      seed: isFiniteNumber(parsed.seed) ? parsed.seed : getLevelSeed(parsed.currentLevel),
      gridSize: parsed.gridSize,
      bulbCount: isFiniteNumber(parsed.bulbCount)
        ? parsed.bulbCount
        : parsed.currentGrid.filter((cell) => cell.isBulb).length,
      isComplete: parsed.isComplete === true,
      undoStack: Array.isArray(parsed.undoStack) ? parsed.undoStack : [],
    };
  } catch {
    return null;
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
  } catch {
    // Storage errors are non-fatal
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STATS);
    return raw ? { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<Stats>) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch {}
}
