import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { ChartBarIcon, DocumentArrowDownIcon, CalendarIcon, CurrencyDollarIcon, UsersIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useOptionalNodeContext } from "~/contexts/NodeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Reports - CRM Dashboard" },
    { name: "description", content: "View analytics and generate reports" },
  ];
};

interface ReportAttributes {
  name: string;
  description: string;
  category: "sales" | "contacts" | "calls" | "activities";
  last_generated: string;
  icon: string;
}

interface Report {
  id: string;
  type: string;
  attributes: ReportAttributes;
}

const mockReports: Report[] = [
  {
    id: "1",
    type: "report",
    attributes: {
      name: "Sales Performance",
      description: "Monthly sales performance and revenue trends",
      category: "sales",
      last_generated: "2024-01-15",
      icon: "chart"
    }
  },
  {
    id: "2",
    type: "report",
    attributes: {
      name: "Contact Activity Summary",
      description: "Contact engagement and interaction summary",
      category: "contacts",
      last_generated: "2024-01-14",
      icon: "users"
    }
  },
  {
    id: "3",
    type: "report",
    attributes: {
      name: "Call Log Analysis",
      description: "Call volume, duration, and success rate analysis",
      category: "calls",
      last_generated: "2024-01-13",
      icon: "phone"
    }
  },
  {
    id: "4",
    type: "report",
    attributes: {
      name: "Deal Pipeline Report",
      description: "Current deals status and pipeline health",
      category: "sales",
      last_generated: "2024-01-12",
      icon: "currency"
    }
  },
  {
    id: "5",
    type: "report",
    attributes: {
      name: "Activity Timeline",
      description: "Timeline of all customer interactions and activities",
      category: "activities",
      last_generated: "2024-01-11",
      icon: "calendar"
    }
  }
];

export default function ReportsIndex() {
  const params = useParams();
  const orgId = params.orgId;
  const nodeCtx = useOptionalNodeContext();
  
  const getCategoryColor = (category: ReportAttributes["category"]) => {
    switch (category) {
      case "sales":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "contacts":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "calls":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "activities":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "chart":
        return <ChartBarIcon className="h-6 w-6" />;
      case "users":
        return <UsersIcon className="h-6 w-6" />;
      case "phone":
        return <PhoneIcon className="h-6 w-6" />;
      case "currency":
        return <CurrencyDollarIcon className="h-6 w-6" />;
      case "calendar":
        return <CalendarIcon className="h-6 w-6" />;
      default:
        return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Generate insights and analytics from your CRM data
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">$2,847,500</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Contacts</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">1,247</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Calls This Month</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">347</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Conversion Rate</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">23.4%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Available Reports</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Generate and download detailed reports for analysis
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mockReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                    {getIcon(report.attributes.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {report.attributes.name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.attributes.category)}`}>
                        {report.attributes.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {report.attributes.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Last generated: {new Date(report.attributes.last_generated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={nodeCtx?.buildDetailPath('reports', report.id) ?? `/organizations/${orgId}/reports/${report.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ChartBarIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    View
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Generate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Revenue Trend</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Revenue Chart</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Chart visualization will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}