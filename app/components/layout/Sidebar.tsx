import { Link, useLocation, useParams } from "@remix-run/react";
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  PhoneIcon,
  Squares2X2Icon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  CogIcon,
  EnvelopeIcon,
  TagIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CubeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useOptionalNodeContext } from "~/contexts/NodeContext";

interface SidebarProps {
  showOrgNavigation?: boolean;
}

// App-level navigation (when not in an organization)
const appNavigation = [
  { name: "Organizations", href: "/organizations", icon: BuildingOfficeIcon },
  { name: "App Settings", href: "/app-settings", icon: Cog6ToothIcon },
];

// Standard CRM nav items — org-level routes with optional node query param
function getCrmNavigation(orgId: string, nodeId?: string | null) {
  const base = `/organizations/${orgId}`;
  const q = nodeId ? `?node=${nodeId}` : '';
  return [
    { name: "Contacts", href: `${base}/contacts${q}`, icon: UsersIcon },
    { name: "Opportunities", href: `${base}/deals${q}`, icon: CurrencyDollarIcon },
    { name: "Activities", href: `${base}/activities${q}`, icon: CalendarIcon },
    { name: "Scheduling", href: `${base}/scheduling${q}`, icon: CalendarDaysIcon },
    { name: "Calls", href: `${base}/calls${q}`, icon: PhoneIcon },
    { name: "Reports", href: `${base}/reports${q}`, icon: ChartBarIcon },
    { name: "Email Templates", href: `${base}/email-templates${q}`, icon: EnvelopeIcon },
    { name: "Forms", href: `${base}/forms${q}`, icon: DocumentTextIcon },
    { name: "Websites", href: `${base}/websites${q}`, icon: GlobeAltIcon },
    { name: "Products", href: `${base}/products${q}`, icon: CubeIcon },
    { name: "Tags", href: `${base}/tags${q}`, icon: TagIcon },
    { name: "Modules", href: `${base}/modules${q}`, icon: CogIcon },
  ];
}

export default function Sidebar({ showOrgNavigation = true }: SidebarProps) {
  const location = useLocation();
  const params = useParams();
  const nodeCtx = useOptionalNodeContext();

  const orgId = params.orgId;
  const isOrgContext = showOrgNavigation && !!orgId;
  const isNodeContext = isOrgContext && !!nodeCtx?.activeNodeId;

  // Determine base path and navigation
  let navigation: { name: string; href: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[];
  let headerLabel: string;
  let backHref: string;

  if (!isOrgContext) {
    navigation = appNavigation;
    headerLabel = '';
    backHref = '';
  } else if (isNodeContext && nodeCtx) {
    // Inside a node — CRM links use org-level routes with ?node= query param
    const nodeHome = `/organizations/${orgId}/nodes/${nodeCtx.activeNodeId}`;
    navigation = [
      { name: "Home", href: nodeHome, icon: HomeIcon },
      ...getCrmNavigation(orgId!, nodeCtx.activeNodeId),
    ];

    // Add child level nav if there's a deeper level
    if (nodeCtx.childLevel) {
      navigation.push({
        name: nodeCtx.childLevel.attributes.plural,
        href: `${nodeHome}/children`,
        icon: MapPinIcon,
      });
    }

    headerLabel = nodeCtx.activeNode?.attributes.name || '';
    backHref = nodeCtx.backPath;
  } else {
    // Org level — standard nav plus child level link and structure
    navigation = [
      { name: "Home", href: `/organizations/${orgId}`, icon: HomeIcon },
      ...getCrmNavigation(orgId!),
      { name: "Structure", href: `/organizations/${orgId}/structure`, icon: BuildingOffice2Icon },
    ];

    // Add root level nav if org has structure defined
    if (nodeCtx?.childLevel) {
      navigation.push({
        name: nodeCtx.childLevel.attributes.plural,
        href: `/organizations/${orgId}/nodes`,
        icon: MapPinIcon,
      });
    }

    headerLabel = orgId === 'acme-corp' ? 'Acme Corporation' :
                  orgId === 'startup-division' ? 'Startup Division' :
                  orgId === 'international' ? 'International Operations' :
                  orgId || '';
    backHref = '/organizations';
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-brand-sidebar border-r border-gray-200 dark:border-gray-700">
        {/* Header with back navigation */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-brand-sidebar">
          {isOrgContext ? (
            <div className="flex items-center space-x-2 w-full">
              <Link
                to={backHref}
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mr-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
              <div className="flex-1 min-w-0">
                {isNodeContext && nodeCtx?.activeLevel && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {nodeCtx.activeLevel.attributes.name}
                  </p>
                )}
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {headerLabel}
                </h2>
              </div>
            </div>
          ) : (
            <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              <Squares2X2Icon className="h-5 w-5" />
              <span className="text-sm font-medium">App Launcher</span>
            </button>
          )}
        </div>

        {/* Breadcrumb trail when deep in node hierarchy */}
        {isNodeContext && nodeCtx && nodeCtx.ancestorChain.length > 1 && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500 overflow-x-auto">
              <Link to={`/organizations/${orgId}`} className="hover:text-gray-600 dark:hover:text-gray-300 truncate flex-shrink-0">
                Org
              </Link>
              {nodeCtx.ancestorChain.slice(0, -1).map(ancestor => (
                <span key={ancestor.id} className="flex items-center flex-shrink-0">
                  <span className="mx-1">/</span>
                  <Link
                    to={`/organizations/${orgId}/nodes/${ancestor.id}`}
                    className="hover:text-gray-600 dark:hover:text-gray-300 truncate"
                  >
                    {ancestor.attributes.name}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Navigation */}
          <nav className="px-3 py-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const itemPath = item.href.split('?')[0];
                const homePath = isNodeContext
                  ? `/organizations/${orgId}/nodes/${nodeCtx?.activeNodeId}`
                  : `/organizations/${orgId}`;
                const isHome = itemPath === homePath;
                const isActive = isHome
                  ? location.pathname === itemPath
                  : location.pathname.startsWith(itemPath);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-sidebar-active text-brand-primary border-l-2 border-brand-primary"
                        : "text-brand-sidebar-text hover:bg-brand-sidebar-hover hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-brand-primary" : "text-brand-secondary group-hover:text-gray-700 dark:group-hover:text-gray-200"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Settings - Only show at org level */}
          {isOrgContext && !isNodeContext && (
            <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <Link
                to={`/organizations/${orgId}/settings`}
                className={`group flex items-center rounded px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === `/organizations/${orgId}/settings`
                    ? "bg-brand-sidebar-active text-brand-primary border-l-2 border-brand-primary"
                    : "text-brand-sidebar-text hover:bg-brand-sidebar-hover hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Cog6ToothIcon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    location.pathname === `/organizations/${orgId}/settings` ? "text-brand-primary" : "text-brand-secondary group-hover:text-gray-700 dark:group-hover:text-gray-200"
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
