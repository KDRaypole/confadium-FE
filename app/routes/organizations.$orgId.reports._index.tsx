import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  PhoneIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useOptionalNodeContext } from "~/contexts/NodeContext";
import { useReports } from "~/hooks/useReports";
import type { Report } from "~/hooks/useReports";

export const meta: MetaFunction = () => {
  return [
    { title: "Reports - Confadium" },
    { name: "description", content: "View analytics and generate reports" },
  ];
};

export default function ReportsIndex() {
  const params = useParams();
  const orgId = params.orgId;
  const nodeCtx = useOptionalNodeContext();
  const { reports, loading, deleteReport, total } = useReports();

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case "contacts":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "deals":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "activities":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "contacts":
        return <UsersIcon className="h-6 w-6" />;
      case "deals":
        return <CurrencyDollarIcon className="h-6 w-6" />;
      case "activities":
        return <ClipboardDocumentListIcon className="h-6 w-6" />;
      default:
        return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteReport(reportId);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create custom reports with filters, groupings, and visualizations
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to={`/organizations/${orgId}/reports/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Report
          </Link>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Reports</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {total > 0 ? `${total} custom reports` : "Create your first custom report"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No reports yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new report
            </p>
            <div className="mt-6">
              <Link
                to={`/organizations/${orgId}/reports/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-primary/90"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={nodeCtx?.buildDetailPath('reports', report.id) ?? `/organizations/${orgId}/reports/${report.id}`}
                className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                      {getEntityIcon(report.attributes.entity)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {report.attributes.name}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getEntityColor(report.attributes.entity)}`}>
                          {report.attributes.entity}
                        </span>
                      </div>
                      {report.attributes.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {report.attributes.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Created: {new Date(report.attributes.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-gray-700 dark:text-gray-200">
                      <ChartBarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      View
                    </span>
                    <button
                      onClick={(e) => handleDelete(report.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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