import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
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
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Module Configuration - CRM Dashboard" },
    { name: "description", content: "View and manage module configurations" },
  ];
};

interface Configuration {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  status: "active" | "inactive" | "draft";
  lastRun: string | null;
  runCount: number;
  successRate: number;
}

// Mock data - this would normally come from API
const getModuleData = (moduleId: string) => {
  const modules: Record<string, any> = {
    "1": {
      id: "1",
      name: "Lead Automation",
      description: "Automatically assign leads to sales reps based on territory and workload",
      category: "automation",
      status: "active",
      icon: "user-plus"
    },
    "2": {
      id: "2", 
      name: "Email Workflows",
      description: "Send automated email sequences based on customer behavior and actions",
      category: "workflow",
      status: "active",
      icon: "envelope"
    }
  };
  
  return modules[moduleId] || modules["1"];
};

const mockConfigurations: Configuration[] = [
  {
    id: "1",
    name: "Territory-Based Lead Assignment",
    description: "Assign new leads to sales reps based on their geographic territory",
    trigger: "New Lead Created",
    conditions: [
      { field: "Lead Source", operator: "equals", value: "Website" },
      { field: "Territory", operator: "not empty", value: "" }
    ],
    actions: [
      { 
        type: "Assign Lead", 
        target: "Sales Rep", 
        parameters: { 
          assignmentType: "territory",
          notifyRep: true,
          createTask: true
        }
      },
      {
        type: "Send Email",
        target: "Lead",
        parameters: {
          template: "welcome_email",
          delay: "5 minutes"
        }
      }
    ],
    status: "active",
    lastRun: "2024-01-15T10:30:00",
    runCount: 47,
    successRate: 94
  },
  {
    id: "2",
    name: "High-Value Lead Priority",
    description: "Prioritize leads with high estimated value for immediate follow-up",
    trigger: "Lead Score Changed",
    conditions: [
      { field: "Lead Score", operator: "greater than", value: "80" },
      { field: "Estimated Value", operator: "greater than", value: "50000" }
    ],
    actions: [
      {
        type: "Update Priority",
        target: "Lead",
        parameters: {
          priority: "high",
          flag: "hot_lead"
        }
      },
      {
        type: "Create Task",
        target: "Sales Manager",
        parameters: {
          title: "Review High-Value Lead",
          dueDate: "2 hours",
          priority: "urgent"
        }
      },
      {
        type: "Send Notification",
        target: "Sales Team",
        parameters: {
          channel: "slack",
          message: "New high-value lead requires immediate attention"
        }
      }
    ],
    status: "active",
    lastRun: "2024-01-15T14:22:00",
    runCount: 23,
    successRate: 100
  },
  {
    id: "3",
    name: "Lead Nurturing Sequence",
    description: "Send automated follow-up emails to leads who haven't responded",
    trigger: "No Response for 3 Days",
    conditions: [
      { field: "Last Contact", operator: "older than", value: "3 days" },
      { field: "Status", operator: "equals", value: "contacted" }
    ],
    actions: [
      {
        type: "Send Email",
        target: "Lead",
        parameters: {
          template: "follow_up_sequence",
          sequence: "nurturing_campaign"
        }
      }
    ],
    status: "draft",
    lastRun: null,
    runCount: 0,
    successRate: 0
  }
];

export default function ModuleDetail() {
  const params = useParams();
  const { orgId, moduleId } = params;
  
  const module = getModuleData(moduleId!);

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

  const getStatusColor = (status: Configuration["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getTriggerColor = (trigger: string) => {
    if (trigger.includes("Created")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (trigger.includes("Changed")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (trigger.includes("Response")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const activeConfigurations = mockConfigurations.filter(c => c.status === "active").length;
  const totalRuns = mockConfigurations.reduce((sum, c) => sum + c.runCount, 0);
  const avgSuccessRate = mockConfigurations.length > 0 
    ? mockConfigurations.reduce((sum, c) => sum + c.successRate, 0) / mockConfigurations.length 
    : 0;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb and Back Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={`/organizations/${orgId}/modules`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Modules
              </Link>
              <span>/</span>
              <span>{module.name}</span>
            </nav>
            
            <div className="flex items-center">
              <Link
                to={`/organizations/${orgId}/modules`}
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
                      {getIcon(module.icon)}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{module.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/organizations/${orgId}/modules/${moduleId}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                    Edit Module
                  </Link>
                </div>
              </div>
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
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{mockConfigurations.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PlayIcon className="h-6 w-6 text-green-600 dark:text-green-500" aria-hidden="true" />
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Configuration Flow Overview</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Visual representation of how your configurations work together
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Configuration Flow Chart</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Interactive flow diagram will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

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
              {mockConfigurations.map((config) => (
                <div key={config.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {config.name}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(config.status)}`}>
                          {config.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {config.description}
                      </p>

                      {/* Trigger */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trigger</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTriggerColor(config.trigger)}`}>
                            {config.trigger}
                          </span>
                        </div>
                      </div>

                      {/* Conditions */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conditions</span>
                        <div className="mt-1 space-y-1">
                          {config.conditions.map((condition, index) => (
                            <div key={index} className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">{condition.field}</span>
                              <span className="mx-2 text-gray-400">{condition.operator}</span>
                              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                {condition.value || "any value"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mb-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {config.actions.map((action, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {action.type} → {action.target}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>Runs: {config.runCount}</span>
                        <span>Success Rate: {config.successRate}%</span>
                        {config.lastRun && (
                          <span>Last Run: {new Date(config.lastRun).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/organizations/${orgId}/modules/${moduleId}/edit?configId=${config.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      {config.status === "active" ? (
                        <button className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}