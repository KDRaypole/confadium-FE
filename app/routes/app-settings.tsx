import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { UserIcon, BellIcon, ShieldCheckIcon, CogIcon, KeyIcon, GlobeAltIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useTheme } from "~/contexts/ThemeContext";
import { THEME_LIST, CUSTOM_THEME_ID, rgbToHex, hexToRgb } from "~/lib/themes";

export const meta: MetaFunction = () => {
  return [
    { title: "Application Settings - Confadium" },
    { name: "description", content: "Manage your application settings and preferences" },
  ];
};

export default function AppSettings() {
  const { theme, themeId, setTheme, setCustomColors } = useTheme();

  return (
    <Layout showOrgNavigation={false}>
      <div className="py-6">
        <div className="w-full px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Application Settings</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your global application preferences and account settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                <a href="#profile" className="bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <UserIcon className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Profile
                </a>
                <a href="#organizations" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <BuildingOfficeIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Organizations
                </a>
                <a href="#notifications" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <BellIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Notifications
                </a>
                <a href="#security" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <ShieldCheckIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Security
                </a>
                <a href="#api" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <KeyIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  API Keys
                </a>
                <a href="#preferences" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <CogIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Preferences
                </a>
                <a href="#integrations" className="border-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 group border-l-4 px-3 py-2 flex items-center text-sm font-medium">
                  <GlobeAltIcon className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  Integrations
                </a>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Settings */}
              <div id="profile" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account profile information and email address.
                  </p>
                </div>
                <div className="px-6 py-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First name
                      </label>
                      <input
                        type="text"
                        name="first-name"
                        id="first-name"
                        defaultValue="John"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="last-name"
                        id="last-name"
                        defaultValue="Doe"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue="john.doe@example.com"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-blue-600 border border-transparent rounded shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization Management */}
              <div id="organizations" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Organization Management</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage your organization memberships and permissions.
                  </p>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-500 dark:bg-blue-600 rounded flex items-center justify-center mr-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Acme Corporation</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
                        </div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-500 dark:bg-purple-600 rounded flex items-center justify-center mr-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Startup Division</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Member</p>
                        </div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div id="api" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">API Keys</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage your API keys for integrating with external services.
                  </p>
                </div>
                <div className="px-6 py-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No API keys created yet.</p>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <KeyIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      Generate API Key
                    </button>
                  </div>
                </div>
              </div>

              {/* General Preferences */}
              <div id="preferences" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">General Preferences</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Customize your application experience.
                  </p>
                </div>
                <div className="px-6 py-6 space-y-6">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option>Pacific Standard Time (PST)</option>
                      <option>Mountain Standard Time (MST)</option>
                      <option>Central Standard Time (CST)</option>
                      <option>Eastern Standard Time (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Choose a color theme for the interface. This applies to your account across all organizations.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {THEME_LIST.map((preset) => {
                        const isActive = themeId === preset.id;
                        const bg = `rgb(${preset.colors.sidebar})`;
                        const primary = `rgb(${preset.colors.primary})`;
                        const accent = `rgb(${preset.colors.accent})`;
                        const text = `rgb(${preset.colors.sidebarText})`;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setTheme(preset.id)}
                            className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                              isActive
                                ? 'border-blue-500 ring-2 ring-blue-500/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {/* Color preview */}
                            <div className="flex items-center space-x-1.5 mb-2">
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: primary }} />
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: accent }} />
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: bg }} />
                            </div>
                            {/* Miniature sidebar preview */}
                            <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600 mb-2" style={{ height: '40px' }}>
                              <div className="h-full flex">
                                <div style={{ backgroundColor: bg, width: '30%', padding: '4px' }}>
                                  <div style={{ backgroundColor: primary, height: '4px', borderRadius: '2px', marginBottom: '3px', opacity: 0.8 }} />
                                  <div style={{ backgroundColor: text, height: '3px', borderRadius: '2px', marginBottom: '2px', opacity: 0.3 }} />
                                  <div style={{ backgroundColor: text, height: '3px', borderRadius: '2px', opacity: 0.3 }} />
                                </div>
                                <div style={{ backgroundColor: preset.dark ? '#111827' : '#ffffff', flex: 1 }} />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{preset.name}</span>
                            {preset.dark && (
                              <span className="ml-1.5 text-xs text-gray-400">dark</span>
                            )}
                            {isActive && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                      {/* Custom theme card */}
                      {(() => {
                        const isActive = themeId === CUSTOM_THEME_ID;
                        const customColors = theme.colors;
                        const bg = `rgb(${customColors.sidebar})`;
                        const primary = `rgb(${customColors.primary})`;
                        const accent = `rgb(${customColors.accent})`;
                        const text = `rgb(${customColors.sidebarText})`;
                        return (
                          <button
                            type="button"
                            onClick={() => setTheme(CUSTOM_THEME_ID)}
                            className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                              isActive
                                ? 'border-blue-500 ring-2 ring-blue-500/20'
                                : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 mb-2">
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: isActive ? primary : '#9ca3af' }} />
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: isActive ? accent : '#d1d5db' }} />
                              <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: isActive ? bg : '#e5e7eb' }} />
                            </div>
                            <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600 mb-2" style={{ height: '40px' }}>
                              <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                                <span className="text-xs text-gray-400">Custom</span>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">Custom</span>
                            {isActive && (
                              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })()}
                    </div>

                    {/* Custom color editor — shown when custom theme is active */}
                    {themeId === CUSTOM_THEME_ID && (
                      <div className="mt-6 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Customize Colors</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Pick colors for each part of the interface. Changes apply immediately.</p>

                        <div className="mb-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={theme.dark}
                              onChange={(e) => setCustomColors({}, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode base</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {([
                            ['primary', 'Primary'],
                            ['primaryHover', 'Primary Hover'],
                            ['secondary', 'Secondary'],
                            ['accent', 'Accent'],
                            ['sidebar', 'Sidebar Background'],
                            ['sidebarText', 'Sidebar Text'],
                            ['sidebarActive', 'Sidebar Active'],
                            ['sidebarHover', 'Sidebar Hover'],
                          ] as const).map(([key, label]) => (
                            <div key={key}>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={rgbToHex(theme.colors[key])}
                                  onChange={(e) => setCustomColors({ [key]: hexToRgb(e.target.value) })}
                                  className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={rgbToHex(theme.colors[key])}
                                  onChange={(e) => {
                                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                                      setCustomColors({ [key]: hexToRgb(e.target.value) });
                                    }
                                  }}
                                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}