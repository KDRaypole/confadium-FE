import { MagnifyingGlassIcon, Bars3Icon, BellIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Global Navigation Bar */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="w-full px-4">
          <div className="flex h-10 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">MD</span>
                </div>
                <span className="text-white text-sm font-medium">Modlize</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-white hover:text-blue-100 p-1">
                <QuestionMarkCircleIcon className="h-4 w-4" />
              </button>
              <button className="text-white hover:text-blue-100 p-1">
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">KR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full px-4">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="md:hidden relative inline-flex items-center justify-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none"
              onClick={onMobileMenuClick}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-5 w-5" aria-hidden="true" />
            </button>
            
            {/* App Name */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">CRM</span>
            </div>
          </div>
          
          {/* Global Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder="Search Modlize..."
                type="search"
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded focus:outline-none"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}