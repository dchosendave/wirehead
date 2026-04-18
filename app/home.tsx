import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { loadStats } from '../lib/storage';
import { useAppTheme } from '../lib/theme';
import type { Stats } from '../types';

const MONO: string = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

const DEFAULT_STATS: Stats = { totalLevelsCompleted: 0, highestLevelReached: 1 };

function SignalBackdrop({
  colors,
  width,
  height,
}: {
  colors: ReturnType<typeof useAppTheme>['colors'];
  width: number;
  height: number;
}) {
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

function TelemetryCard({
  colors,
  label,
  value,
  hint,
  cardStyle,
}: {
  colors: ReturnType<typeof useAppTheme>['colors'];
  label: string;
  value: string;
  hint: string;
  cardStyle?: ViewStyle;
}) {
  return (
    <View style={[stylesShared.telemetryCard, { backgroundColor: colors.surface, borderColor: colors.panelStroke }, cardStyle]}>
      <Text style={[stylesShared.telemetryLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[stylesShared.telemetryValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[stylesShared.telemetryHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 390 || height < 760;
  const isCompactHeight = height < 780;
  const isUltraCompactHeight = height < 700;
  const isTablet = width >= 768;
  const shellWidth = isTablet ? Math.min(760, width - 64) : width - (isSmallPhone ? 28 : 36);
  const telemetryCardWidth = isTablet
    ? Math.floor((shellWidth - 32 - 30) / 4)
    : Math.floor((shellWidth - 32 - (isSmallPhone ? 8 : 10)) / 2);
  const styles = useMemo(
    () => createStyles(colors, { isSmallPhone, isCompactHeight, isUltraCompactHeight, isTablet }),
    [colors, isCompactHeight, isSmallPhone, isTablet, isUltraCompactHeight],
  );
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  const heroOp = useSharedValue(0);
  const heroY = useSharedValue(20);
  const telemetryOp = useSharedValue(0);
  const telemetryY = useSharedValue(24);
  const commandOp = useSharedValue(0);
  const commandY = useSharedValue(24);

  useEffect(() => {
    loadStats().then(setStats);

    heroOp.value = withTiming(1, { duration: 680, easing: Easing.out(Easing.cubic) });
    heroY.value = withTiming(0, { duration: 680, easing: Easing.out(Easing.exp) });

    telemetryOp.value = withDelay(150, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
    telemetryY.value = withDelay(150, withTiming(0, { duration: 620, easing: Easing.out(Easing.exp) }));

    commandOp.value = withDelay(280, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
    commandY.value = withDelay(280, withTiming(0, { duration: 560, easing: Easing.out(Easing.exp) }));
  }, [commandOp, commandY, heroOp, heroY, telemetryOp, telemetryY]);

  const heroStyle = useAnimatedStyle(() => ({ opacity: heroOp.value, transform: [{ translateY: heroY.value }] }));
  const telemetryStyle = useAnimatedStyle(() => ({ opacity: telemetryOp.value, transform: [{ translateY: telemetryY.value }] }));
  const commandStyle = useAnimatedStyle(() => ({ opacity: commandOp.value, transform: [{ translateY: commandY.value }] }));

  const isNewGame = stats.highestLevelReached <= 1 && stats.totalLevelsCompleted === 0;
  const signalStrength = Math.min(99, stats.totalLevelsCompleted * 3 + 4);
  const runState = isNewGame ? 'BOOT' : 'LIVE';
  const verticalInset = insets.bottom + (isSmallPhone ? 8 : 12);
  const showCompactTelemetry = height < 900 && !isTablet;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SignalBackdrop colors={colors} width={width} height={height} />

      <TouchableOpacity
        style={[styles.settingsButton, { top: insets.top + 14 }]}
        onPress={() => router.push('/settings')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.82}
      >
        <Text style={styles.settingsButtonIcon}>⚙</Text>
        <Ionicons name="settings-outline" size={16} color={colors.ctaButton} />
        <Text style={styles.settingsButtonText}>SYSTEM</Text>
      </TouchableOpacity>
      
      <View style={[styles.shell, { maxWidth: shellWidth, paddingTop: insets.top, paddingBottom: verticalInset }]}>
        <View style={styles.content}>
          <Animated.View style={[styles.heroWrap, heroStyle]}>
            <View style={styles.statusChip}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>FIELD SYSTEM ONLINE</Text>
            </View>

            <Text style={styles.kicker}>WIREHEAD FIELD UNIT</Text>
            <Text style={styles.title}>Route{'\n'}The Circuit</Text>
            <Text style={styles.tagline} numberOfLines={isUltraCompactHeight || showCompactTelemetry ? 2 : 3}>
              Restore current across the board, stabilize each relay, and keep every node illuminated.
            </Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaCard}>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.wireConnected} />
                <View style={styles.heroMetaText}>
                  <Text style={styles.heroMetaLabel}>Signal</Text>
                  <Text style={styles.heroMetaValue}>{signalStrength}% stable</Text>
                </View>
              </View>

              <View style={styles.heroMetaCard}>
                <Ionicons name="radio-outline" size={18} color={colors.ctaButton} />
                <View style={styles.heroMetaText}>
                  <Text style={styles.heroMetaLabel}>Run state</Text>
                  <Text style={styles.heroMetaValue}>{runState}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.telemetryPanel, telemetryStyle]}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelKicker}>Mission Telemetry</Text>
              <Text style={styles.panelMeta}>SYNCED</Text>
            </View>
            {!showCompactTelemetry ? (
              <View style={styles.telemetryGrid}>
                <TelemetryCard colors={colors} label="Sector" value={`${stats.highestLevelReached}`} hint="highest unlocked board" cardStyle={{ width: telemetryCardWidth }} />
                <TelemetryCard colors={colors} label="Runs" value={`${stats.totalLevelsCompleted}`} hint="successful restorations" cardStyle={{ width: telemetryCardWidth }} />
                <TelemetryCard colors={colors} label="Clearance" value={`${signalStrength}%`} hint="network charge stability" cardStyle={{ width: telemetryCardWidth }} />
                <TelemetryCard colors={colors} label="Mode" value={isNewGame ? 'Initiate' : 'Resume'} hint="recommended next action" cardStyle={{ width: telemetryCardWidth }} />
              </View>
            ) : null}
            <View style={styles.telemetryRow}>
              <View style={styles.telemetryMetric}>
                <Text style={styles.telemetryLabel}>Sector</Text>
                <Text style={styles.telemetryValue}>{stats.highestLevelReached}</Text>
              </View>
              <View style={styles.telemetryMetric}>
                <Text style={styles.telemetryLabel}>Runs</Text>
                <Text style={styles.telemetryValue}>{stats.totalLevelsCompleted === 0 ? '--' : `${stats.totalLevelsCompleted}`}</Text>
              </View>
              <View style={styles.telemetryMetric}>
                <Text style={styles.telemetryLabel}>Mode</Text>
                <Text style={styles.telemetryValue}>{isNewGame ? 'INIT' : 'LIVE'}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.commandPanel, commandStyle]}>
          <View style={styles.commandCopy}>
            <Text style={styles.commandLabel}>Deployment</Text>
            <Text style={styles.commandTitle}>
              {isNewGame ? 'Boot a fresh circuit run' : 'Continue the live board'}
            </Text>
            <Text style={styles.commandHint} numberOfLines={isUltraCompactHeight || showCompactTelemetry ? 2 : 3}>
              Open the control grid, rotate the wire modules, and restore flow to every lamp.
            </Text>
          </View>

          <TouchableOpacity style={styles.playButton} onPress={() => router.push('/game')} activeOpacity={0.85}>
            <View style={styles.playButtonCopy}>
              <Text style={styles.playEyebrow}>Command</Text>
              <Text style={styles.playText}>{isNewGame ? 'Initiate Run' : 'Resume Run'}</Text>
            </View>
            <View style={styles.playArrow}>
              <Ionicons name="arrow-forward" size={20} color={colors.background} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const stylesShared = StyleSheet.create({
  telemetryCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  telemetryLabel: {
    fontSize: 10,
    letterSpacing: 1.8,
    fontFamily: MONO,
    textTransform: 'uppercase',
  },
  telemetryValue: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 24,
  },
  telemetryHint: {
    fontSize: 11,
    lineHeight: 16,
  },
});

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  layout: { isSmallPhone: boolean; isCompactHeight: boolean; isUltraCompactHeight: boolean; isTablet: boolean },
) {
  const { isSmallPhone, isCompactHeight, isUltraCompactHeight, isTablet } = layout;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isTablet ? 28 : isSmallPhone ? 14 : 18,
    },
    shell: {
      flex: 1,
      width: '100%',
      alignSelf: 'center',
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: isTablet ? 'center' : 'flex-start',
      gap: isTablet ? 28 : isUltraCompactHeight ? 12 : isSmallPhone ? 16 : 22,
      paddingTop: isTablet ? 100 : isUltraCompactHeight ? 52 : isCompactHeight ? 60 : isSmallPhone ? 72 : 88,
    },
    settingsButton: {
      position: 'absolute',
      right: 18,
      zIndex: 10,
      minHeight: 42,
      borderRadius: 999,
      paddingHorizontal: isSmallPhone ? 12 : 14,
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 24, 42, 0.78)',
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    settingsButtonIcon: {
      display: 'none',
    },
    settingsButtonText: {
      fontSize: 11,
      color: colors.textPrimary,
      letterSpacing: isSmallPhone ? 1.4 : 1.8,
      fontFamily: MONO,
    },
    logoArea: {
      alignItems: 'flex-start',
      gap: 6,
      maxWidth: 320,
    },
    statusChip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: isUltraCompactHeight ? 28 : isSmallPhone ? 30 : 34,
      borderRadius: 999,
      paddingHorizontal: isUltraCompactHeight ? 9 : isSmallPhone ? 10 : 12,
      backgroundColor: 'rgba(12, 19, 34, 0.76)',
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
    },
    statusText: {
      fontSize: 10,
      color: colors.textPrimary,
      letterSpacing: isSmallPhone ? 1.2 : 1.6,
      fontFamily: MONO,
    },
    kicker: {
      fontSize: isTablet ? 12 : 11,
      color: colors.ctaButton,
      letterSpacing: isTablet ? 3.1 : isSmallPhone ? 2.2 : 2.8,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: isTablet ? 62 : isUltraCompactHeight ? 34 : isCompactHeight ? 38 : isSmallPhone ? 40 : 48,
      fontWeight: '900',
      color: colors.textPrimary,
      lineHeight: isTablet ? 64 : isUltraCompactHeight ? 36 : isCompactHeight ? 40 : isSmallPhone ? 42 : 50,
      letterSpacing: isSmallPhone ? -0.6 : -1,
      textTransform: 'uppercase',
      maxWidth: isTablet ? 420 : isUltraCompactHeight ? 236 : isSmallPhone ? 280 : 320,
    },
    tagline: {
      fontSize: isTablet ? 17 : isUltraCompactHeight ? 12 : isSmallPhone ? 13 : 15,
      color: colors.textSecondary,
      lineHeight: isTablet ? 26 : isUltraCompactHeight ? 17 : isSmallPhone ? 19 : 22,
      maxWidth: isTablet ? 420 : isUltraCompactHeight ? 260 : isSmallPhone ? 292 : 330,
    },
    heroWrap: {
      gap: isUltraCompactHeight ? 10 : isSmallPhone ? 12 : 14,
    },
    heroMetaRow: {
      flexDirection: 'row',
      gap: isUltraCompactHeight ? 8 : 10,
      flexWrap: 'wrap',
      paddingTop: isUltraCompactHeight ? 2 : 4,
    },
    heroMetaCard: {
      minWidth: isTablet ? 170 : isUltraCompactHeight ? 124 : isSmallPhone ? 136 : 148,
      flexDirection: 'row',
      gap: isUltraCompactHeight ? 8 : 10,
      alignItems: 'center',
      paddingHorizontal: isUltraCompactHeight ? 10 : isSmallPhone ? 12 : 14,
      paddingVertical: isUltraCompactHeight ? 8 : isSmallPhone ? 10 : 12,
      borderRadius: 18,
      backgroundColor: 'rgba(16, 24, 42, 0.76)',
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    heroMetaText: {
      gap: 2,
    },
    heroMetaLabel: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.4,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    heroMetaValue: {
      fontSize: isTablet ? 15 : isUltraCompactHeight ? 12 : isSmallPhone ? 13 : 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    telemetryPanel: {
      flexShrink: 1,
      gap: isUltraCompactHeight ? 10 : isSmallPhone ? 12 : 14,
      paddingHorizontal: isUltraCompactHeight ? 12 : isSmallPhone ? 12 : isTablet ? 20 : 16,
      paddingVertical: isUltraCompactHeight ? 12 : isSmallPhone ? 14 : isTablet ? 22 : 18,
      borderRadius: isTablet ? 30 : isSmallPhone ? 22 : 26,
      backgroundColor: 'rgba(10, 15, 28, 0.84)',
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    panelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    panelKicker: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: isSmallPhone ? 1.5 : 2.1,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    panelMeta: {
      fontSize: 10,
      color: colors.success,
      letterSpacing: 1.6,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    telemetryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isSmallPhone ? 8 : 10,
    },
    telemetryRow: {
      display: isCompactHeight && !isTablet ? 'flex' : 'none',
      flexDirection: 'row',
      gap: isUltraCompactHeight ? 10 : 12,
      flexWrap: 'wrap',
      paddingTop: 2,
    },
    telemetryMetric: {
      minWidth: isUltraCompactHeight ? 72 : 84,
      flexGrow: 1,
    },
    telemetryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1.8,
      fontFamily: MONO,
    },
    telemetryValue: {
      fontSize: isUltraCompactHeight ? 13 : 15,
      fontWeight: '800',
      color: colors.textPrimary,
      fontFamily: MONO,
    },
    commandStrip: {
      display: 'none',
    },
    commandPanel: {
      gap: isUltraCompactHeight ? 10 : isSmallPhone ? 12 : 14,
      padding: isUltraCompactHeight ? 12 : isSmallPhone ? 14 : isTablet ? 22 : 18,
      borderRadius: isTablet ? 30 : isSmallPhone ? 22 : 28,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      backgroundColor: 'rgba(12, 19, 34, 0.88)',
      marginBottom: 4,
    },
    commandCopy: {
      gap: isUltraCompactHeight ? 4 : 6,
    },
    commandLabel: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: isSmallPhone ? 1.5 : 2,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    commandTitle: {
      fontSize: isTablet ? 28 : isUltraCompactHeight ? 18 : isSmallPhone ? 20 : 24,
      fontWeight: '900',
      color: colors.textPrimary,
      lineHeight: isTablet ? 32 : isUltraCompactHeight ? 22 : isSmallPhone ? 24 : 28,
      maxWidth: isTablet ? 440 : isUltraCompactHeight ? 220 : isSmallPhone ? 240 : 280,
    },
    commandHint: {
      fontSize: isTablet ? 14 : isUltraCompactHeight ? 11 : isSmallPhone ? 12 : 13,
      lineHeight: isTablet ? 21 : isUltraCompactHeight ? 16 : isSmallPhone ? 17 : 19,
      color: colors.textSecondary,
      maxWidth: isTablet ? 460 : isUltraCompactHeight ? 240 : isSmallPhone ? 260 : 300,
    },
    playButton: {
      minHeight: isTablet ? 70 : isUltraCompactHeight ? 54 : isSmallPhone ? 58 : 64,
      borderRadius: isTablet ? 24 : isSmallPhone ? 18 : 22,
      paddingHorizontal: isUltraCompactHeight ? 12 : isSmallPhone ? 14 : 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.ctaButton,
      shadowColor: colors.ctaButton,
      shadowOpacity: 0.24,
      shadowRadius: isTablet ? 20 : 18,
      shadowOffset: { width: 0, height: isSmallPhone ? 8 : 10 },
      elevation: 10,
    },
    playButtonCopy: {
      gap: 2,
    },
    playEyebrow: {
      fontSize: 10,
      color: colors.background,
      letterSpacing: 1.8,
      fontFamily: MONO,
      textTransform: 'uppercase',
    },
    playText: {
      fontSize: isTablet ? 18 : isUltraCompactHeight ? 14 : isSmallPhone ? 15 : 17,
      fontWeight: '900',
      color: colors.background,
      textTransform: 'uppercase',
    },
    playArrow: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(6, 9, 20, 0.12)',
    },
  });
}
