import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoardPanel } from '../components/game/GameBoardPanel';
import { GameHeader } from '../components/game/GameHeader';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { getBoardTileSize } from '../constants/ui-config';
import { useGameSession } from '../hooks/useGameSession';
import { useAppTheme } from '../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    grid,
    gridSize,
    currentLevel,
    connectedIds,
    showTutorial,
    signalWaveId,
    signalDistanceById,
    newlyConnectedIds,
    canUndo,
    completeTutorial,
    handleTileRotate,
    handleUndo,
  } = useGameSession();

  const tileSize = getBoardTileSize(SCREEN_WIDTH, SCREEN_HEIGHT, gridSize);

  if (grid.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Text style={styles.loading}>Generating level...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <GameHeader currentLevel={currentLevel} onHomePress={() => router.replace('/home')} />

      <View style={styles.content}>
        <GameBoardPanel
          grid={grid}
          gridSize={gridSize}
          tileSize={tileSize}
          currentLevel={currentLevel}
          connectedIds={connectedIds}
          signalWaveId={signalWaveId}
          signalDistanceById={signalDistanceById}
          newlyConnectedIds={newlyConnectedIds}
          canUndo={canUndo}
          onUndo={handleUndo}
          onTileRotate={handleTileRotate}
        />
      </View>

      <TutorialOverlay visible={showTutorial} onComplete={completeTutorial} />
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
    loading: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
}
