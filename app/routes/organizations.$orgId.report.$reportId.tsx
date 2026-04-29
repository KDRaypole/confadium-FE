import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";
import { 
  ArrowLeftIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  PhoneIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Report Details - CRM Dashboard" },
    { name: "description", content: "Detailed view of report analytics and data" },
  ];
};

interface ReportData {
  id: string;
  name: string;
  description: string;
  category: "sales" | "contacts" | "calls" | "activities";
  dateRange: {
    start: string;
    end: string;
  };
  lastGenerated: string;
  totalRecords: number;
  keyMetrics: {
    primaryValue: number;
    primaryLabel: string;
    change: number;
    changeType: "increase" | "decrease" | "neutral";
    comparisonPeriod: string;
  };
}

// Simplified mock data for testing
const getReportData = (reportId: string): ReportData => {
  return {
    id: reportId || "1",
    name: "Sales Performance",
    description: "Monthly sales performance and revenue trends",
    category: "sales",
    dateRange: {
      start: "2024-01-01",
      end: "2024-01-31"
    },
    lastGenerated: "2024-01-31T23:59:59",
    totalRecords: 1247,
    keyMetrics: {
      primaryValue: 2847500,
      primaryLabel: "Total Revenue",
      change: 15.8,
      changeType: "increase",
      comparisonPeriod: "vs last month"
    }
  };
};

export default function ReportShow() {
  const params = useParams();
  const { orgId, reportId } = params;
  const { buildListPath } = useNodeContext();

  const reportData = getReportData(reportId!);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sales":
        return <CurrencyDollarIcon className="h-6 w-6" />;
      case "contacts":
        return <UsersIcon className="h-6 w-6" />;
      case "calls":
        return <PhoneIcon className="h-6 w-6" />;
      case "activities":
        return <CalendarIcon className="h-6 w-6" />;
      default:
        return <ChartBarIcon className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
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

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb and Back Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={buildListPath('reports')} className="hover:text-gray-700 dark:hover:text-gray-200">
                Reports
              </Link>
              <span>/</span>
              <span>{reportData.name}</span>
            </nav>
            
            <div className="flex items-center">
              <Link
                to={buildListPath('reports')}
                className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Reports
              </Link>
            </div>
          </div>

          {/* Report Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400">
                      {getCategoryIcon(reportData.category)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportData.name}</h1>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(reportData.category)}`}>
                        {reportData.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{reportData.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(reportData.dateRange.start).toLocaleDateString()} - {new Date(reportData.dateRange.end).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Generated {new Date(reportData.lastGenerated).toLocaleString()}
                      </span>
                      <span>{reportData.totalRecords.toLocaleString()} records</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getCategoryIcon(reportData.category)}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {reportData.keyMetrics.primaryLabel}
                      </dt>
                      <dd className="flex items-center">
                        <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {reportData.category === "sales" 
                            ? formatCurrency(reportData.keyMetrics.primaryValue)
                            : reportData.keyMetrics.primaryValue.toLocaleString()
                          }
                        </div>
                        <div className={`ml-2 flex items-center text-sm ${
                          reportData.keyMetrics.changeType === "increase" 
                            ? "text-green-600 dark:text-green-400" 
                            : reportData.keyMetrics.changeType === "decrease"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {reportData.keyMetrics.changeType === "increase" && (
                            <ChevronUpIcon className="flex-shrink-0 h-4 w-4" />
                          )}
                          {reportData.keyMetrics.changeType === "decrease" && (
                            <ChevronDownIcon className="flex-shrink-0 h-4 w-4" />
                          )}
                          <span className="ml-1">
                            {formatPercentage(reportData.keyMetrics.change)}
                          </span>
                        </div>
                      </dd>
                      <dd className="text-xs text-gray-500 dark:text-gray-400">
                        {reportData.keyMetrics.comparisonPeriod}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional placeholder metrics */}
            {[
              { label: "Deals Closed", value: 89, change: 17.1, unit: "" },
              { label: "Avg Deal Size", value: 31980, change: -1.3, unit: "$" },
              { label: "Win Rate", value: 68.2, change: 5.2, unit: "%" }
            ].map((metric, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">#</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {metric.label}
                        </dt>
                        <dd className="flex items-center">
                          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {metric.unit === "$" ? formatCurrency(metric.value) : 
                             metric.unit === "%" ? `${metric.value}%` : 
                             metric.value.toLocaleString()}
                          </div>
                          <div className={`ml-2 flex items-center text-sm ${
                            metric.change > 0 
                              ? "text-green-600 dark:text-green-400" 
                              : metric.change < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {metric.change > 0 && <ChevronUpIcon className="flex-shrink-0 h-4 w-4" />}
                            {metric.change < 0 && <ChevronDownIcon className="flex-shrink-0 h-4 w-4" />}
                            <span className="ml-1">
                              {formatPercentage(metric.change)}
                            </span>
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Report Charts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive charts and data visualization will be displayed here
              </p>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Report Visualization</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Charts and graphs will be displayed here</p>
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Report ID: {reportId} | Org ID: {orgId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}