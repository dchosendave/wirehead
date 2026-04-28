import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MONOSPACE_FONT_FAMILY } from '../../constants/ui-config';
import { useAppTheme } from '../../lib/theme';
import type { Rotation, TileCell } from '../../types';
import { GridComponent } from '../GridComponent';

interface GameBoardPanelProps {
  grid: TileCell[];
  gridSize: number;
  tileSize: number;
  currentLevel: number;
  connectedIds: Set<string>;
  signalWaveId: number;
  signalDistanceById: Record<string, number>;
  newlyConnectedIds: Set<string>;
  canUndo: boolean;
  onUndo: () => void;
  onTileRotate: (id: string, newRotation: Rotation) => void;
}

export function GameBoardPanel({
  grid,
  gridSize,
  tileSize,
  currentLevel,
  connectedIds,
  signalWaveId,
  signalDistanceById,
  newlyConnectedIds,
  canUndo,
  onUndo,
  onTileRotate,
}: GameBoardPanelProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.boardFrame}>
      <View style={styles.boardHeader}>
        <View style={styles.boardHeaderCopy}>
          <Text style={styles.levelText}>ACTIVE BOARD</Text>
          <Text style={styles.boardHint}>tap any unlocked tile to rotate</Text>
        </View>
        <TouchableOpacity
          style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
          onPress={onUndo}
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
          connectedIds={connectedIds}
          signalWaveId={signalWaveId}
          signalDistanceById={signalDistanceById}
          newlyConnectedIds={newlyConnectedIds}
          onTileRotate={onTileRotate}
        />
      </View>
      <View style={styles.boardFooter}>
        <Text style={styles.boardFooterLabel}>SECTOR</Text>
        <Text style={styles.boardFooterValue}>{currentLevel}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
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
    levelText: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 2.1,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    boardHint: {
      fontSize: 10,
      color: colors.textSecondary,
      letterSpacing: 0.6,
      marginTop: 4,
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
