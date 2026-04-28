import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MONOSPACE_FONT_FAMILY } from '../../constants/ui-config';
import { useAppTheme } from '../../lib/theme';

interface GameHeaderProps {
  currentLevel: number;
  onHomePress: () => void;
}

export function GameHeader({ currentLevel, onHomePress }: GameHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onHomePress}
        accessibilityRole="button"
        accessibilityLabel="Back to main menu"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.ctaButton} />
        <Text style={styles.backLabel}>HOME</Text>
      </TouchableOpacity>
      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeLabel}>LEVEL</Text>
        <Text style={styles.levelBadgeValue}>{currentLevel}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    header: {
      width: '100%',
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      minHeight: 44,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
    backLabel: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 1.3,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    levelBadge: {
      alignItems: 'flex-end',
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    levelBadgeLabel: {
      fontSize: 9,
      color: colors.textMuted,
      letterSpacing: 1.4,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    levelBadgeValue: {
      marginTop: 2,
      fontSize: 17,
      fontWeight: '800',
      color: colors.wireConnected,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
  });
}
