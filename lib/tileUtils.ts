import type { Direction, Rotation, TileType } from '../types';

export const OPPOSITE: Record<Direction, Direction> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export const DIR_TO_DELTA: Record<Direction, { row: number; col: number }> = {
  top: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  bottom: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

// Open edges for each tile type at rotation 0
const BASE_EDGES: Record<TileType, Direction[]> = {
  straight: ['left', 'right'],
  elbow: ['top', 'right'],
  't-junction': ['top', 'right', 'bottom'],
  cross: ['top', 'right', 'bottom', 'left'],
  'dead-end': ['top'],
  power: ['top', 'right', 'bottom', 'left'],
  bulb: ['top'],
};

function rotateDir(dir: Direction, steps: number): Direction {
  const dirs: Direction[] = ['top', 'right', 'bottom', 'left'];
  return dirs[((dirs.indexOf(dir) + steps) % 4 + 4) % 4];
}

export function getOpenEdges(tileType: TileType, rotation: Rotation): Direction[] {
  const steps = rotation / 90;
  return BASE_EDGES[tileType].map((dir) => rotateDir(dir, steps));
}

export function getTileTypeFromConnections(dirs: Set<Direction>): TileType {
  const count = dirs.size;
  if (count <= 1) return 'dead-end';
  if (count === 4) return 'cross';
  if (count === 3) return 't-junction';
  const [d1, d2] = [...dirs];
  return d1 === OPPOSITE[d2] ? 'straight' : 'elbow';
}

export function findRotationForEdges(tileType: TileType, targetEdges: Set<Direction>): Rotation {
  for (const rotation of [0, 90, 180, 270] as Rotation[]) {
    const edges = new Set(getOpenEdges(tileType, rotation));
    if (setsEqual(edges, targetEdges)) return rotation;
  }
  return 0;
}

// For single-edge tiles (dead-end, bulb): find rotation to point base edge ('top') toward dir
export function findRotationForSingleEdge(dir: Direction): Rotation {
  const dirs: Direction[] = ['top', 'right', 'bottom', 'left'];
  return (dirs.indexOf(dir) * 90) as Rotation;
}

function setsEqual(a: Set<Direction>, b: Set<Direction>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
