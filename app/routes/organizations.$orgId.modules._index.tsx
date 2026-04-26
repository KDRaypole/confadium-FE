import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useModules, type Module } from "~/hooks/useModules";
import { StateBadge } from "~/components/ui/StateManager";
import { 
  CogIcon, 
  BellIcon, 
  UserPlusIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Modules - CRM Dashboard" },
    { name: "description", content: "Manage your automation modules and configurations" },
  ];
};

export default function ModulesIndex() {
  const params = useParams();
  const orgId = params.orgId;
  const navigate = useNavigate();
  const { modules, loading, error, isDeleting, deleteModule } = useModules();

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "user-plus":
        return <UserPlusIcon className="h-6 w-6" />;
      case "envelope":
        return <EnvelopeIcon className="h-6 w-6" />;
      case "phone":
        return <PhoneIcon className="h-6 w-6" />;
      case "bell":
        return <BellIcon className="h-6 w-6" />;
      case "globe":
        return <GlobeAltIcon className="h-6 w-6" />;
      case "chart":
        return <ChartBarIcon className="h-6 w-6" />;
      case "calendar":
        return <CalendarIcon className="h-6 w-6" />;
      case "shield":
        return <ShieldCheckIcon className="h-6 w-6" />;
      default:
        return <CogIcon className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: Module["category"]) => {
    switch (category) {
      case "automation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "integration":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "notification":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "workflow":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const activeModules = modules.filter(m => m.attributes?.state?.action === "active").length;
  const totalConfigurations = modules.reduce((sum, m) => sum + (m.attributes?.configurations_count || 0), 0);

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action will also delete all its configurations.')) {
      return;
    }
    deleteModule(moduleId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading modules...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Modules</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automation Modules</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Configure and manage your CRM automation workflows and integrations
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Import Module
              </button>
              <button
                type="button"
                onClick={() => navigate(`/organizations/${orgId}/modules/new`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CogIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Module
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CogIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Modules</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{modules.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Modules</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{activeModules}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Configurations</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{totalConfigurations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={`/organizations/${orgId}/modules/${module.id}`}
                className="group relative bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
              >
                <div>
                  {/* Module Icon and Status */}
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex p-3 rounded-lg ${getCategoryColor(module.attributes?.category)} bg-opacity-10`}>
                      <div className="text-gray-600 dark:text-gray-300">
                        {getIcon(module.attributes?.icon || '')}
                      </div>
                    </div>
                    <StateBadge state={module.attributes?.state ?? null} />
                  </div>

                  {/* Module Info */}
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {module.attributes?.name || ''}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {module.attributes?.description || ''}
                    </p>
                  </div>

                  {/* Module Category */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(module.attributes?.category)}`}>
                      {module.attributes?.category || ''}
                    </span>
                  </div>

                  {/* Configuration Count and Triggers */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Configurations: {module.attributes?.configurations_count || 0}</span>
                      <span>Modified: {new Date(module.attributes?.updated_at || '').toLocaleDateString()}</span>
                    </div>
                    
                    {/* Trigger Types Preview */}
                    <div className="flex flex-wrap gap-1">
                      {(module.attributes?.trigger_types || []).slice(0, 2).map((trigger: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {trigger}
                        </span>
                      ))}
                      {(module.attributes?.trigger_types || []).length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          +{(module.attributes?.trigger_types || []).length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors duration-200" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}