import { MagnifyingGlassIcon, Bars3Icon, BellIcon, Cog6ToothIcon, QuestionMarkCircleIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, UserIcon, CogIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    setUserDropdownOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Global Navigation Bar */}
      <div className="bg-brand-primary">
        <div className="w-full px-4">
          <div className="flex h-10 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/favicon.svg" alt="Confadium" className="h-6 w-6" />
                <span className="text-white text-sm font-medium">Confadium</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-white hover:text-white/80 p-1">
                <QuestionMarkCircleIcon className="h-4 w-4" />
              </button>
              <button className="text-white hover:text-white/80 p-1">
                <Cog6ToothIcon className="h-4 w-4" />
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1 text-white hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary rounded-full"
                >
                  <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{user?.initials || "U"}</span>
                  </div>
                  <ChevronDownIcon className="h-3 w-3" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserDropdownOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || "User"}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email || "user@example.com"}</p>
                        </div>

                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserIcon className="mr-3 h-4 w-4" />
                          Profile
                        </button>

                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <CogIcon className="mr-3 h-4 w-4" />
                          Settings
                        </button>

                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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

            <div className="flex items-center space-x-2">
              <img src="/favicon.svg" alt="Confadium" className="h-8 w-8" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Confadium</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-brand-primary dark:focus:border-brand-primary focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-primary dark:focus:ring-brand-primary"
                placeholder="Search Confadium..."
                type="search"
              />
            </div>
          </div>

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
