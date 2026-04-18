import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { getOpenEdges } from '../lib/tileUtils';
import { useAppTheme } from '../lib/theme';
import type { Rotation, TileCell } from '../types';

interface Props {
  tile: TileCell;
  size: number;
  isConnected: boolean;
  onRotate: (id: string, newRotation: Rotation) => void;
}

const WIRE_STROKE = 6;
const CENTER_R = 4;
const SPECIAL_R_RATIO = 0.22;

export function TileComponent({ tile, size, isConnected, onRotate }: Props) {
  const { colors } = useAppTheme();
  const targetAngle = useRef<number>(tile.rotation);
  const accumulatedAngle = useSharedValue<number>(tile.rotation);
  const shouldPulse = useSharedValue(isConnected && !tile.isPowerSource ? 1 : 0);
  const pulseOpacity = useSharedValue(1);
  const pressProgress = useSharedValue(0);

  useEffect(() => {
    shouldPulse.value = isConnected && !tile.isPowerSource ? 1 : 0;
  }, [isConnected, shouldPulse, tile.isPowerSource]);

  useEffect(() => {
    const normalizedTarget = ((targetAngle.current % 360) + 360) % 360;
    if (normalizedTarget === tile.rotation) return;

    let delta = tile.rotation - normalizedTarget;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    targetAngle.current += delta;
    accumulatedAngle.value = withTiming(targetAngle.current, { duration: 170 });
  }, [accumulatedAngle, tile.rotation]);

  useAnimatedReaction(
    () => shouldPulse.value,
    (active) => {
      if (active) {
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        );
      } else {
        cancelAnimation(pulseOpacity);
        pulseOpacity.value = withTiming(1, { duration: 200 });
      }
    },
  );

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${accumulatedAngle.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const tileShellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressProgress.value, [0, 1], [1, 0.96]) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressProgress.value, [0, 1], [0, 1]),
  }));

  const styles = useMemo(() => createStyles(colors), [colors]);

  function handlePress() {
    if (tile.isLocked) return;
    targetAngle.current += 90;
    accumulatedAngle.value = withTiming(targetAngle.current, { duration: 170 });
    onRotate(tile.id, (targetAngle.current % 360) as Rotation);
  }

  const baseEdges = getOpenEdges(tile.tileType, 0);
  const half = size / 2;
  const wireColor = tile.isPowerSource
    ? colors.powerSource
    : isConnected
      ? colors.wireConnected
      : colors.wireDisconnected;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        pressProgress.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        pressProgress.value = withTiming(0, { duration: 160 });
      }}
      style={{ width: size, height: size }}
    >
      <Animated.View entering={FadeIn.duration(180).delay((tile.row * 6 + tile.col) * 14)} style={[{ width: size, height: size }, tileShellStyle]}>
        <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Rect x={1} y={1} width={size - 2} height={size - 2} rx={3} fill={colors.gridCell} stroke={colors.cellBorder} strokeWidth={1} />
          <Rect
            x={2}
            y={2}
            width={size - 4}
            height={size - 4}
            rx={2}
            fill="transparent"
            stroke={tile.isPowerSource ? colors.powerSource : tile.isBulb ? colors.bulbLit : colors.surfaceElevated}
            strokeOpacity={tile.isPowerSource || tile.isBulb ? 0.2 : 0.1}
            strokeWidth={1}
          />
          <Circle cx={size * 0.18} cy={size * 0.18} r={1.2} fill={colors.textMuted} opacity={0.35} />
        </Svg>

        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />

        <Animated.View style={[styles.rotateLayer, rotateStyle]}>
          <Animated.View style={[styles.rotateLayer, pulseStyle]}>
            <Svg width={size} height={size}>
              {baseEdges.includes('top') && (
                <Line x1={half} y1={half} x2={half} y2={0} stroke={wireColor} strokeWidth={WIRE_STROKE} strokeLinecap="round" />
              )}
              {baseEdges.includes('right') && (
                <Line x1={half} y1={half} x2={size} y2={half} stroke={wireColor} strokeWidth={WIRE_STROKE} strokeLinecap="round" />
              )}
              {baseEdges.includes('bottom') && (
                <Line x1={half} y1={half} x2={half} y2={size} stroke={wireColor} strokeWidth={WIRE_STROKE} strokeLinecap="round" />
              )}
              {baseEdges.includes('left') && (
                <Line x1={half} y1={half} x2={0} y2={half} stroke={wireColor} strokeWidth={WIRE_STROKE} strokeLinecap="round" />
              )}

              <Circle cx={half} cy={half} r={CENTER_R} fill={wireColor} />
              <Circle cx={half} cy={half} r={CENTER_R + 2} fill="none" stroke={wireColor} strokeOpacity={0.18} strokeWidth={1} />

              {tile.isPowerSource && (
                <Circle cx={half} cy={half} r={size * SPECIAL_R_RATIO} fill="none" stroke={colors.powerSource} strokeWidth={3} />
              )}

              {tile.isBulb && (
                <Circle
                  cx={half}
                  cy={half}
                  r={size * SPECIAL_R_RATIO}
                  fill={isConnected ? colors.bulbLit : colors.bulbUnlit}
                  opacity={isConnected ? 1 : 0.6}
                />
              )}
            </Svg>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    glow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 3,
      backgroundColor: colors.ctaButton,
    },
    rotateLayer: {
      ...StyleSheet.absoluteFillObject,
    },
  });
}
