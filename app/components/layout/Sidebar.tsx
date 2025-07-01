import { Link, useLocation, useParams } from "@remix-run/react";
import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  CalendarIcon,
  Cog6ToothIcon,
  PhoneIcon,
  Squares2X2Icon,
  BuildingOfficeIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

interface SidebarProps {
  showOrgNavigation?: boolean;
}

// App-level navigation (when not in an organization)
const appNavigation = [
  { name: "Organizations", href: "/organizations", icon: BuildingOfficeIcon },
  { name: "App Settings", href: "/app-settings", icon: Cog6ToothIcon },
];

// Organization-level navigation (when inside an organization)
const getOrgNavigation = (orgId: string) => [
  { name: "Home", href: `/organizations/${orgId}`, icon: HomeIcon },
  { name: "Contacts", href: `/organizations/${orgId}/contacts`, icon: UsersIcon },
  { name: "Opportunities", href: `/organizations/${orgId}/deals`, icon: CurrencyDollarIcon },
  { name: "Activities", href: `/organizations/${orgId}/activities`, icon: CalendarIcon },
  { name: "Calls", href: `/organizations/${orgId}/calls`, icon: PhoneIcon },
  { name: "Reports", href: `/organizations/${orgId}/reports`, icon: ChartBarIcon },
];

const getOrgRecentItems = (orgId: string) => [
  { name: "John Smith", type: "Contact", href: `/organizations/${orgId}/contacts` },
  { name: "Q1 Enterprise Deal", type: "Opportunity", href: `/organizations/${orgId}/deals` },
  { name: "Product Demo", type: "Activity", href: `/organizations/${orgId}/activities` },
];

export default function Sidebar({ showOrgNavigation = true }: SidebarProps) {
  const location = useLocation();
  const params = useParams();

  const orgId = params.orgId;
  const navigation = showOrgNavigation && orgId ? getOrgNavigation(orgId) : appNavigation;
  const recentItems = showOrgNavigation && orgId ? getOrgRecentItems(orgId) : [];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-50 border-r border-gray-200">
        {/* App Launcher / Organization Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
          {showOrgNavigation && orgId ? (
            <div className="flex items-center space-x-2 w-full">
              <Link
                to="/organizations"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
              <div className="flex-1">
                <h2 className="text-sm font-medium text-gray-900 truncate">
                  {orgId === 'acme-corp' ? 'Acme Corporation' : 
                   orgId === 'startup-division' ? 'Startup Division' : 
                   orgId === 'international' ? 'International Operations' : 
                   orgId}
                </h2>
              </div>
            </div>
          ) : (
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Squares2X2Icon className="h-5 w-5" />
              <span className="text-sm font-medium">App Launcher</span>
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Navigation */}
          <nav className="px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Recent Items - Only show in organization context */}
          {showOrgNavigation && orgId && (
            <div className="px-3 py-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                Recent Items
              </h3>
              <div className="space-y-1">
                {recentItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className="group flex items-center rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div className="mr-3 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Settings - Only show in organization context */}
          {showOrgNavigation && orgId && (
            <div className="px-3 py-4 border-t border-gray-200 mt-auto">
              <Link
                to={`/organizations/${orgId}/settings`}
                className={`group flex items-center rounded px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === `/organizations/${orgId}/settings`
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Cog6ToothIcon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    location.pathname === `/organizations/${orgId}/settings` ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                  }`}
                  aria-hidden="true"
                />
                Setup
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}