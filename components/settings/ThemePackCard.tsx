import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MONOSPACE_FONT_FAMILY } from '../../constants/ui-config';
import { useAppTheme } from '../../lib/theme';

interface ThemePackCardProps {
  label: string;
  description: string;
  swatches: string[];
  selected: boolean;
  onPress: () => void;
}

export function ThemePackCard({ label, description, swatches, selected, onPress }: ThemePackCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {selected ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ACTIVE</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.swatchRow}>
        {swatches.map((swatch, index) => (
          <View key={`${label}-${index}`} style={[styles.swatch, { backgroundColor: swatch }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
    },
    cardSelected: {
      borderColor: colors.ctaButton,
      shadowColor: colors.ctaButton,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.4,
    },
    description: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.textSecondary,
    },
    badge: {
      minHeight: 24,
      borderRadius: 999,
      paddingHorizontal: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.ctaButton,
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.1,
      color: colors.background,
      fontFamily: MONOSPACE_FONT_FAMILY,
    },
    swatchRow: {
      flexDirection: 'row',
      gap: 8,
    },
    swatch: {
      width: 22,
      height: 22,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.panelStroke,
    },
  });
}
