import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ThemeColors } from '../../types';

interface SuccessBackdropProps {
  colors: ThemeColors;
  width: number;
  height: number;
}

export function SuccessBackdrop({ colors, width, height }: SuccessBackdropProps) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="successGlow" cx="25%" cy="22%" r="45%">
          <Stop offset="0%" stopColor={colors.success} stopOpacity="0.24" />
          <Stop offset="100%" stopColor={colors.success} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="amberGlow" cx="82%" cy="76%" r="35%">
          <Stop offset="0%" stopColor={colors.wireConnected} stopOpacity="0.16" />
          <Stop offset="100%" stopColor={colors.wireConnected} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill="url(#successGlow)" />
      <Rect x={0} y={0} width={width} height={height} fill="url(#amberGlow)" />
      <Circle cx={width * 0.12} cy={height * 0.18} r={3} fill={colors.success} opacity={0.55} />
      <Circle cx={width * 0.78} cy={height * 0.24} r={2.5} fill={colors.ctaButton} opacity={0.45} />
      <Circle cx={width * 0.9} cy={height * 0.74} r={3.5} fill={colors.wireConnected} opacity={0.55} />
    </Svg>
  );
}
