import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignalBackdrop } from '../components/home/SignalBackdrop';
import { TelemetryCard } from '../components/home/TelemetryCard';
import { DEFAULT_STATS } from '../constants/app-defaults';
import { HOME_SCREEN_ANIMATION, MONOSPACE_FONT_FAMILY } from '../constants/ui-config';
import { loadStats } from '../lib/storage';
import { useAppTheme } from '../lib/theme';
import type { Stats } from '../types';

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
  const heroY = useSharedValue(HOME_SCREEN_ANIMATION.heroOffsetY);
  const telemetryOp = useSharedValue(0);
  const telemetryY = useSharedValue(HOME_SCREEN_ANIMATION.telemetryOffsetY);
  const commandOp = useSharedValue(0);
  const commandY = useSharedValue(HOME_SCREEN_ANIMATION.commandOffsetY);

  useEffect(() => {
    loadStats().then(setStats);

    heroOp.value = withTiming(1, { duration: HOME_SCREEN_ANIMATION.heroDurationMs, easing: Easing.out(Easing.cubic) });
    heroY.value = withTiming(0, { duration: HOME_SCREEN_ANIMATION.heroDurationMs, easing: Easing.out(Easing.exp) });

    telemetryOp.value = withDelay(
      HOME_SCREEN_ANIMATION.telemetryDelayMs,
      withTiming(1, { duration: HOME_SCREEN_ANIMATION.telemetryDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    telemetryY.value = withDelay(
      HOME_SCREEN_ANIMATION.telemetryDelayMs,
      withTiming(0, { duration: HOME_SCREEN_ANIMATION.telemetryDurationMs, easing: Easing.out(Easing.exp) }),
    );

    commandOp.value = withDelay(
      HOME_SCREEN_ANIMATION.commandDelayMs,
      withTiming(1, { duration: HOME_SCREEN_ANIMATION.commandDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    commandY.value = withDelay(
      HOME_SCREEN_ANIMATION.commandDelayMs,
      withTiming(0, { duration: HOME_SCREEN_ANIMATION.commandDurationMs, easing: Easing.out(Easing.exp) }),
    );
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
      backgroundColor: colors.surface,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      backgroundColor: colors.surface,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    kicker: {
      fontSize: isTablet ? 12 : 11,
      color: colors.ctaButton,
      letterSpacing: isTablet ? 3.1 : isSmallPhone ? 2.2 : 2.8,
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      backgroundColor: colors.surface,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      backgroundColor: colors.surface,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
      textTransform: 'uppercase',
    },
    panelMeta: {
      fontSize: 10,
      color: colors.success,
      letterSpacing: 1.6,
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    telemetryValue: {
      fontSize: isUltraCompactHeight ? 13 : 15,
      fontWeight: '800',
      color: colors.textPrimary,
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      backgroundColor: colors.surface,
      marginBottom: 4,
    },
    commandCopy: {
      gap: isUltraCompactHeight ? 4 : 6,
    },
    commandLabel: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: isSmallPhone ? 1.5 : 2,
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      fontFamily: MONOSPACE_FONT_FAMILY,
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
      backgroundColor: colors.surfaceElevated,
    },
  });
}
