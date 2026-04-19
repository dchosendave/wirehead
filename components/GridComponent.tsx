import { View } from 'react-native';
import type { Rotation, TileCell } from '../types';
import { TileComponent } from './TileComponent';

interface Props {
  grid: TileCell[];
  gridSize: number;
  tileSize: number;
  levelKey: number;
  connectedIds: Set<string>;
  signalWaveId: number;
  signalDistanceById: Record<string, number>;
  newlyConnectedIds: Set<string>;
  onTileRotate: (id: string, newRotation: Rotation) => void;
}

export function GridComponent({
  grid,
  gridSize,
  tileSize,
  levelKey,
  connectedIds,
  signalWaveId,
  signalDistanceById,
  newlyConnectedIds,
  onTileRotate,
}: Props) {
  const rows: TileCell[][] = Array.from({ length: gridSize }, (_, r) =>
    grid.filter((cell) => cell.row === r).sort((a, b) => a.col - b.col),
  );

  return (
    <View style={{ alignSelf: 'center' }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row' }}>
          {row.map((tile) => (
            <TileComponent
              key={`${tile.id}-${levelKey}`}
              tile={tile}
              size={tileSize}
              isConnected={connectedIds.has(tile.id)}
              signalWaveId={signalWaveId}
              signalDistance={signalDistanceById[tile.id]}
              shouldAnimateSignal={newlyConnectedIds.has(tile.id)}
              onRotate={onTileRotate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
