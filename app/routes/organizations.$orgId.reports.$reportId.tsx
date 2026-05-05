import type { MetaFunction } from "@remix-run/node";
import { Link, useNavigate, useParams } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { ReportBuilder } from "~/components/report-builder";
import { useReport, useReportExecution, useReportSchema } from "~/hooks/useReports";
import type { ReportConfiguration } from "~/lib/api/reports";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNodeContext } from "~/contexts/NodeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Report Details - Confadium" },
    { name: "description", content: "View and edit report" },
  ];
};

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { orgId, reportId } = params;
  const { buildListPath } = useNodeContext();

  const { schema, loading: schemaLoading } = useReportSchema();
  const {
    report,
    loading: reportLoading,
    updateReport,
    deleteReport,
    updating,
  } = useReport(reportId);
  const {
    results: executionResult,
    loading: executionLoading,
    execute,
    executing,
  } = useReportExecution(reportId);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = useCallback(
    async (data: {
      name: string;
      description: string;
      entity: string;
      configuration: ReportConfiguration;
    }) => {
      setHasChanges(true);
      // Auto-save on change
      try {
        await updateReport({
          name: data.name,
          description: data.description,
          entity: data.entity as "contacts" | "deals" | "activities",
          configuration: data.configuration,
        });
        setHasChanges(false);
      } catch (error) {
        console.error("Failed to save report:", error);
      }
    },
    [updateReport]
  );

  const handleExecute = useCallback(async () => {
    try {
      await execute();
    } catch (error) {
      console.error("Failed to execute report:", error);
    }
  }, [execute]);

  const handleDelete = useCallback(async () => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport();
        navigate(`/organizations/${orgId}/reports`);
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
    }
  }, [deleteReport, navigate, orgId]);

  // Loading state
  if (schemaLoading || reportLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  // Report not found
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Report Not Found
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The report you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to={buildListPath("reports")}
          className="mt-4 text-brand-primary hover:text-brand-primary/80"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/organizations/${orgId}/reports`)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {report.attributes.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {report.attributes.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {updating && (
            <span className="text-sm text-gray-400">Saving...</span>
          )}
          {hasChanges && !updating && (
            <span className="text-sm text-amber-500">Unsaved changes</span>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Report Builder */}
      <div className="flex-1 overflow-hidden">
        <ReportBuilder
          reportId={report.id}
          initialName={report.attributes.name}
          initialDescription={report.attributes.description || ""}
          initialEntity={report.attributes.entity}
          initialConfiguration={report.attributes.configuration}
          schema={schema}
          executionResult={executionResult}
          onSave={handleSave}
          onExecute={handleExecute}
          executing={executing || executionLoading}
        />
      </div>
    </div>
  );
}
