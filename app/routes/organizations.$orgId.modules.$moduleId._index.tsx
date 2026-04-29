import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import WorkflowGraph from "~/components/modules/WorkflowGraph";
import ConfigurationFlowOverview from "~/components/flow/ConfigurationFlowOverview";
import CompactFlowPreview from "~/components/flow/CompactFlowPreview";
import { useModule, useModules, useModuleConfigurations, type Configuration } from "~/hooks/useModules";
import { useNodeContext } from "~/contexts/NodeContext";
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
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useDarkMode } from "~/contexts/DarkModeContext";
import StateManager, { StateBadge } from "~/components/ui/StateManager";
import { MODULES_QUERY_KEYS } from "~/hooks/useModules";

export const meta: MetaFunction = () => {
  return [
    { title: "Module Configuration - CRM Dashboard" },
    { name: "description", content: "View and manage module configurations" },
  ];
};

export default function ModuleDetail() {
  const params = useParams();
  const { orgId, moduleId } = params;
  const { buildListPath } = useNodeContext();
  const { isDarkMode } = useDarkMode();
  const [workflowChanges, setWorkflowChanges] = useState<any[]>([]);
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
  
  const { module, loading: moduleLoading, error: moduleError } = useModule(moduleId);
  const { updateModule } = useModules();
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingModule, setIsSavingModule] = useState(false);

  const startEditingModule = () => {
    setEditName(module?.attributes?.name || '');
    setEditDescription(module?.attributes?.description || '');
    setIsEditingModule(true);
  };

  const cancelEditingModule = () => {
    setIsEditingModule(false);
  };

  const saveModule = async () => {
    if (!moduleId || !editName.trim()) return;
    setIsSavingModule(true);
    try {
      await updateModule({ id: moduleId, attrs: { name: editName.trim(), description: editDescription.trim() || null } });
      setIsEditingModule(false);
    } catch (err) {
      console.error('Failed to update module:', err);
    } finally {
      setIsSavingModule(false);
    }
  };
  const { 
    configurations, 
    loading: configsLoading, 
    error: configsError,
    deleteConfiguration,
    isDeleting
  } = useModuleConfigurations(moduleId);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "user-plus":
        return <UserPlusIcon className="h-8 w-8" />;
      case "envelope":
        return <EnvelopeIcon className="h-8 w-8" />;
      case "phone":
        return <PhoneIcon className="h-8 w-8" />;
      case "bell":
        return <BellIcon className="h-8 w-8" />;
      case "globe":
        return <GlobeAltIcon className="h-8 w-8" />;
      case "chart":
        return <ChartBarIcon className="h-8 w-8" />;
      case "calendar":
        return <CalendarIcon className="h-8 w-8" />;
      case "shield":
        return <ShieldCheckIcon className="h-8 w-8" />;
      default:
        return <CogIcon className="h-8 w-8" />;
    }
  };

  const getStatusColor = (stateAction?: string) => {
    switch (stateAction) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getTriggerColor = (trigger: string) => {
    if (trigger.includes("create")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (trigger.includes("update")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (trigger.includes("Response")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      return;
    }
    deleteConfiguration(configId);
  };

  const handleWorkflowChange = (changes: any) => {
    setWorkflowChanges(prev => [...prev, changes]);
    console.log("Workflow changes:", changes);
    
    // TODO: Implement actual persistence of workflow changes
    // This could involve updating the configuration that was modified
    if (changes.type === "node_updated" && changes.data) {
      // Find the configuration this node belongs to and update it
      // For now, we'll just log it for demonstration
      console.log("Node update would be persisted:", changes);
    }
  };

  // Loading states
  if (moduleLoading || configsLoading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading module details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error states
  if (moduleError || configsError) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Module</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{moduleError || configsError}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Module not found
  if (!module) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Module Not Found</h1>
              <Link to={buildListPath('modules')} className="text-blue-600 hover:text-blue-500">
                Back to Modules
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const activeConfigurations = configurations.filter(c => c.attributes?.state?.action === "active").length;
  const totalRuns = configurations.reduce((sum, c) => sum + ((c as any).attributes?.run_count || 0), 0);
  const avgSuccessRate = configurations.length > 0
    ? configurations.reduce((sum, c) => sum + ((c as any).attributes?.success_rate || 0), 0) / configurations.length
    : 0;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb and Back Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={buildListPath('modules')} className="hover:text-gray-700 dark:hover:text-gray-200">
                Modules
              </Link>
              <span>/</span>
              <span>{module.attributes?.name || ''}</span>
            </nav>
            
            <div className="flex items-center">
              <Link
                to={buildListPath('modules')}
                className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Modules
              </Link>
            </div>
          </div>

          {/* Module Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400">
                      {getIcon(module.attributes?.icon || '')}
                    </div>
                  </div>
                  {isEditingModule ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="block w-full text-xl font-bold px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Module name"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="block w-full text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description (optional)"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.attributes?.name || ''}</h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{module.attributes?.description || ''}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isEditingModule ? (
                    <>
                      <button
                        onClick={saveModule}
                        disabled={isSavingModule || !editName.trim()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        {isSavingModule ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditingModule}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={startEditingModule}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                      Edit Module
                    </button>
                  )}
                </div>
              </div>
              {module.attributes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <StateManager
                    entityType="automation_modules"
                    entityId={module.id}
                    stateAttrs={module.attributes}
                    invalidateKeys={[MODULES_QUERY_KEYS.all, MODULES_QUERY_KEYS.detail(moduleId!)]}
                    layout="inline"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Module Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CogIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Configurations</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{configurations.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Configurations</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{activeConfigurations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Runs</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{totalRuns}</dd>
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
                      <span className="text-white text-xs font-medium">%</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Success Rate</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{avgSuccessRate.toFixed(1)}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Flow Visualization */}
          {configurations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">All Configurations Overview</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Visual representation of all automation workflows in this module shown together
                </p>
              </div>
              <div className="p-6">
                <ConfigurationFlowOverview
                  configuration={{
                    trigger: undefined,
                    conditions: [],
                    actions: []
                  }}
                  allConfigurations={configurations.map(c => ({
                    id: c.id,
                    name: c.attributes?.name || '',
                    status: c.attributes?.state?.action || '',
                    trigger: c.attributes?.trigger || { entityType: '', action: '' },
                    conditions: c.attributes?.conditions || [],
                    actions: c.attributes?.actions || [],
                  }))}
                  height="500px"
                  showControls={true}
                  showBackground={true}
                />
              </div>
            </div>
          )}

          {/* Workflow Changes Log */}
          {workflowChanges.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Changes</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Workflow modifications pending save ({workflowChanges.length} changes)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // TODO: Implement actual save functionality
                        alert("Workflow changes would be saved here");
                        setWorkflowChanges([]);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(workflowChanges, null, 2)}
                  </pre>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setWorkflowChanges([])}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Clear Log
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Configurations List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configurations</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage individual automation configurations for this module
                  </p>
                </div>
                <Link
                  to={`/organizations/${orgId}/modules/${moduleId}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CogIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  New Configuration
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {configurations.map((config) => (
                <div key={config.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {config.attributes?.name || ''}
                        </h4>
                        <StateBadge state={config.attributes?.state ?? null} />
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {config.attributes?.description || ''}
                      </p>

                      {/* Flow Preview */}
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow</span>
                        <div className="mt-2">
                          <CompactFlowPreview
                            configuration={{
                              trigger: config.attributes?.trigger,
                              conditions: config.attributes?.conditions || [],
                              actions: config.attributes?.actions || []
                            }}
                          />
                        </div>
                      </div>

                      {/* State & Stats */}
                      {config.attributes && (
                        <div className="mb-3">
                          <StateManager
                            entityType="module_configurations"
                            entityId={config.id!}
                            stateAttrs={config.attributes}
                            invalidateKeys={[MODULES_QUERY_KEYS.configs(moduleId!), MODULES_QUERY_KEYS.all]}
                            layout="inline"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>Created: {new Date(config.attributes?.created_at || '').toLocaleDateString()}</span>
                        <span>Updated: {new Date(config.attributes?.updated_at || '').toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => setExpandedConfigId(expandedConfigId === config.id ? null : config.id!)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View detailed flow"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/organizations/${orgId}/modules/${moduleId}/edit?configId=${config.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit configuration"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteConfiguration(config.id!)}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        title="Delete configuration"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Flow View */}
                  {expandedConfigId === config.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Detailed Workflow View</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Interactive visualization of this configuration's automation flow</p>
                      </div>
                      <ConfigurationFlowOverview
                        configuration={{
                          trigger: config.attributes?.trigger,
                          conditions: config.attributes?.conditions || [],
                          actions: config.attributes?.actions || []
                        }}
                        height="300px"
                        showControls={false}
                        showBackground={true}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}