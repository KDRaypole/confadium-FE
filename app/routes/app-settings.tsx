import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { UserIcon, BellIcon, ShieldCheckIcon, CogIcon, KeyIcon, GlobeAltIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useDarkMode } from "~/contexts/DarkModeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Application Settings - CRM Dashboard" },
    { name: "description", content: "Manage your application settings and preferences" },
  ];
};

export default function AppSettings() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="dark-mode"
                        name="dark-mode"
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="dark-mode" className="font-medium text-gray-700 dark:text-gray-300">
                        Dark mode
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">Use dark theme for the interface.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-blue-600 border border-transparent rounded shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Preferences
                    </button>
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