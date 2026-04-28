import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from '../constants/app-defaults';
import { GAMEPLAY_FLOW, getLevelConfig, getLevelSeed } from '../constants/game-config';
import { loadSounds, playRotate, playWin, unloadSounds } from '../lib/audio';
import { checkConnectivity } from '../lib/connectivity';
import { createGameState } from '../lib/gameState';
import { generateLevel } from '../lib/levelGenerator';
import { loadGameState, loadSettings, loadStats, saveGameState, saveSettings, saveStats } from '../lib/storage';
import type { MoveRecord, Rotation, Settings, Stats, TileCell } from '../types';
import { useConnectivitySignal } from './useConnectivitySignal';

export function useGameSession() {
  const router = useRouter();
  const [grid, setGrid] = useState<TileCell[]>([]);
  const [gridSize, setGridSize] = useState(4);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [undoStack, setUndoStack] = useState<MoveRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    connectedIds,
    signalWaveId,
    signalDistanceById,
    newlyConnectedIds,
    applyConnectivity,
    setConnectivitySnapshot,
  } = useConnectivitySignal();

  const settingsRef = useRef<Settings>({ ...DEFAULT_SETTINGS });
  const statsRef = useRef<Stats>({ ...DEFAULT_STATS });
  const undoStackRef = useRef<MoveRecord[]>([]);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSounds();
    return () => { unloadSounds(); };
  }, []);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const startLevel = useCallback((level: number) => {
    const { gridSize: nextGridSize, bulbCount } = getLevelConfig(level);
    const seed = getLevelSeed(level);
    const { grid: nextGrid } = generateLevel(nextGridSize, bulbCount, seed);
    const emptyUndoStack: MoveRecord[] = [];

    setGrid(nextGrid);
    setGridSize(nextGridSize);
    setCurrentLevel(level);
    setIsComplete(false);
    setUndoStack(emptyUndoStack);
    undoStackRef.current = emptyUndoStack;

    const result = checkConnectivity(nextGrid, nextGridSize);
    applyConnectivity(result, { animateAll: true });
    saveGameState(
      createGameState(
        level,
        statsRef.current.totalLevelsCompleted,
        nextGrid,
        nextGridSize,
        seed,
        emptyUndoStack,
        false,
      ),
    );
  }, [applyConnectivity]);

  useEffect(() => {
    async function init() {
      const [savedState, settings, stats] = await Promise.all([
        loadGameState(),
        loadSettings(),
        loadStats(),
      ]);
      settingsRef.current = settings;
      statsRef.current = stats;

      if (savedState && !savedState.isComplete) {
        const savedGrid = savedState.currentGrid;
        const savedUndoStack = savedState.undoStack ?? [];
        setGrid(savedGrid);
        setGridSize(savedState.gridSize);
        setCurrentLevel(savedState.currentLevel);
        setUndoStack(savedUndoStack);
        undoStackRef.current = savedUndoStack;
        setConnectivitySnapshot(checkConnectivity(savedGrid, savedState.gridSize));
      } else {
        startLevel(savedState?.isComplete ? savedState.currentLevel + 1 : stats.highestLevelReached);
      }

      if (!settings.tutorialCompleted) {
        setShowTutorial(true);
      }
    }

    init();
  }, [setConnectivitySnapshot, startLevel]);

  const completeTutorial = useCallback(() => {
    setShowTutorial(false);
    const updated = { ...settingsRef.current, tutorialCompleted: true };
    settingsRef.current = updated;
    saveSettings(updated);
  }, []);

  const handleTileRotate = useCallback(
    (id: string, newRotation: Rotation) => {
      if (isComplete) return;

      const { hapticsEnabled, soundEnabled } = settingsRef.current;
      if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (soundEnabled) playRotate();

      setGrid((previousGrid) => {
        const targetCell = previousGrid.find((cell) => cell.id === id);
        if (!targetCell || targetCell.isLocked || targetCell.rotation === newRotation) {
          return previousGrid;
        }

        const move: MoveRecord = {
          tileId: id,
          prevRotation: targetCell.rotation,
          nextRotation: newRotation,
        };
        const nextUndoStack = [...undoStackRef.current, move];
        undoStackRef.current = nextUndoStack;
        setUndoStack(nextUndoStack);

        const updatedGrid = previousGrid.map((cell) =>
          cell.id === id ? { ...cell, rotation: newRotation } : cell,
        );

        const result = checkConnectivity(updatedGrid, gridSize);
        applyConnectivity(result);

        if (result.allBulbsLit) {
          setIsComplete(true);

          if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (soundEnabled) playWin();

          const newStats: Stats = {
            totalLevelsCompleted: statsRef.current.totalLevelsCompleted + 1,
            highestLevelReached: Math.max(statsRef.current.highestLevelReached, currentLevel + 1),
          };
          statsRef.current = newStats;
          saveStats(newStats);
          saveGameState(
            createGameState(
              currentLevel,
              newStats.totalLevelsCompleted,
              updatedGrid,
              gridSize,
              getLevelSeed(currentLevel),
              nextUndoStack,
              true,
            ),
          );

          if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current);
          }
          completionTimeoutRef.current = setTimeout(() => {
            completionTimeoutRef.current = null;
            router.replace('/complete');
          }, GAMEPLAY_FLOW.completionRouteDelayMs);
        } else {
          saveGameState(
            createGameState(
              currentLevel,
              statsRef.current.totalLevelsCompleted,
              updatedGrid,
              gridSize,
              getLevelSeed(currentLevel),
              nextUndoStack,
              false,
            ),
          );
        }

        return updatedGrid;
      });
    },
    [applyConnectivity, currentLevel, gridSize, isComplete, router],
  );

  const handleUndo = useCallback(() => {
    if (isComplete) return;

    const lastMove = undoStackRef.current[undoStackRef.current.length - 1];
    if (!lastMove) return;

    const nextUndoStack = undoStackRef.current.slice(0, -1);
    undoStackRef.current = nextUndoStack;
    setUndoStack(nextUndoStack);

    const { hapticsEnabled, soundEnabled } = settingsRef.current;
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (soundEnabled) playRotate();

    setGrid((previousGrid) => {
      const revertedGrid = previousGrid.map((cell) =>
        cell.id === lastMove.tileId ? { ...cell, rotation: lastMove.prevRotation } : cell,
      );
      const result = checkConnectivity(revertedGrid, gridSize);
      applyConnectivity(result);
      saveGameState(
        createGameState(
          currentLevel,
          statsRef.current.totalLevelsCompleted,
          revertedGrid,
          gridSize,
          getLevelSeed(currentLevel),
          nextUndoStack,
          false,
        ),
      );
      return revertedGrid;
    });
  }, [applyConnectivity, currentLevel, gridSize, isComplete]);

  return {
    grid,
    gridSize,
    currentLevel,
    connectedIds,
    isComplete,
    showTutorial,
    signalWaveId,
    signalDistanceById,
    newlyConnectedIds,
    canUndo: !isComplete && undoStack.length > 0,
    completeTutorial,
    handleTileRotate,
    handleUndo,
  };
}
