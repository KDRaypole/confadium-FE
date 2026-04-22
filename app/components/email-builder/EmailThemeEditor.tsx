import { useEmailBuilder } from "./EmailBuilderContext";

const SAFE_FONTS = [
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
  { value: "'Courier New', Courier, monospace", label: "Courier New" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet MS" },
];

export default function EmailThemeEditor() {
  const { theme, setTheme } = useEmailBuilder();

  const update = (key: string, value: string) => setTheme({ ...theme, [key]: value });

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Theme</h3>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</h4>
        <div className="space-y-2">
          {([
            ['bodyBg', 'Body Background', '#f4f4f5'],
            ['contentBg', 'Content Background', '#ffffff'],
            ['primaryColor', 'Primary (buttons/links)', '#7c3aed'],
            ['textColor', 'Body Text', '#374151'],
            ['headingColor', 'Heading Text', '#111827'],
            ['linkColor', 'Link Color', '#7c3aed'],
          ] as const).map(([key, label, fallback]) => (
            <div key={key} className="flex items-center space-x-2">
              <input
                type="color"
                value={(theme as Record<string, string>)[key] || fallback}
                onChange={(e) => update(key, e.target.value)}
                className="h-7 w-7 rounded border cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{label}</span>
              <input
                type="text"
                value={(theme as Record<string, string>)[key] || ''}
                onChange={(e) => update(key, e.target.value)}
                placeholder={fallback}
                className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Typography</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Font Family (email-safe)</label>
            <select
              value={theme.fontFamily || "Arial, Helvetica, sans-serif"}
              onChange={(e) => update('fontFamily', e.target.value)}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {SAFE_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          {([
            ['headingFontSize', 'Heading Size', '24'],
            ['bodyFontSize', 'Body Size', '16'],
            ['smallFontSize', 'Small/Footer Size', '13'],
          ] as const).map(([key, label, fallback]) => (
            <div key={key} className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{label}</span>
              <input
                type="number"
                min="10"
                max="48"
                value={parseInt((theme as Record<string, string>)[key] || fallback, 10)}
                onChange={(e) => update(key, `${e.target.value}px`)}
                className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-right"
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Presets</h4>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setTheme(preset.theme)}
              className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 hover:border-purple-400 text-xs"
            >
              <div className="flex -space-x-1">
                {[preset.theme.primaryColor, preset.theme.contentBg, preset.theme.bodyBg].filter(Boolean).map((c, i) => (
                  <div key={i} className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRESETS = [
  { name: 'Purple', theme: { bodyBg: '#f4f4f5', contentBg: '#ffffff', primaryColor: '#7c3aed', textColor: '#374151', headingColor: '#111827', linkColor: '#7c3aed', fontFamily: "Arial, Helvetica, sans-serif" } },
  { name: 'Blue', theme: { bodyBg: '#f0f4ff', contentBg: '#ffffff', primaryColor: '#2563eb', textColor: '#374151', headingColor: '#1e3a5f', linkColor: '#2563eb', fontFamily: "Arial, Helvetica, sans-serif" } },
  { name: 'Green', theme: { bodyBg: '#ecfdf5', contentBg: '#ffffff', primaryColor: '#059669', textColor: '#374151', headingColor: '#064e3b', linkColor: '#059669', fontFamily: "Georgia, serif" } },
  { name: 'Dark', theme: { bodyBg: '#1f2937', contentBg: '#111827', primaryColor: '#818cf8', textColor: '#d1d5db', headingColor: '#f9fafb', linkColor: '#818cf8', fontFamily: "Arial, Helvetica, sans-serif" } },
  { name: 'Warm', theme: { bodyBg: '#fff7ed', contentBg: '#ffffff', primaryColor: '#ea580c', textColor: '#431407', headingColor: '#1c1917', linkColor: '#ea580c', fontFamily: "Georgia, serif" } },
];
