import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ThemeColors } from '../../types';

interface SignalBackdropProps {
  colors: ThemeColors;
  width: number;
  height: number;
}

export function SignalBackdrop({ colors, width, height }: SignalBackdropProps) {
  const stroke = colors.panelStroke;

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="bgWash" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.background} />
          <Stop offset="100%" stopColor={colors.surface} />
        </LinearGradient>
        <RadialGradient id="powerGlow" cx="22%" cy="20%" r="45%">
          <Stop offset="0%" stopColor={colors.powerSource} stopOpacity="0.28" />
          <Stop offset="100%" stopColor={colors.powerSource} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="wireGlow" cx="82%" cy="74%" r="38%">
          <Stop offset="0%" stopColor={colors.wireConnected} stopOpacity="0.2" />
          <Stop offset="100%" stopColor={colors.wireConnected} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={height} fill="url(#bgWash)" />
      <Rect x={0} y={0} width={width} height={height} fill="url(#powerGlow)" />
      <Rect x={0} y={0} width={width} height={height} fill="url(#wireGlow)" />

      <Line x1={width * 0.08} y1={height * 0.18} x2={width * 0.42} y2={height * 0.18} stroke={stroke} strokeWidth={1} opacity={0.32} />
      <Line x1={width * 0.42} y1={height * 0.18} x2={width * 0.42} y2={height * 0.28} stroke={stroke} strokeWidth={1} opacity={0.32} />
      <Line x1={width * 0.42} y1={height * 0.28} x2={width * 0.62} y2={height * 0.28} stroke={stroke} strokeWidth={1} opacity={0.32} />
      <Line x1={width * 0.78} y1={height * 0.1} x2={width * 0.9} y2={height * 0.1} stroke={stroke} strokeWidth={1} opacity={0.24} />
      <Line x1={width * 0.84} y1={height * 0.1} x2={width * 0.84} y2={height * 0.22} stroke={stroke} strokeWidth={1} opacity={0.24} />
      <Line x1={width * 0.08} y1={height * 0.82} x2={width * 0.24} y2={height * 0.82} stroke={stroke} strokeWidth={1} opacity={0.32} />
      <Line x1={width * 0.24} y1={height * 0.82} x2={width * 0.24} y2={height * 0.92} stroke={stroke} strokeWidth={1} opacity={0.32} />
      <Line x1={width * 0.72} y1={height * 0.72} x2={width * 0.92} y2={height * 0.72} stroke={stroke} strokeWidth={1} opacity={0.28} />

      <Circle cx={width * 0.08} cy={height * 0.18} r={2.5} fill={colors.ctaButton} opacity={0.75} />
      <Circle cx={width * 0.42} cy={height * 0.18} r={2.5} fill={colors.ctaButton} opacity={0.5} />
      <Circle cx={width * 0.62} cy={height * 0.28} r={2.5} fill={colors.wireConnected} opacity={0.75} />
      <Circle cx={width * 0.24} cy={height * 0.82} r={2.5} fill={colors.ctaButton} opacity={0.45} />
      <Circle cx={width * 0.92} cy={height * 0.72} r={3} fill={colors.wireConnected} opacity={0.6} />
    </Svg>
  );
}
