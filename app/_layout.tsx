import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getThemeStatusBarStyle } from '../constants';
import { DEFAULT_SETTINGS } from '../constants/app-defaults';
import { loadSettings } from '../lib/storage';
import { ThemeProvider, useAppTheme } from '../lib/theme';
import type { ThemeMode } from '../types';

function AppShell() {
  const { colors, mode } = useAppTheme();

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}> 
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="game" />
        <Stack.Screen name="complete" />
        <Stack.Screen name="settings" />
      </Stack>
      <StatusBar style={getThemeStatusBarStyle(mode)} />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_SETTINGS.themeMode);

  useEffect(() => {
    loadSettings().then((settings) => {
      setThemeMode(settings.themeMode);
    });
  }, []);

  return (
    <ThemeProvider mode={themeMode} setThemeMode={setThemeMode}>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
