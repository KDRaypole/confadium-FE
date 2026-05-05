import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ReportBuilder } from "~/components/report-builder";
import { useReportSchema, useReports } from "~/hooks/useReports";
import type { ReportConfiguration } from "~/lib/api/reports";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Report - Confadium" },
    { name: "description", content: "Create a new custom report" },
  ];
};

export default function NewReportPage() {
  const navigate = useNavigate();
  const params = useParams();
  const orgId = params.orgId;

  const { schema, loading: schemaLoading } = useReportSchema();
  const { createReport } = useReports();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entity, setEntity] = useState("");
  const [configuration, setConfiguration] = useState<ReportConfiguration>({});
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ data: Record<string, unknown>[] } | undefined>();

  const handleSave = async () => {
    if (!name || !entity) return;

    setSaving(true);
    try {
      const result = await createReport({
        name,
        description,
        entity: entity as 'contacts' | 'deals' | 'activities',
        configuration,
      });

      // Navigate to the newly created report
      if (result.data?.id) {
        navigate(`/organizations/${orgId}/reports/${result.data.id}`);
      }
    } catch (error) {
      console.error("Failed to save report:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      // For new reports, we can't execute since they don't exist yet
      // Just show a placeholder result
      setExecutionResult({ data: [] });
    } finally {
      setExecuting(false);
    }
  };

  const handleChange = (data: {
    name: string;
    description: string;
    entity: string;
    configuration: ReportConfiguration;
  }) => {
    setName(data.name);
    setDescription(data.description);
    setEntity(data.entity);
    setConfiguration(data.configuration);
  };

  if (schemaLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
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
              Create New Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Build a custom report with filters, groupings, and visualizations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/organizations/${orgId}/reports`)}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !entity || saving}
            className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>

      {/* Report Builder */}
      <div className="flex-1 overflow-hidden">
        <ReportBuilder
          initialName={name}
          initialDescription={description}
          initialEntity={entity}
          initialConfiguration={configuration}
          schema={schema}
          executionResult={executionResult}
          onSave={handleChange}
          onExecute={handleExecute}
          executing={executing}
        />
      </div>
    </div>
  );
}
