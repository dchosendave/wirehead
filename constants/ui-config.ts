import { Platform } from 'react-native';

export const MONOSPACE_FONT_FAMILY = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

export const GAME_SCREEN_LAYOUT = {
  gridPadding: 16,
  reservedVerticalSpace: 260,
};

export function getBoardTileSize(screenWidth: number, screenHeight: number, gridSize: number): number {
  return Math.floor(
    Math.min(
      (screenWidth - GAME_SCREEN_LAYOUT.gridPadding) / gridSize,
      (screenHeight - GAME_SCREEN_LAYOUT.reservedVerticalSpace) / gridSize,
    ),
  );
}

export const TILE_ANIMATION = {
  rotateDurationMs: 170,
  pressInDurationMs: 90,
  pressOutDurationMs: 160,
  fadeInDurationMs: 180,
  fadeInGridFactor: 6,
  fadeInStaggerMs: 14,
  pulseBrightDurationMs: 700,
  pulseDimDurationMs: 700,
  pulseResetDurationMs: 200,
};

export const TUTORIAL_ANIMATION = {
  cardEnterDurationMs: 260,
  cardEnterOffsetY: 26,
  cardEnterScale: 0.96,
  cardEnterSpringDamping: 15,
  cardEnterSpringStiffness: 160,
  cardScaleSpringDamping: 14,
  cardScaleSpringStiffness: 180,
  contentEnterDurationMs: 280,
  contentEnterOffsetY: 8,
};

export const SPLASH_SCREEN_ANIMATION = {
  iconFadeInDurationMs: 200,
  titleDelayMs: 350,
  titleDurationMs: 450,
  titleOffsetY: 16,
  subtitleDelayMs: 650,
  subtitleDurationMs: 400,
  autoRouteDelayMs: 2000,
};

export const HOME_SCREEN_ANIMATION = {
  heroDurationMs: 680,
  heroOffsetY: 20,
  telemetryDelayMs: 150,
  telemetryDurationMs: 620,
  telemetryOffsetY: 24,
  commandDelayMs: 280,
  commandDurationMs: 560,
  commandOffsetY: 24,
};

export const COMPLETE_SCREEN_ANIMATION = {
  ringInitialScale: 0.88,
  ringFadeDurationMs: 320,
  titleDelayMs: 120,
  titleDurationMs: 520,
  titleOffsetY: 22,
  detailDelayMs: 220,
  detailDurationMs: 480,
  detailOffsetY: 20,
  actionsDelayMs: 320,
  actionsDurationMs: 420,
  actionsOffsetY: 24,
};

export const AUDIO_FEEDBACK = {
  rotateVolume: 0.6,
  winVolume: 1.0,
};
