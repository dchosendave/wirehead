import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, type ComponentProps } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAppTheme } from '../../lib/theme';

interface SettingRowProps {
  iconName: ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

export function SettingRow({ iconName, label, description, value, onToggle }: SettingRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={iconName} size={18} color={colors.ctaButton} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.wireDisconnected, true: colors.ctaButton }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 64,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 12,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1 },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: 0.4,
    },
    description: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });
}
