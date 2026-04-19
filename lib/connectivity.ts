import type { TileCell } from '../types';
import { OPPOSITE, DIR_TO_DELTA, getOpenEdges } from './tileUtils';

export type DistanceById = Record<string, number>;

export interface ConnectivityResult {
  connectedIds: Set<string>;
  litBulbIds: Set<string>;
  allBulbsLit: boolean;
  distanceById: DistanceById;
}

export function checkConnectivity(grid: TileCell[], gridSize: number): ConnectivityResult {
  const cellMap = new Map<string, TileCell>();
  let powerSource: TileCell | null = null;
  const allBulbIds: string[] = [];

  for (const cell of grid) {
    cellMap.set(cell.id, cell);
    if (cell.isPowerSource) powerSource = cell;
    if (cell.isBulb) allBulbIds.push(cell.id);
  }

  if (!powerSource) {
    return {
      connectedIds: new Set(),
      litBulbIds: new Set(),
      allBulbsLit: false,
      distanceById: {},
    };
  }

  const connectedIds = new Set<string>([powerSource.id]);
  const litBulbIds = new Set<string>();
  const distanceById: DistanceById = { [powerSource.id]: 0 };
  const queue: Array<{ cell: TileCell; distance: number }> = [
    { cell: powerSource, distance: 0 },
  ];

  while (queue.length > 0) {
    const { cell, distance } = queue.shift()!;
    const openEdges = getOpenEdges(cell.tileType, cell.rotation);

    for (const dir of openEdges) {
      const delta = DIR_TO_DELTA[dir];
      const neighborRow = cell.row + delta.row;
      const neighborCol = cell.col + delta.col;

      if (
        neighborRow < 0 ||
        neighborRow >= gridSize ||
        neighborCol < 0 ||
        neighborCol >= gridSize
      ) {
        continue;
      }

      const neighborId = `${neighborRow}_${neighborCol}`;
      if (connectedIds.has(neighborId)) continue;

      const neighbor = cellMap.get(neighborId);
      if (!neighbor) continue;

      const neighborEdges = getOpenEdges(neighbor.tileType, neighbor.rotation);
      if (neighborEdges.includes(OPPOSITE[dir])) {
        const nextDistance = distance + 1;
        connectedIds.add(neighborId);
        distanceById[neighborId] = nextDistance;

        if (neighbor.isBulb) {
          litBulbIds.add(neighborId);
        }

        queue.push({ cell: neighbor, distance: nextDistance });
      }
    }
  }

  return {
    connectedIds,
    litBulbIds,
    allBulbsLit: allBulbIds.length > 0 && allBulbsLit(allBulbIds, litBulbIds),
    distanceById,
  };
}

function allBulbsLit(allBulbIds: string[], litBulbIds: Set<string>) {
  return allBulbIds.every((id) => litBulbIds.has(id));
}
