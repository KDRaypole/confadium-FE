import { usePageBuilder } from "./PageBuilderContext";
import type { PageTheme } from "~/lib/api/types";

const PRESET_PALETTES = [
  { name: 'Purple', colors: { color1: '#7c3aed', color2: '#a78bfa', color3: '#f5f3ff', color4: '#1e1b4b', color5: '#ffffff' } },
  { name: 'Blue', colors: { color1: '#2563eb', color2: '#60a5fa', color3: '#eff6ff', color4: '#1e3a5f', color5: '#ffffff' } },
  { name: 'Green', colors: { color1: '#059669', color2: '#34d399', color3: '#ecfdf5', color4: '#064e3b', color5: '#ffffff' } },
  { name: 'Rose', colors: { color1: '#e11d48', color2: '#fb7185', color3: '#fff1f2', color4: '#4c0519', color5: '#ffffff' } },
  { name: 'Orange', colors: { color1: '#ea580c', color2: '#fb923c', color3: '#fff7ed', color4: '#431407', color5: '#ffffff' } },
  { name: 'Dark', colors: { color1: '#f8fafc', color2: '#94a3b8', color3: '#1e293b', color4: '#0f172a', color5: '#e2e8f0' } },
];

export default function ThemeEditor() {
  const { theme, setTheme } = usePageBuilder();

  const updatePalette = (key: string, value: string) => {
    setTheme({
      ...theme,
      colorPalette: { ...theme.colorPalette, [key]: value },
    });
  };

  const applyPreset = (colors: Record<string, string>) => {
    setTheme({ ...theme, colorPalette: colors as PageTheme['colorPalette'] });
  };

  const updateFont = (section: 'headings' | 'paragraphs' | 'buttons', key: string, value: string) => {
    setTheme({
      ...theme,
      fonts: {
        ...theme.fonts,
        [section]: { ...theme.fonts?.[section], [key]: value },
      },
    });
  };

  const updateButton = (variant: 'primary' | 'secondary' | 'tertiary', key: string, value: string) => {
    setTheme({
      ...theme,
      buttons: {
        ...theme.buttons,
        [variant]: { ...theme.buttons?.[variant], [key]: value },
      },
    });
  };

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Theme Settings
      </h3>

      {/* Color Palette */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color Palette</h4>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.colors)}
              className="flex items-center space-x-1 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 hover:border-purple-400 text-xs"
            >
              <div className="flex -space-x-1">
                {Object.values(preset.colors).slice(0, 3).map((c, i) => (
                  <div key={i} className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Colors */}
        <div className="space-y-2">
          {(['color1', 'color2', 'color3', 'color4', 'color5'] as const).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="color"
                value={theme.colorPalette?.[key] || '#000000'}
                onChange={(e) => updatePalette(key, e.target.value)}
                className="h-7 w-7 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize w-16">
                {key === 'color1' ? 'Primary' : key === 'color2' ? 'Secondary' : key === 'color3' ? 'Background' : key === 'color4' ? 'Dark' : 'Light'}
              </span>
              <input
                type="text"
                value={theme.colorPalette?.[key] || ''}
                onChange={(e) => updatePalette(key, e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Typography</h4>
        <div className="space-y-3">
          {(['headings', 'paragraphs'] as const).map((section) => (
            <div key={section}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">{section}</label>
              <select
                value={theme.fonts?.[section]?.fontFamily || ''}
                onChange={(e) => updateFont(section, 'fontFamily', e.target.value)}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">System Default</option>
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Poppins', sans-serif">Poppins</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Button Styles */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Button Styles</h4>
        <div className="space-y-3">
          {(['primary', 'secondary', 'tertiary'] as const).map((variant) => (
            <div key={variant} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{variant}</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={theme.buttons?.[variant]?.style || 'solid'}
                  onChange={(e) => updateButton(variant, 'style', e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                >
                  <option value="solid">Solid</option>
                  <option value="outline">Outline</option>
                </select>
                <select
                  value={theme.buttons?.[variant]?.shape || 'rounded'}
                  onChange={(e) => updateButton(variant, 'shape', e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="pill">Pill</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
