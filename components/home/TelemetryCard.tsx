import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { MONOSPACE_FONT_FAMILY } from '../../constants/ui-config';
import type { ThemeColors } from '../../types';

interface TelemetryCardProps {
  colors: ThemeColors;
  label: string;
  value: string;
  hint: string;
  cardStyle?: ViewStyle;
}

export function TelemetryCard({ colors, label, value, hint, cardStyle }: TelemetryCardProps) {
  return (
    <View style={[styles.telemetryCard, { backgroundColor: colors.surface, borderColor: colors.panelStroke }, cardStyle]}>
      <Text style={[styles.telemetryLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.telemetryValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.telemetryHint, { color: colors.textSecondary }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: MONOSPACE_FONT_FAMILY,
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
