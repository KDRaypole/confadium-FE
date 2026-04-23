export interface AppTheme {
  id: string;
  name: string;
  dark: boolean;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    sidebar: string;
    sidebarText: string;
    sidebarActive: string;
    sidebarHover: string;
  };
}

export const THEMES: Record<string, AppTheme> = {
  light: {
    id: 'light',
    name: 'Light',
    dark: false,
    colors: {
      primary: '59 130 246',       // blue-500
      primaryHover: '37 99 235',   // blue-600
      secondary: '107 114 128',    // gray-500
      accent: '124 58 237',        // violet-600
      sidebar: '255 255 255',      // white
      sidebarText: '55 65 81',     // gray-700
      sidebarActive: '239 246 255', // blue-50
      sidebarHover: '243 244 246', // gray-100
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    dark: true,
    colors: {
      primary: '96 165 250',       // blue-400
      primaryHover: '59 130 246',  // blue-500
      secondary: '156 163 175',    // gray-400
      accent: '167 139 250',       // violet-400
      sidebar: '17 24 39',         // gray-900
      sidebarText: '209 213 219',  // gray-300
      sidebarActive: '31 41 55',   // gray-800
      sidebarHover: '31 41 55',    // gray-800
    },
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    dark: true,
    colors: {
      primary: '167 139 250',      // violet-400
      primaryHover: '139 92 246',  // violet-500
      secondary: '196 181 253',    // violet-300
      accent: '232 121 249',       // fuchsia-400
      sidebar: '46 16 101',        // purple-950
      sidebarText: '233 213 255',  // purple-100
      sidebarActive: '88 28 135',  // purple-800
      sidebarHover: '76 29 149',   // purple-900
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    dark: false,
    colors: {
      primary: '20 184 166',       // teal-500
      primaryHover: '13 148 136',  // teal-600
      secondary: '100 116 139',    // slate-500
      accent: '6 182 212',         // cyan-500
      sidebar: '241 245 249',      // slate-100
      sidebarText: '51 65 85',     // slate-700
      sidebarActive: '204 251 241', // teal-100
      sidebarHover: '226 232 240', // slate-200
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    dark: true,
    colors: {
      primary: '129 140 248',      // indigo-400
      primaryHover: '99 102 241',  // indigo-500
      secondary: '165 180 252',    // indigo-300
      accent: '96 165 250',        // blue-400
      sidebar: '15 23 42',         // slate-900
      sidebarText: '203 213 225',  // slate-300
      sidebarActive: '30 41 59',   // slate-800
      sidebarHover: '30 41 59',    // slate-800
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    dark: false,
    colors: {
      primary: '249 115 22',       // orange-500
      primaryHover: '234 88 12',   // orange-600
      secondary: '168 162 158',    // stone-400
      accent: '244 63 94',         // rose-500
      sidebar: '250 250 249',      // stone-50
      sidebarText: '68 64 60',     // stone-700
      sidebarActive: '255 237 213', // orange-100
      sidebarHover: '245 245 244', // stone-100
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME_ID = 'light';
export const CUSTOM_THEME_ID = 'custom';
const CUSTOM_STORAGE_KEY = 'app-theme-custom';

export function getTheme(id: string): AppTheme {
  if (id === CUSTOM_THEME_ID) {
    return loadCustomTheme();
  }
  return THEMES[id] || THEMES[DEFAULT_THEME_ID];
}

/** Load a user's custom theme from localStorage, falling back to light defaults */
export function loadCustomTheme(): AppTheme {
  if (typeof window === 'undefined') return { ...THEMES.light, id: CUSTOM_THEME_ID, name: 'Custom' };
  try {
    const stored = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...THEMES.light, ...parsed, id: CUSTOM_THEME_ID, name: 'Custom' };
    }
  } catch {}
  return { ...THEMES.light, id: CUSTOM_THEME_ID, name: 'Custom' };
}

/** Save custom theme colors to localStorage */
export function saveCustomTheme(theme: Partial<AppTheme>) {
  const current = loadCustomTheme();
  const merged = {
    dark: theme.dark ?? current.dark,
    colors: { ...current.colors, ...theme.colors },
  };
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(merged));
}

/** Convert hex color (#rrggbb) to RGB string ("r g b") for CSS variables */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex; // Return as-is if already in rgb format
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

/** Convert RGB string ("r g b") to hex (#rrggbb) for color inputs */
export function rgbToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '#000000';
  return '#' + parts.map(n => n.toString(16).padStart(2, '0')).join('');
}

/** Apply a theme's CSS custom properties to the document root */
export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  const { colors } = theme;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-sidebar', colors.sidebar);
  root.style.setProperty('--color-sidebar-text', colors.sidebarText);
  root.style.setProperty('--color-sidebar-active', colors.sidebarActive);
  root.style.setProperty('--color-sidebar-hover', colors.sidebarHover);

  if (theme.dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
