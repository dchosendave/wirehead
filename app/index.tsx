import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SPLASH_SCREEN_ANIMATION } from '../constants/ui-config';
import { useAppTheme } from '../lib/theme';

const { width: W, height: H } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const titleY = useSharedValue(SPLASH_SCREEN_ANIMATION.titleOffsetY);
  const titleOp = useSharedValue(0);
  const subOp = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: SPLASH_SCREEN_ANIMATION.iconFadeInDurationMs });
    iconScale.value = withSpring(1, { damping: 9, stiffness: 120 });

    titleOp.value = withDelay(
      SPLASH_SCREEN_ANIMATION.titleDelayMs,
      withTiming(1, { duration: SPLASH_SCREEN_ANIMATION.titleDurationMs }),
    );
    titleY.value = withDelay(
      SPLASH_SCREEN_ANIMATION.titleDelayMs,
      withTiming(0, { duration: SPLASH_SCREEN_ANIMATION.titleDurationMs }),
    );

    subOp.value = withDelay(
      SPLASH_SCREEN_ANIMATION.subtitleDelayMs,
      withTiming(1, { duration: SPLASH_SCREEN_ANIMATION.subtitleDurationMs }),
    );

    const timer = setTimeout(() => router.replace('/home'), SPLASH_SCREEN_ANIMATION.autoRouteDelayMs);
    return () => clearTimeout(timer);
  }, [iconOpacity, iconScale, router, subOp, titleOp, titleY]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOp.value }));

  return (
    <View style={styles.container}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.powerSource} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={colors.powerSource} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={W * 0.1} y={H * 0.25} width={W * 0.8} height={H * 0.25} fill="url(#glow)" />
      </Svg>

      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <MaterialCommunityIcons name="lightning-bolt-circle" size={80} color={colors.powerSource} />
        <Text style={styles.icon}>⚡</Text>
      </Animated.View>

      <Animated.Text style={[styles.title, titleStyle]}>WIREHEAD</Animated.Text>
      <Animated.Text style={[styles.tagline, subStyle]}>connect the circuit</Animated.Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    iconWrap: {
      shadowColor: colors.powerSource,
      shadowOpacity: 0.9,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 0 },
    },
    icon: {
      display: 'none',
    },
    title: {
      fontSize: 34,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: 10,
    },
    tagline: {
      fontSize: 13,
      color: colors.textSecondary,
      letterSpacing: 4,
      textTransform: 'lowercase',
      marginTop: 4,
    },
  });
}
