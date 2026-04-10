import { View } from 'react-native';
import type { Rotation, TileCell } from '../types';
import { TileComponent } from './TileComponent';

interface Props {
  grid: TileCell[];
  gridSize: number;
  tileSize: number;
  levelKey: number; // changing this remounts all tiles, resetting animation state
  connectedIds: Set<string>;
  onTileRotate: (id: string, newRotation: Rotation) => void;
}

export function GridComponent({
  grid,
  gridSize,
  tileSize,
  levelKey,
  connectedIds,
  onTileRotate,
}: Props) {
  // Build rows: gridSize rows, each with gridSize cells sorted by column
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
              onRotate={onTileRotate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
