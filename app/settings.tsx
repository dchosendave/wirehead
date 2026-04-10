import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveSettings, loadSettings } from '../lib/storage';
import { useAppTheme } from '../lib/theme';
import type { Settings, ThemeMode } from '../types';

const DEFAULT: Settings = {
  hapticsEnabled: true,
  soundEnabled: true,
  tutorialCompleted: false,
  themeMode: 'dark',
};

interface RowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

function SettingRow({ icon: _icon, label, description, value, onToggle }: RowProps) {
  const { colors } = useAppTheme();
  const rowStyles = useMemo(() => createRowStyles(colors), [colors]);
  const iconName: ComponentProps<typeof MaterialCommunityIcons>['name'] =
    label === 'Haptics'
      ? 'vibrate'
      : label === 'Sound'
        ? 'volume-high'
        : 'tune';

  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.iconWrap}>
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={colors.ctaButton}
        />
      </View>
      <View style={rowStyles.text}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.description}>{description}</Text>
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

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, mode, setThemeMode } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setThemeMode(loaded.themeMode);
    });
  }, [setThemeMode]);

  async function toggle(key: 'hapticsEnabled' | 'soundEnabled') {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function toggleTheme() {
    const updatedTheme: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, themeMode: updatedTheme };
    setSettings(updated);
    setThemeMode(updatedTheme);
    await saveSettings(updated);
  }

  async function replayTutorial() {
    const updated = { ...settings, tutorialCompleted: false };
    setSettings(updated);
    await saveSettings(updated);
    router.replace('/game');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Ionicons name="chevron-back" size={20} color={colors.ctaButton} />
          <Text style={styles.backLabel}>HOME</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SYSTEM / SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Control preferences</Text>
          <Text style={styles.introText}>Tune feedback, switch theme, and replay the walkthrough from the panel below.</Text>
        </View>

        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.section}>
          <View style={styles.themeRow}>
            <View style={styles.themeRowText}>
              <Text style={styles.themeRowLabel}>Dark mode</Text>
              <Text style={styles.themeRowDescription}>Use a darker palette for low-light play.</Text>
            </View>
            <View style={styles.themeBadge}>
              <Text style={styles.themeBadgeText}>{mode === 'dark' ? 'ON' : 'OFF'}</Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.wireDisconnected, true: colors.ctaButton }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.section}>
          <SettingRow
            icon="📳"
            label="Haptics"
            description="Vibrate on tile rotate and level complete"
            value={settings.hapticsEnabled}
            onToggle={() => toggle('hapticsEnabled')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="🔊"
            label="Sound"
            description="Play audio on rotate and circuit complete"
            value={settings.soundEnabled}
            onToggle={() => toggle('soundEnabled')}
          />
        </View>

        <Text style={styles.sectionLabel}>GAMEPLAY</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={replayTutorial} activeOpacity={0.7}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="gamepad-variant-outline" size={18} color={colors.ctaButton} />
              <Text style={styles.actionIcon}>🎮</Text>
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Replay Tutorial</Text>
              <Text style={styles.actionDescription}>Show the first-play walkthrough again</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.version, { paddingBottom: insets.bottom + 16 }]}>WIREHEAD · v1.0.0</Text>
    </View>
  );
}

function createRowStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
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
    icon: { fontSize: 18 },
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

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    backButton: {
      minHeight: 44,
      borderRadius: 999,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerSpacer: {
      width: 80,
    },
    backIcon: {
      display: 'none',
    },
    backLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 1.2,
      fontFamily: 'monospace',
    },
    title: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 1.6,
      fontFamily: 'monospace',
    },
    content: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 4,
      gap: 10,
    },
    intro: {
      marginBottom: 4,
      gap: 4,
    },
    introTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    introText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 2.4,
      fontFamily: 'monospace',
      marginTop: 14,
      marginLeft: 2,
      marginBottom: 4,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      overflow: 'hidden',
    },
    themeRow: {
      minHeight: 64,
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    themeRowText: {
      flex: 1,
      gap: 2,
    },
    themeRowLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: 0.4,
    },
    themeRowDescription: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    themeBadge: {
      minWidth: 40,
      height: 26,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      paddingHorizontal: 8,
    },
    themeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 1,
      fontFamily: 'monospace',
    },
    divider: {
      height: 1,
      backgroundColor: colors.panelStroke,
      marginHorizontal: 16,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 64,
      paddingVertical: 12,
      paddingHorizontal: 14,
      gap: 12,
    },
    actionIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.panelStroke,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIcon: { display: 'none' },
    actionText: { flex: 1 },
    actionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: 0.4,
    },
    actionDescription: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    chevron: {
      display: 'none',
    },
    version: {
      display: 'none',
      textAlign: 'center',
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 2,
      fontFamily: 'monospace',
      paddingTop: 8,
    },
    versionAlt: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 2,
      fontFamily: 'monospace',
      paddingTop: 8,
    },
  });
}
