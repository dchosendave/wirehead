import type { TileCell, TileType, Rotation, Direction } from '../types';
import {
  GENERATOR_FILLER_TYPES,
  GENERATOR_MIN_SCRAMBLED_TILE_RATIO,
  GENERATOR_ROTATIONS,
  getPowerSourcePosition,
} from '../constants/game-config';
import {
  OPPOSITE,
  DIR_TO_DELTA,
  getTileTypeFromConnections,
  findRotationForEdges,
  findRotationForSingleEdge,
} from './tileUtils';

// Seeded LCG random number generator
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getDirBetween(
  from: { row: number; col: number },
  to: { row: number; col: number },
): Direction {
  if (to.row < from.row) return 'top';
  if (to.row > from.row) return 'bottom';
  if (to.col > from.col) return 'right';
  return 'left';
}

// Randomized backtracking DFS from start to end, avoiding blockedIds (other bulbs)
function findPath(
  start: { row: number; col: number },
  end: { row: number; col: number },
  gridSize: number,
  rng: () => number,
  blockedIds: Set<string>,
): Array<{ row: number; col: number }> | null {
  const endKey = `${end.row}_${end.col}`;
  const visited = new Set<string>([`${start.row}_${start.col}`]);

  function dfs(
    pos: { row: number; col: number },
    path: Array<{ row: number; col: number }>,
  ): Array<{ row: number; col: number }> | null {
    if (`${pos.row}_${pos.col}` === endKey) return path;

    const dirs = shuffle(['top', 'right', 'bottom', 'left'] as Direction[], rng);
    for (const dir of dirs) {
      const delta = DIR_TO_DELTA[dir];
      const next = { row: pos.row + delta.row, col: pos.col + delta.col };
      const key = `${next.row}_${next.col}`;

      if (
        next.row >= 0 &&
        next.row < gridSize &&
        next.col >= 0 &&
        next.col < gridSize &&
        !visited.has(key) &&
        (key === endKey || !blockedIds.has(key))
      ) {
        visited.add(key);
        const result = dfs(next, [...path, next]);
        if (result) return result;
        visited.delete(key);
      }
    }
    return null;
  }

  return dfs(start, [start]);
}

export function generateLevel(
  gridSize: number,
  bulbCount: number,
  seed: number,
): { grid: TileCell[]; solutionRotations: Record<string, Rotation> } {
  const rng = createRng(seed);

  // Track which edges each cell uses for circuit paths
  const connections: Record<string, Set<Direction>> = {};
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      connections[`${r}_${c}`] = new Set();
    }
  }

  // Power source at center
  const { row: centerRow, col: centerCol } = getPowerSourcePosition(gridSize);
  const powerId = `${centerRow}_${centerCol}`;
  const powerPos = { row: centerRow, col: centerCol };

  // Place bulbs at random non-overlapping positions
  const available: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (r !== centerRow || c !== centerCol) available.push({ row: r, col: c });
    }
  }
  const bulbPositions = shuffle(available, rng).slice(0, bulbCount);
  const bulbIds = new Set(bulbPositions.map((p) => `${p.row}_${p.col}`));

  // Find a path from power source to each bulb, accumulating edge connections
  for (const bulbPos of bulbPositions) {
    const otherBulbs = new Set([...bulbIds].filter((id) => id !== `${bulbPos.row}_${bulbPos.col}`));
    const path = findPath(powerPos, bulbPos, gridSize, rng, otherBulbs);
    if (!path) continue;

    for (let i = 0; i < path.length - 1; i++) {
      const curr = path[i];
      const next = path[i + 1];
      const dir = getDirBetween(curr, next);
      connections[`${curr.row}_${curr.col}`].add(dir);
      connections[`${next.row}_${next.col}`].add(OPPOSITE[dir]);
    }
  }

  // Build tile grid from connection data
  const grid: TileCell[] = [];
  const solutionRotations: Record<string, Rotation> = {};

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = `${r}_${c}`;
      const cellDirs = connections[id];
      const isPowerSource = id === powerId;
      const isBulb = bulbIds.has(id);

      let tileType: TileType;
      let rotation: Rotation = 0;
      let isLocked = false;

      if (isPowerSource) {
        tileType = 'power';
        rotation = 0;
        isLocked = true;
      } else if (isBulb) {
        tileType = 'bulb';
        const dirs = [...cellDirs];
        rotation = dirs.length > 0 ? findRotationForSingleEdge(dirs[0]) : 0;
        isLocked = true;
      } else if (cellDirs.size > 0) {
        tileType = getTileTypeFromConnections(cellDirs);
        rotation = findRotationForEdges(tileType, cellDirs);
      } else {
        // Filler / decoy tile
        tileType = GENERATOR_FILLER_TYPES[Math.floor(rng() * GENERATOR_FILLER_TYPES.length)];
        rotation = GENERATOR_ROTATIONS[Math.floor(rng() * GENERATOR_ROTATIONS.length)];
      }

      solutionRotations[id] = rotation;
      grid.push({ id, row: r, col: c, tileType, rotation, isLocked, isPowerSource, isBulb });
    }
  }

  // Scramble non-locked tiles
  const nonLocked = grid.filter((cell) => !cell.isLocked);
  let scrambledCount = 0;

  for (const cell of nonLocked) {
    const newRot = GENERATOR_ROTATIONS[Math.floor(rng() * GENERATOR_ROTATIONS.length)];
    cell.rotation = newRot;
    if (newRot !== solutionRotations[cell.id]) scrambledCount++;
  }

  // Ensure at least 50% differ from solution
  const threshold = Math.ceil(nonLocked.length * GENERATOR_MIN_SCRAMBLED_TILE_RATIO);
  if (scrambledCount < threshold) {
    const atSolution = shuffle(
      nonLocked.filter((cell) => cell.rotation === solutionRotations[cell.id]),
      rng,
    );
    for (const cell of atSolution) {
      if (scrambledCount >= threshold) break;
      const others = GENERATOR_ROTATIONS.filter((r) => r !== solutionRotations[cell.id]);
      cell.rotation = others[Math.floor(rng() * others.length)];
      scrambledCount++;
    }
  }

  return { grid, solutionRotations };
}
