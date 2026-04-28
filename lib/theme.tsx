import { createContext, useContext, useMemo } from 'react';
import { DARK_COLORS, getThemeColors } from '../constants';
import { DEFAULT_SETTINGS } from '../constants/app-defaults';
import type { ThemeColors, ThemeMode } from '../types';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  children: React.ReactNode;
}

export function ThemeProvider({ mode, setThemeMode, children }: ThemeProviderProps) {
  const colors = useMemo(() => getThemeColors(mode), [mode]);
  const value = useMemo(
    () => ({ mode, colors, setThemeMode }),
    [mode, colors, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      mode: DEFAULT_SETTINGS.themeMode,
      colors: DARK_COLORS,
      setThemeMode: (_mode: ThemeMode) => {},
    };
  }

  return context;
}
