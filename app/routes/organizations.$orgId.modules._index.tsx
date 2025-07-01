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
  ClockIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Modules - CRM Dashboard" },
    { name: "description", content: "Manage your automation modules and configurations" },
  ];
};

interface Module {
  id: string;
  name: string;
  description: string;
  category: "automation" | "integration" | "notification" | "workflow";
  status: "active" | "inactive" | "configured";
  icon: string;
  configurationsCount: number;
  lastModified: string;
  triggerTypes: string[];
}

const mockModules: Module[] = [
  {
    id: "1",
    name: "Lead Automation",
    description: "Automatically assign leads to sales reps based on territory and workload",
    category: "automation",
    status: "active",
    icon: "user-plus",
    configurationsCount: 3,
    lastModified: "2024-01-15",
    triggerTypes: ["New Lead Created", "Lead Score Changed", "Territory Assignment"]
  },
  {
    id: "2", 
    name: "Email Workflows",
    description: "Send automated email sequences based on customer behavior and actions",
    category: "workflow",
    status: "active",
    icon: "envelope",
    configurationsCount: 7,
    lastModified: "2024-01-14",
    triggerTypes: ["Contact Created", "Deal Stage Changed", "Email Opened", "Link Clicked"]
  },
  {
    id: "3",
    name: "Call Reminders",
    description: "Schedule automatic reminders for follow-up calls and meetings",
    category: "notification",
    status: "configured",
    icon: "phone",
    configurationsCount: 2,
    lastModified: "2024-01-13",
    triggerTypes: ["Call Scheduled", "Meeting Created", "Follow-up Due"]
  },
  {
    id: "4",
    name: "Deal Notifications",
    description: "Get notified when deals move through pipeline stages or reach milestones",
    category: "notification",
    status: "active",
    icon: "bell",
    configurationsCount: 5,
    lastModified: "2024-01-12",
    triggerTypes: ["Deal Created", "Stage Changed", "Value Updated", "Close Date Approaching"]
  },
  {
    id: "5",
    name: "Data Sync",
    description: "Synchronize contact and deal data with external CRM systems",
    category: "integration",
    status: "inactive",
    icon: "globe",
    configurationsCount: 1,
    lastModified: "2024-01-10",
    triggerTypes: ["Data Import", "Field Mapping", "Sync Schedule"]
  },
  {
    id: "6",
    name: "Report Generation",
    description: "Automatically generate and distribute reports on schedule",
    category: "automation",
    status: "configured",
    icon: "chart",
    configurationsCount: 4,
    lastModified: "2024-01-11",
    triggerTypes: ["Schedule Trigger", "Data Threshold", "Monthly Report"]
  },
  {
    id: "7",
    name: "Task Assignment",
    description: "Automatically create and assign tasks based on customer interactions",
    category: "workflow",
    status: "active",
    icon: "calendar",
    configurationsCount: 6,
    lastModified: "2024-01-09",
    triggerTypes: ["Email Received", "Meeting Completed", "Deal Won", "Support Ticket"]
  },
  {
    id: "8",
    name: "Security Alerts",
    description: "Monitor and alert on security-related events and data access",
    category: "notification",
    status: "active",
    icon: "shield",
    configurationsCount: 3,
    lastModified: "2024-01-08",
    triggerTypes: ["Failed Login", "Data Export", "Permission Change"]
  }
];

export default function ModulesIndex() {
  const params = useParams();
  const orgId = params.orgId;

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

  const getStatusColor = (status: Module["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "configured":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: Module["status"]) => {
    switch (status) {
      case "active":
        return "●";
      case "configured":
        return "◐";
      case "inactive":
        return "○";
      default:
        return "○";
    }
  };

  const activeModules = mockModules.filter(m => m.status === "active").length;
  const totalConfigurations = mockModules.reduce((sum, m) => sum + m.configurationsCount, 0);

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
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{mockModules.length}</dd>
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
            {mockModules.map((module) => (
              <Link
                key={module.id}
                to={`/organizations/${orgId}/modules/${module.id}`}
                className="group relative bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
              >
                <div>
                  {/* Module Icon and Status */}
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex p-3 rounded-lg ${getCategoryColor(module.category)} bg-opacity-10`}>
                      <div className="text-gray-600 dark:text-gray-300">
                        {getIcon(module.icon)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                        <span className="mr-1">{getStatusIcon(module.status)}</span>
                        {module.status}
                      </span>
                    </div>
                  </div>

                  {/* Module Info */}
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {module.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  {/* Module Category */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                      {module.category}
                    </span>
                  </div>

                  {/* Configuration Count and Triggers */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Configurations: {module.configurationsCount}</span>
                      <span>Modified: {new Date(module.lastModified).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Trigger Types Preview */}
                    <div className="flex flex-wrap gap-1">
                      {module.triggerTypes.slice(0, 2).map((trigger, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          {trigger}
                        </span>
                      ))}
                      {module.triggerTypes.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          +{module.triggerTypes.length - 2} more
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