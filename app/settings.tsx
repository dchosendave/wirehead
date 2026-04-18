import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME_OPTIONS } from '../constants';
import { loadSettings, saveSettings } from '../lib/storage';
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

interface ThemePackCardProps {
  label: string;
  description: string;
  swatches: string[];
  selected: boolean;
  onPress: () => void;
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
        <MaterialCommunityIcons name={iconName} size={18} color={colors.ctaButton} />
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

function ThemePackCard({ label, description, swatches, selected, onPress }: ThemePackCardProps) {
  const { colors } = useAppTheme();
  const cardStyles = useMemo(() => createThemeCardStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[cardStyles.card, selected && cardStyles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={cardStyles.header}>
        <View style={cardStyles.copy}>
          <Text style={cardStyles.label}>{label}</Text>
          <Text style={cardStyles.description}>{description}</Text>
        </View>
        {selected ? (
          <View style={cardStyles.badge}>
            <Text style={cardStyles.badgeText}>ACTIVE</Text>
          </View>
        ) : null}
      </View>

      <View style={cardStyles.swatchRow}>
        {swatches.map((swatch, index) => (
          <View key={`${label}-${index}`} style={[cardStyles.swatch, { backgroundColor: swatch }]} />
        ))}
      </View>
    </TouchableOpacity>
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

  async function selectTheme(themeMode: ThemeMode) {
    if (themeMode === mode) return;

    const updated = { ...settings, themeMode };
    setSettings(updated);
    setThemeMode(themeMode);
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
          <Ionicons name="chevron-back" size={20} color={colors.ctaButton} />
          <Text style={styles.backLabel}>HOME</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SYSTEM / SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentInner, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Control preferences</Text>
          <Text style={styles.introText}>
            Tune feedback, choose a cosmetic theme pack, and replay the walkthrough from the panel below.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.section}>
          <View style={styles.themeSectionIntro}>
            <Text style={styles.themeSectionTitle}>Theme packs</Text>
            <Text style={styles.themeSectionDescription}>
              Cosmetic only. These packs change the presentation of the app without altering puzzle rules or level logic.
            </Text>
          </View>

          <View style={styles.themeList}>
            {THEME_OPTIONS.map((theme) => (
              <ThemePackCard
                key={theme.id}
                label={theme.label}
                description={theme.description}
                swatches={[
                  theme.colors.background,
                  theme.colors.surface,
                  theme.colors.powerSource,
                  theme.colors.wireConnected,
                ]}
                selected={mode === theme.id}
                onPress={() => selectTheme(theme.id)}
              />
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.section}>
          <SettingRow
            icon="mobile"
            label="Haptics"
            description="Vibrate on tile rotate and level complete"
            value={settings.hapticsEnabled}
            onToggle={() => toggle('hapticsEnabled')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="volume"
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
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Replay Tutorial</Text>
              <Text style={styles.actionDescription}>Show the first-play walkthrough again</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Text style={[styles.version, { paddingBottom: insets.bottom + 16 }]}>WIREHEAD · v1.0.0</Text>
    </View>
  );
}

function createThemeCardStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
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
      fontFamily: 'monospace',
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
    },
    contentInner: {
      gap: 10,
      paddingTop: 4,
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
    themeSectionIntro: {
      paddingHorizontal: 14,
      paddingTop: 14,
      gap: 4,
    },
    themeSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.4,
    },
    themeSectionDescription: {
      fontSize: 11,
      lineHeight: 17,
      color: colors.textSecondary,
    },
    themeList: {
      padding: 14,
      gap: 12,
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
    version: {
      display: 'none',
      textAlign: 'center',
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 2,
      fontFamily: 'monospace',
      paddingTop: 8,
    },
  });
}
