import React from 'react';
import { FormTheme } from '~/routes/organizations.$orgId.forms.new';
import { SwatchIcon } from '@heroicons/react/24/outline';

interface FormThemeEditorProps {
  theme: FormTheme;
  onThemeChange: (theme: FormTheme) => void;
}

const presetThemes: { name: string; theme: FormTheme }[] = [
  {
    name: 'Professional',
    theme: {
      primaryColor: '#7c3aed',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      borderColor: '#d1d5db',
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'Inter, system-ui, sans-serif',
      spacing: 16,
    }
  },
  {
    name: 'Modern Dark',
    theme: {
      primaryColor: '#10b981',
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      borderColor: '#4b5563',
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'Inter, system-ui, sans-serif',
      spacing: 20,
    }
  },
  {
    name: 'Minimal',
    theme: {
      primaryColor: '#6366f1',
      backgroundColor: '#fafafa',
      textColor: '#262626',
      borderColor: '#e5e5e5',
      borderRadius: 4,
      fontSize: 13,
      fontFamily: 'system-ui, sans-serif',
      spacing: 12,
    }
  },
  {
    name: 'Bold',
    theme: {
      primaryColor: '#dc2626',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#374151',
      borderRadius: 12,
      fontSize: 16,
      fontFamily: 'Inter, system-ui, sans-serif',
      spacing: 24,
    }
  }
];

const fontOptions = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times, serif', label: 'Times' },
  { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Monaco, monospace', label: 'Monaco' },
];

const FormThemeEditor: React.FC<FormThemeEditorProps> = ({ theme, onThemeChange }) => {
  const updateTheme = (updates: Partial<FormTheme>) => {
    onThemeChange({ ...theme, ...updates });
  };

  const applyPreset = (presetTheme: FormTheme) => {
    onThemeChange(presetTheme);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Form Theme
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize the appearance of your form to match your brand
        </p>
      </div>

      {/* Preset Themes */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Quick Presets
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.theme)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: preset.theme.primaryColor }}
                />
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {preset.name}
                </span>
              </div>
              <div
                className="h-8 rounded text-xs flex items-center justify-center"
                style={{
                  backgroundColor: preset.theme.backgroundColor,
                  color: preset.theme.textColor,
                  borderColor: preset.theme.borderColor,
                  border: '1px solid',
                  fontSize: '10px'
                }}
              >
                Sample Form
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Theme Settings */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Custom Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Colors</h5>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="#7c3aed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => updateTheme({ textColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => updateTheme({ textColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="#374151"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Border Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={theme.borderColor}
                  onChange={(e) => updateTheme({ borderColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.borderColor}
                  onChange={(e) => updateTheme({ borderColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="#d1d5db"
                />
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Typography & Layout</h5>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Font Family
              </label>
              <select
                value={theme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Font Size: {theme.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={theme.fontSize}
                onChange={(e) => updateTheme({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>12px</span>
                <span>20px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Border Radius: {theme.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="16"
                value={theme.borderRadius}
                onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0px</span>
                <span>16px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Spacing: {theme.spacing}px
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={theme.spacing}
                onChange={(e) => updateTheme({ spacing: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>8px</span>
                <span>32px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Theme Preview
        </h4>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: theme.backgroundColor,
              fontFamily: theme.fontFamily,
            }}
          >
            <h3
              style={{
                color: theme.textColor,
                fontSize: `${theme.fontSize + 4}px`,
                marginBottom: `${theme.spacing}px`,
              }}
              className="font-semibold"
            >
              Sample Form
            </h3>
            
            <div style={{ marginBottom: `${theme.spacing}px` }}>
              <label
                style={{
                  color: theme.textColor,
                  fontSize: `${theme.fontSize}px`,
                  display: 'block',
                  marginBottom: `${theme.spacing / 2}px`,
                }}
                className="font-medium"
              >
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                disabled
                style={{
                  borderColor: theme.borderColor,
                  borderRadius: `${theme.borderRadius}px`,
                  fontSize: `${theme.fontSize}px`,
                  color: theme.textColor,
                  backgroundColor: theme.backgroundColor,
                  padding: `${theme.spacing / 2}px ${theme.spacing}px`,
                  border: '1px solid',
                  width: '100%',
                }}
              />
            </div>

            <button
              style={{
                backgroundColor: theme.primaryColor,
                borderRadius: `${theme.borderRadius}px`,
                fontSize: `${theme.fontSize}px`,
                padding: `${theme.spacing}px ${theme.spacing * 2}px`,
                color: '#ffffff',
                border: 'none',
              }}
              className="font-medium"
            >
              Submit Form
            </button>
          </div>
        </div>
      </div>

      {/* CSS Variables Export */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
          <SwatchIcon className="h-4 w-4 mr-2" />
          CSS Variables
        </h4>
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
{`:root {
  --form-primary-color: ${theme.primaryColor};
  --form-background-color: ${theme.backgroundColor};
  --form-text-color: ${theme.textColor};
  --form-border-color: ${theme.borderColor};
  --form-border-radius: ${theme.borderRadius}px;
  --form-font-size: ${theme.fontSize}px;
  --form-font-family: ${theme.fontFamily};
  --form-spacing: ${theme.spacing}px;
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FormThemeEditor;