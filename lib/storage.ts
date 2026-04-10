import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Settings, Stats } from '../types';

const KEYS = {
  GAME_STATE: 'game_state',
  SETTINGS: 'settings',
  STATS: 'stats',
} as const;

const DEFAULT_SETTINGS: Settings = {
  hapticsEnabled: true,
  soundEnabled: true,
  tutorialCompleted: false,
  themeMode: 'dark',
};

const DEFAULT_STATS: Stats = {
  totalLevelsCompleted: 0,
  highestLevelReached: 1,
};

export async function loadGameState(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GAME_STATE);
    return raw ? (JSON.parse(raw) as GameState) : null;
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
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
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
    return raw ? { ...DEFAULT_STATS, ...(JSON.parse(raw) as Partial<Stats>) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: Stats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch {}
}
