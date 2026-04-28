import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessBackdrop } from '../components/complete/SuccessBackdrop';
import { COMPLETE_SCREEN_ANIMATION, MONOSPACE_FONT_FAMILY } from '../constants/ui-config';
import { useAppTheme } from '../lib/theme';

export default function CompleteScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 390 || height < 760;
  const isTablet = width >= 768;
  const shellWidth = isTablet ? Math.min(640, width - 72) : width - (isSmallPhone ? 28 : 36);
  const styles = useMemo(
    () => createStyles(colors, { isSmallPhone, isTablet }),
    [colors, isSmallPhone, isTablet],
  );

  const ringScale = useSharedValue(COMPLETE_SCREEN_ANIMATION.ringInitialScale);
  const ringOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(COMPLETE_SCREEN_ANIMATION.titleOffsetY);
  const detailOpacity = useSharedValue(0);
  const detailY = useSharedValue(COMPLETE_SCREEN_ANIMATION.detailOffsetY);
  const actionsOpacity = useSharedValue(0);
  const actionsY = useSharedValue(COMPLETE_SCREEN_ANIMATION.actionsOffsetY);

  useEffect(() => {
    ringScale.value = withSpring(1, { damping: 13, stiffness: 170, mass: 0.9 });
    ringOpacity.value = withTiming(1, { duration: COMPLETE_SCREEN_ANIMATION.ringFadeDurationMs, easing: Easing.out(Easing.quad) });
    titleOpacity.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.titleDelayMs,
      withTiming(1, { duration: COMPLETE_SCREEN_ANIMATION.titleDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    titleY.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.titleDelayMs,
      withTiming(0, { duration: COMPLETE_SCREEN_ANIMATION.titleDurationMs, easing: Easing.out(Easing.exp) }),
    );
    detailOpacity.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.detailDelayMs,
      withTiming(1, { duration: COMPLETE_SCREEN_ANIMATION.detailDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    detailY.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.detailDelayMs,
      withTiming(0, { duration: COMPLETE_SCREEN_ANIMATION.detailDurationMs, easing: Easing.out(Easing.exp) }),
    );
    actionsOpacity.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.actionsDelayMs,
      withTiming(1, { duration: COMPLETE_SCREEN_ANIMATION.actionsDurationMs, easing: Easing.out(Easing.cubic) }),
    );
    actionsY.value = withDelay(
      COMPLETE_SCREEN_ANIMATION.actionsDelayMs,
      withTiming(0, { duration: COMPLETE_SCREEN_ANIMATION.actionsDurationMs, easing: Easing.out(Easing.exp) }),
    );
  }, [actionsOpacity, actionsY, detailOpacity, detailY, ringOpacity, ringScale, titleOpacity, titleY]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    opacity: detailOpacity.value,
    transform: [{ translateY: detailY.value }],
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsY.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <SuccessBackdrop colors={colors} width={width} height={height} />
      <View style={styles.topBar}>
        <Text style={styles.kicker}>SECTOR CLEAR</Text>
        <Text style={styles.topMeta}>AUTO-SYNC COMPLETE</Text>
      </View>

      <View style={[styles.hero, { maxWidth: shellWidth, alignSelf: 'center' }]}>
        <Animated.View style={[styles.ring, ringStyle]}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={38} color={colors.success} />
          <Text style={styles.bulbIcon}>◉</Text>
        </Animated.View>
        <Animated.Text style={[styles.title, titleStyle]}>CIRCUIT STABLE</Animated.Text>
        <Animated.Text style={[styles.subtitle, detailStyle]}>
          All nodes are receiving power and the board is ready for the next sector.
        </Animated.Text>
        <Animated.View style={[styles.statRow, detailStyle]}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={styles.statValue}>STABLE</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>FLOW</Text>
            <Text style={styles.statValue}>100%</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>GRID</Text>
            <Text style={styles.statValue}>LIT</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.actions, actionsStyle, { maxWidth: shellWidth, alignSelf: 'center', width: '100%' }]}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.replace('/game')} activeOpacity={0.85}>
          <View style={styles.buttonPrimaryInner}>
            <Text style={styles.buttonPrimaryText}>NEXT LEVEL</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonGhost} onPress={() => router.replace('/home')} activeOpacity={0.85}>
          <Text style={styles.buttonGhostText}>RETURN HOME</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  layout: { isSmallPhone: boolean; isTablet: boolean },
) {
  const { isSmallPhone, isTablet } = layout;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'stretch',
      justifyContent: 'space-between',
      paddingHorizontal: isTablet ? 28 : isSmallPhone ? 14 : 18,
      paddingTop: isTablet ? 20 : 14,
      paddingBottom: isSmallPhone ? 14 : 18,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
    },
    topMeta: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.8,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    hero: {
      width: '100%',
      alignItems: 'flex-start',
      paddingTop: isTablet ? 28 : isSmallPhone ? 8 : 18,
      gap: isSmallPhone ? 12 : 14,
    },
    kicker: {
      fontSize: isTablet ? 12 : 11,
      color: colors.ctaButton,
      letterSpacing: isSmallPhone ? 1.8 : 2.2,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    ring: {
      width: isTablet ? 132 : isSmallPhone ? 96 : 112,
      height: isTablet ? 132 : isSmallPhone ? 96 : 112,
      borderRadius: isTablet ? 66 : isSmallPhone ? 48 : 56,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.success,
      shadowOpacity: 0.2,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 10 },
    },
    bulbIcon: {
      display: 'none',
    },
    title: {
      fontSize: isTablet ? 42 : isSmallPhone ? 30 : 36,
      fontWeight: '900',
      color: colors.success,
      letterSpacing: isSmallPhone ? 0.4 : 0.8,
      lineHeight: isTablet ? 46 : isSmallPhone ? 34 : 40,
    },
    subtitle: {
      fontSize: isTablet ? 16 : isSmallPhone ? 13 : 14,
      color: colors.textSecondary,
      lineHeight: isTablet ? 23 : isSmallPhone ? 18 : 20,
      maxWidth: isTablet ? 420 : isSmallPhone ? 280 : 320,
    },
    statRow: {
      flexDirection: 'row',
      gap: isSmallPhone ? 8 : 10,
      paddingTop: 8,
      flexWrap: 'wrap',
    },
    statBlock: {
      minWidth: isTablet ? 120 : isSmallPhone ? 82 : 96,
      paddingHorizontal: isSmallPhone ? 10 : 12,
      paddingVertical: isSmallPhone ? 9 : 10,
      borderRadius: isSmallPhone ? 14 : 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    statLabel: {
      fontSize: 9,
      color: colors.textMuted,
      letterSpacing: 1.4,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    statValue: {
      marginTop: 3,
      fontSize: isTablet ? 14 : isSmallPhone ? 12 : 13,
      color: colors.textPrimary,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    actions: {
      width: '100%',
      gap: isSmallPhone ? 8 : 10,
      paddingTop: 8,
    },
    buttonPrimary: {
      backgroundColor: colors.ctaButton,
      minHeight: isTablet ? 60 : isSmallPhone ? 52 : 56,
      borderRadius: isTablet ? 20 : isSmallPhone ? 16 : 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonPrimaryInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    buttonPrimaryText: {
      fontSize: isTablet ? 16 : isSmallPhone ? 14 : 15,
      fontWeight: '900',
      color: colors.background,
      letterSpacing: 1.8,
    },
    buttonGhost: {
      minHeight: isTablet ? 54 : isSmallPhone ? 48 : 50,
      borderRadius: isTablet ? 16 : 14,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonGhostText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 1.3,
    },
  });
}
