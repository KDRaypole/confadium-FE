import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { type AppTheme, getTheme, applyTheme, DEFAULT_THEME_ID, THEMES, CUSTOM_THEME_ID, saveCustomTheme, loadCustomTheme } from "~/lib/themes";

const STORAGE_KEY = "app-theme";

interface ThemeContextType {
  theme: AppTheme;
  themeId: string;
  setTheme: (themeId: string) => void;
  setCustomColors: (colors: Partial<AppTheme['colors']>, dark?: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);
  const theme = getTheme(themeId);

  // Initialize theme from storage on mount
  useEffect(() => {
    // Check new storage key first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      setThemeIdState(saved);
      applyTheme(getTheme(saved));
      return;
    }

    // Migrate from old darkMode boolean
    const oldDarkMode = localStorage.getItem("darkMode");
    if (oldDarkMode !== null) {
      const isDark = JSON.parse(oldDarkMode);
      const migrated = isDark ? "dark" : "light";
      setThemeIdState(migrated);
      applyTheme(getTheme(migrated));
      localStorage.setItem(STORAGE_KEY, migrated);
      localStorage.removeItem("darkMode");
      return;
    }

    // System preference fallback
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultId = prefersDark ? "dark" : "light";
    setThemeIdState(defaultId);
    applyTheme(getTheme(defaultId));
  }, []);

  const setTheme = useCallback((id: string) => {
    const resolved = (THEMES[id] || id === CUSTOM_THEME_ID) ? id : DEFAULT_THEME_ID;
    setThemeIdState(resolved);
    localStorage.setItem(STORAGE_KEY, resolved);
    applyTheme(getTheme(resolved));
  }, []);

  const setCustomColors = useCallback((colors: Partial<AppTheme['colors']>, dark?: boolean) => {
    const current = loadCustomTheme();
    saveCustomTheme({ dark: dark ?? current.dark, colors: { ...current.colors, ...colors } });
    setThemeIdState(CUSTOM_THEME_ID);
    localStorage.setItem(STORAGE_KEY, CUSTOM_THEME_ID);
    applyTheme(loadCustomTheme());
  }, []);

  const toggleDarkMode = useCallback(() => {
    if (themeId === CUSTOM_THEME_ID) {
      setCustomColors({}, !theme.dark);
    } else {
      const newId = theme.dark ? "light" : "dark";
      setTheme(newId);
    }
  }, [theme.dark, themeId, setTheme, setCustomColors]);

  return (
    <ThemeContext.Provider value={{
      theme,
      themeId,
      setTheme,
      setCustomColors,
      isDarkMode: theme.dark,
      toggleDarkMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

// Backward compat — same interface as the old useDarkMode
export function useDarkMode() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return { isDarkMode, toggleDarkMode };
}
