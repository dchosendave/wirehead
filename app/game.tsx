import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GridComponent } from '../components/GridComponent';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from '../constants/app-defaults';
import { GAMEPLAY_FLOW, getLevelConfig, getLevelSeed } from '../constants/game-config';
import { getBoardTileSize, MONOSPACE_FONT_FAMILY } from '../constants/ui-config';
import { loadSounds, playRotate, playWin, unloadSounds } from '../lib/audio';
import { checkConnectivity, type ConnectivityResult } from '../lib/connectivity';
import { generateLevel } from '../lib/levelGenerator';
import { loadGameState, loadSettings, loadStats, saveGameState, saveSettings, saveStats } from '../lib/storage';
import { useAppTheme } from '../lib/theme';
import type { GameState, MoveRecord, Rotation, Settings, Stats, TileCell } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function createGameState(
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

export default function GameScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [grid, setGrid] = useState<TileCell[]>([]);
  const [gridSize, setGridSize] = useState(4);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [undoStack, setUndoStack] = useState<MoveRecord[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  const [signalWaveId, setSignalWaveId] = useState(0);
  const [signalDistanceById, setSignalDistanceById] = useState<Record<string, number>>({});
  const [newlyConnectedIds, setNewlyConnectedIds] = useState<Set<string>>(new Set());

  const connectedIdsRef = useRef<Set<string>>(new Set());
  const signalWaveIdRef = useRef(0);

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

  const applyConnectivity = useCallback(
    (result: ConnectivityResult, options?: { animateAll?: boolean }) => {
      const animateAll = options?.animateAll === true;
      const previousConnectedIds = connectedIdsRef.current;
      const nextConnectedIds = result.connectedIds;
      const nextNewlyConnectedIds = new Set<string>();

      for (const id of nextConnectedIds) {
        if (animateAll || !previousConnectedIds.has(id)) {
          nextNewlyConnectedIds.add(id);
        }
      }

      if (nextNewlyConnectedIds.size > 0) {
        const powerId = Object.keys(result.distanceById).find(
          (id) => result.distanceById[id] === 0,
        );
        if (powerId) {
          nextNewlyConnectedIds.add(powerId);
        }
      }

      connectedIdsRef.current = nextConnectedIds;
      setConnectedIds(nextConnectedIds);
      setSignalDistanceById(result.distanceById);
      setNewlyConnectedIds(nextNewlyConnectedIds);

      if (animateAll || nextNewlyConnectedIds.size > 0) {
        signalWaveIdRef.current += 1;
        setSignalWaveId(signalWaveIdRef.current);
      }
    },
    [],
  );

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
        const g = savedState.currentGrid;
        const savedUndoStack = savedState.undoStack ?? [];
        setGrid(g);
        setGridSize(savedState.gridSize);
        setCurrentLevel(savedState.currentLevel);
        setUndoStack(savedUndoStack);
        undoStackRef.current = savedUndoStack;
        const result = checkConnectivity(g, savedState.gridSize);
        connectedIdsRef.current = result.connectedIds;
        setConnectedIds(result.connectedIds);
        setSignalDistanceById(result.distanceById);
        setNewlyConnectedIds(new Set());
      } else {
        startLevel(savedState?.isComplete ? savedState.currentLevel + 1 : stats.highestLevelReached);
      }

      if (!settings.tutorialCompleted) {
        setShowTutorial(true);
      }
    }
    init();
  }, [startLevel]);

  const startLevel = useCallback((level: number) => {
    const { gridSize: gs, bulbCount } = getLevelConfig(level);
    const seed = getLevelSeed(level);
    const { grid: newGrid } = generateLevel(gs, bulbCount, seed);
    const emptyUndoStack: MoveRecord[] = [];
    setGrid(newGrid);
    setGridSize(gs);
    setCurrentLevel(level);
    setIsComplete(false);
    setUndoStack(emptyUndoStack);
    undoStackRef.current = emptyUndoStack;
    const result = checkConnectivity(newGrid, gs);
    applyConnectivity(result, { animateAll: true });
    saveGameState(
      createGameState(
        level,
        statsRef.current.totalLevelsCompleted,
        newGrid,
        gs,
        seed,
        emptyUndoStack,
        false,
      ),
    );
  }, [applyConnectivity]);

  function handleTutorialComplete() {
    setShowTutorial(false);
    const updated = { ...settingsRef.current, tutorialCompleted: true };
    settingsRef.current = updated;
    saveSettings(updated);
  }

  const handleTileRotate = useCallback(
    (id: string, newRotation: Rotation) => {
      if (isComplete) return;

      const { hapticsEnabled, soundEnabled } = settingsRef.current;
      if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (soundEnabled) playRotate();

      setGrid((prev) => {
        const targetCell = prev.find((cell) => cell.id === id);
        if (!targetCell || targetCell.isLocked || targetCell.rotation === newRotation) {
          return prev;
        }

        const move: MoveRecord = {
          tileId: id,
          prevRotation: targetCell.rotation,
          nextRotation: newRotation,
        };
        const nextUndoStack = [...undoStackRef.current, move];
        undoStackRef.current = nextUndoStack;
        setUndoStack(nextUndoStack);

        const updated = prev.map((cell) =>
          cell.id === id ? { ...cell, rotation: newRotation } : cell,
        );

        const result = checkConnectivity(updated, gridSize);
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
              updated,
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
              updated,
              gridSize,
              getLevelSeed(currentLevel),
              nextUndoStack,
              false,
            ),
          );
        }

        return updated;
      });
    },
    [applyConnectivity, gridSize, isComplete, currentLevel, router],
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

    setGrid((prev) => {
      const reverted = prev.map((cell) =>
        cell.id === lastMove.tileId ? { ...cell, rotation: lastMove.prevRotation } : cell,
      );
      const result = checkConnectivity(reverted, gridSize);
      applyConnectivity(result);
      saveGameState(
        createGameState(
          currentLevel,
          statsRef.current.totalLevelsCompleted,
          reverted,
          gridSize,
          getLevelSeed(currentLevel),
          nextUndoStack,
          false,
        ),
      );
      return reverted;
    });
  }, [applyConnectivity, currentLevel, gridSize, isComplete]);

  const tileSize = getBoardTileSize(SCREEN_WIDTH, SCREEN_HEIGHT, gridSize);

  const displayConnectedIds = connectedIds;
  const canUndo = !isComplete && undoStack.length > 0;

  if (grid.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <Text style={styles.loading}>Generating level…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/home')}
          accessibilityRole="button"
          accessibilityLabel="Back to main menu"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Ionicons name="chevron-back" size={20} color={colors.ctaButton} />
          <Text style={styles.backLabel}>HOME</Text>
        </TouchableOpacity>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeLabel}>LEVEL</Text>
          <Text style={styles.levelBadgeValue}>{currentLevel}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.boardFrame}>
          <View style={styles.boardHeader}>
            <View style={styles.boardHeaderCopy}>
              <Text style={styles.levelText}>ACTIVE BOARD</Text>
              <Text style={styles.boardHint}>tap any unlocked tile to rotate</Text>
            </View>
            <TouchableOpacity
              style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
              onPress={handleUndo}
              disabled={!canUndo}
              accessibilityRole="button"
              accessibilityLabel="Undo last move"
            >
              <Ionicons
                name="arrow-undo"
                size={16}
                color={canUndo ? colors.background : colors.textMuted}
              />
              <Text style={[styles.undoButtonText, !canUndo && styles.undoButtonTextDisabled]}>UNDO</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridWrap}>
            <GridComponent
              grid={grid}
              gridSize={gridSize}
              tileSize={tileSize}
              levelKey={currentLevel}
              connectedIds={displayConnectedIds}
              signalWaveId={signalWaveId}
              signalDistanceById={signalDistanceById}
              newlyConnectedIds={newlyConnectedIds}
              onTileRotate={handleTileRotate}
            />
          </View>
          <View style={styles.boardFooter}>
            <Text style={styles.boardFooterLabel}>SECTOR</Text>
            <Text style={styles.boardFooterValue}>{currentLevel}</Text>
          </View>
        </View>
      </View>
      <TutorialOverlay visible={showTutorial} onComplete={handleTutorialComplete} />
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
      paddingTop: 6,
      paddingBottom: 10,
    },
    levelText: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 2.1,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    boardHeaderCopy: {
      flexShrink: 1,
      paddingRight: 12,
    },
    boardHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    boardHint: {
      fontSize: 10,
      color: colors.textSecondary,
      letterSpacing: 0.6,
      marginTop: 4,
    },
    loading: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      width: '100%',
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      minHeight: 44,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    backIcon: {
      display: 'none',
    },
    backLabel: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 1.3,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    levelBadge: {
      alignItems: 'flex-end',
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    levelBadgeLabel: {
      fontSize: 9,
      color: colors.textMuted,
      letterSpacing: 1.4,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    levelBadgeValue: {
      marginTop: 2,
      fontSize: 17,
      fontWeight: '800',
      color: colors.wireConnected,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    boardFrame: {
      width: '100%',
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingTop: 12,
      paddingBottom: 12,
      alignItems: 'stretch',
      justifyContent: 'space-between',
    },
    undoButton: {
      minHeight: 38,
      borderRadius: 12,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.ctaButton,
    },
    undoButtonDisabled: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    undoButtonText: {
      marginLeft: 6,
      fontSize: 11,
      fontWeight: '800',
      color: colors.background,
      letterSpacing: 1.2,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    undoButtonTextDisabled: {
      color: colors.textMuted,
    },
    gridWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boardFooter: {
      width: '100%',
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.panelStroke,
      paddingTop: 10,
    },
    boardFooterLabel: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.5,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    boardFooterValue: {
      fontSize: 13,
      color: colors.wireConnected,
      fontWeight: '800',
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
  });
}
