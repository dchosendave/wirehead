export type TileType =
  | 'straight'
  | 'elbow'
  | 't-junction'
  | 'cross'
  | 'dead-end'
  | 'power'
  | 'bulb';

export type Rotation = 0 | 90 | 180 | 270;
export type Direction = 'top' | 'right' | 'bottom' | 'left';

export interface TileCell {
  id: string;
  row: number;
  col: number;
  tileType: TileType;
  rotation: Rotation;
  isLocked: boolean;
  isPowerSource: boolean;
  isBulb: boolean;
}
