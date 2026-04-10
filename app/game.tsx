import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GridComponent } from '../components/GridComponent';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { getLevelConfig } from '../constants';
import { loadSounds, playRotate, playWin, unloadSounds } from '../lib/audio';
import { checkConnectivity } from '../lib/connectivity';
import { generateLevel } from '../lib/levelGenerator';
import { loadGameState, loadSettings, loadStats, saveGameState, saveSettings, saveStats } from '../lib/storage';
import { useAppTheme } from '../lib/theme';
import type { Rotation, Settings, Stats, TileCell } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_PADDING = 16;
const MONO: string = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

export default function GameScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [grid, setGrid] = useState<TileCell[]>([]);
  const [gridSize, setGridSize] = useState(4);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [winFlash, setWinFlash] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const settingsRef = useRef<Settings>({ hapticsEnabled: true, soundEnabled: true, tutorialCompleted: false, themeMode: 'dark' });
  const statsRef = useRef<Stats>({ totalLevelsCompleted: 0, highestLevelReached: 1 });
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
        setGrid(g);
        setGridSize(savedState.gridSize);
        setCurrentLevel(savedState.currentLevel);
        const result = checkConnectivity(g, savedState.gridSize);
        setConnectedIds(result.connectedIds);
      } else {
        startLevel(savedState?.isComplete ? savedState.currentLevel + 1 : stats.highestLevelReached);
      }

      if (!settings.tutorialCompleted) {
        setShowTutorial(true);
      }
    }
    init();
  }, []);

  function startLevel(level: number) {
    const { gridSize: gs, bulbCount } = getLevelConfig(level);
    const seed = level * 7919;
    const { grid: newGrid } = generateLevel(gs, bulbCount, seed);
    setGrid(newGrid);
    setGridSize(gs);
    setCurrentLevel(level);
    setIsComplete(false);
    setWinFlash(false);
    const result = checkConnectivity(newGrid, gs);
    setConnectedIds(result.connectedIds);
  }

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
        const updated = prev.map((cell) =>
          cell.id === id ? { ...cell, rotation: newRotation } : cell,
        );

        const result = checkConnectivity(updated, gridSize);
        setConnectedIds(result.connectedIds);

        if (result.allBulbsLit) {
          setIsComplete(true);
          setWinFlash(true);

          if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (soundEnabled) playWin();

          const newStats: Stats = {
            totalLevelsCompleted: statsRef.current.totalLevelsCompleted + 1,
            highestLevelReached: Math.max(statsRef.current.highestLevelReached, currentLevel + 1),
          };
          statsRef.current = newStats;
          saveStats(newStats);
          saveGameState({
            currentLevel,
            totalCompleted: newStats.totalLevelsCompleted,
            currentGrid: updated,
            seed: currentLevel * 7919,
            gridSize,
            bulbCount: updated.filter((c) => c.isBulb).length,
            isComplete: true,
          });

          if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current);
          }
          completionTimeoutRef.current = setTimeout(() => {
            completionTimeoutRef.current = null;
            router.replace('/complete');
          }, 800);
        } else {
          saveGameState({
            currentLevel,
            totalCompleted: statsRef.current.totalLevelsCompleted,
            currentGrid: updated,
            seed: currentLevel * 7919,
            gridSize,
            bulbCount: updated.filter((c) => c.isBulb).length,
            isComplete: false,
          });
        }

        return updated;
      });
    },
    [gridSize, isComplete, currentLevel, router],
  );

  const tileSize = Math.floor(Math.min((SCREEN_WIDTH - GRID_PADDING) / gridSize, (SCREEN_HEIGHT - 260) / gridSize));

  const displayConnectedIds = connectedIds;

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
            <Text style={styles.levelText}>ACTIVE BOARD</Text>
            <Text style={styles.boardHint}>tap any unlocked tile to rotate</Text>
          </View>
          <View style={styles.gridWrap}>
            <GridComponent
              grid={grid}
              gridSize={gridSize}
              tileSize={tileSize}
              levelKey={currentLevel}
              connectedIds={displayConnectedIds}
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
      fontFamily: MONO,
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
      fontFamily: MONO,
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
      fontFamily: MONO,
    },
    levelBadgeValue: {
      marginTop: 2,
      fontSize: 17,
      fontWeight: '800',
      color: colors.wireConnected,
      fontFamily: MONO,
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
      fontFamily: MONO,
    },
    boardFooterValue: {
      fontSize: 13,
      color: colors.wireConnected,
      fontWeight: '800',
      fontFamily: MONO,
    },
  });
}
