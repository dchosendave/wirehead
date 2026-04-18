import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MONOSPACE_FONT_FAMILY, TUTORIAL_ANIMATION } from '../constants/ui-config';
import { useAppTheme } from '../lib/theme';

interface Props {
  visible: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '↻',
    title: 'Rotate Tiles',
    description: 'Tap any tile to rotate it 90° clockwise. Locked tiles (power source and bulbs) cannot be rotated.',
  },
  {
    icon: '⚡ → 💡',
    title: 'Complete the Circuit',
    description: 'Connect the power source to every light bulb by forming a continuous wire path.',
  },
  {
    icon: '—|—',
    title: 'Align the Wires',
    description: 'Two adjacent tiles only connect when both of their wire ends face each other. A gap anywhere breaks the circuit.',
  },
] as const;

export function TutorialOverlay({ visible, onComplete }: Props) {
  const { colors } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 390 || height < 760;
  const isTablet = width >= 768;
  const styles = useMemo(
    () => createStyles(colors, width, { isSmallPhone, isTablet }),
    [colors, width, isSmallPhone, isTablet],
  );
  const [step, setStep] = useState(0);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(TUTORIAL_ANIMATION.cardEnterOffsetY);
  const cardScale = useSharedValue(TUTORIAL_ANIMATION.cardEnterScale);
  const contentOpacity = useSharedValue(1);
  const contentY = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    cardOpacity.value = withTiming(1, {
      duration: TUTORIAL_ANIMATION.cardEnterDurationMs,
      easing: Easing.out(Easing.quad),
    });
    cardY.value = withSpring(0, {
      damping: TUTORIAL_ANIMATION.cardEnterSpringDamping,
      stiffness: TUTORIAL_ANIMATION.cardEnterSpringStiffness,
    });
    cardScale.value = withSpring(1, {
      damping: TUTORIAL_ANIMATION.cardScaleSpringDamping,
      stiffness: TUTORIAL_ANIMATION.cardScaleSpringStiffness,
    });
  }, [cardOpacity, cardScale, cardY, visible]);

  useEffect(() => {
    if (!visible) return;

    contentOpacity.value = 0;
    contentY.value = TUTORIAL_ANIMATION.contentEnterOffsetY;
    contentOpacity.value = withTiming(1, {
      duration: TUTORIAL_ANIMATION.contentEnterDurationMs,
      easing: Easing.out(Easing.cubic),
    });
    contentY.value = withTiming(0, {
      duration: TUTORIAL_ANIMATION.contentEnterDurationMs,
      easing: Easing.out(Easing.exp),
    });
  }, [contentOpacity, contentY, step, visible]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(0);
      onComplete();
    }
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }, { scale: cardScale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.handle} />

          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <Animated.View style={[styles.contentWrap, contentStyle]}>
          <Text style={styles.kicker}>FIELD MANUAL</Text>
          <View style={styles.iconBadge}>
            {step === 0 && <MaterialCommunityIcons name="rotate-right" size={24} color={colors.ctaButton} />}
            {step === 1 && <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.wireConnected} />}
            {step === 2 && <Ionicons name="git-branch-outline" size={22} color={colors.powerSource} />}
          </View>
          <Text style={styles.icon}>{current.icon}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <View style={styles.buttonInner}>
              <Text style={styles.buttonTextAlt}>{isLast ? "Let's Play" : 'Next'}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.background} />
            </View>
            <Text style={styles.buttonText}>{isLast ? "Let's Play! →" : 'Next'}</Text>
          </TouchableOpacity>
          </Animated.View>

          {!isLast && (
            <TouchableOpacity style={styles.skip} onPress={() => { setStep(0); onComplete(); }}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(
  colors: ReturnType<typeof useAppTheme>['colors'],
  width: number,
  layout: { isSmallPhone: boolean; isTablet: boolean },
) {
  const { isSmallPhone, isTablet } = layout;
  const cardWidth = Math.min(width - (isSmallPhone ? 24 : 32), isTablet ? 460 : 420);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(4,7,11,0.84)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    card: {
      width: cardWidth,
      backgroundColor: colors.surface,
      borderRadius: isTablet ? 28 : isSmallPhone ? 20 : 24,
      paddingHorizontal: isSmallPhone ? 16 : isTablet ? 24 : 20,
      paddingTop: isSmallPhone ? 12 : 14,
      paddingBottom: isSmallPhone ? 18 : 22,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: colors.panelStroke,
      gap: 12,
    },
    contentWrap: {
      width: '100%',
      alignItems: 'flex-start',
      gap: isSmallPhone ? 10 : 12,
    },
    handle: {
      width: 44,
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.panelStroke,
      alignSelf: 'center',
    },
    dots: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 2,
      marginBottom: 2,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.wireDisconnected,
    },
    dotActive: {
      backgroundColor: colors.ctaButton,
      width: 24,
    },
    kicker: {
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 2,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    iconBadge: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    icon: {
      display: 'none',
    },
    title: {
      fontSize: isTablet ? 24 : isSmallPhone ? 20 : 22,
      fontWeight: '900',
      color: colors.textPrimary,
      textAlign: 'left',
      letterSpacing: 0.4,
    },
    description: {
      fontSize: isTablet ? 15 : isSmallPhone ? 13 : 14,
      color: colors.textSecondary,
      textAlign: 'left',
      lineHeight: isTablet ? 22 : isSmallPhone ? 19 : 21,
    },
    button: {
      backgroundColor: colors.ctaButton,
      minHeight: isSmallPhone ? 46 : 50,
      borderRadius: isSmallPhone ? 12 : 14,
      marginTop: 8,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    buttonText: {
      display: 'none',
    },
    buttonTextAlt: {
      fontSize: 15,
      fontWeight: '900',
      color: colors.background,
      letterSpacing: 1,
    },
    skip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: 6,
    },
    skipText: {
      fontSize: 14,
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
  });
}
