import { useState } from "react";
import {
  ReportBuilderProvider,
  useReportBuilder,
} from "./ReportBuilderContext";
import EntitySelector from "./EntitySelector";
import QueryBuilder from "./QueryBuilder";
import AggregationBuilder from "./AggregationBuilder";
import GroupingBuilder from "./GroupingBuilder";
import ChartWidgetPalette, { ChartWidgetToolbar } from "./ChartWidgetPalette";
import ReportDashboard from "./ReportDashboard";
import type {
  ReportConfiguration,
  ReportableSchema,
  ReportExecutionResult,
} from "~/lib/api/reports";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EyeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

interface ReportBuilderProps {
  reportId?: string;
  initialName?: string;
  initialDescription?: string;
  initialEntity?: string;
  initialConfiguration?: ReportConfiguration;
  schema?: ReportableSchema;
  executionResult?: ReportExecutionResult;
  onSave?: (data: {
    name: string;
    description: string;
    entity: string;
    configuration: ReportConfiguration;
  }) => void;
  onExecute?: () => void;
  executing?: boolean;
}

export default function ReportBuilder({
  reportId,
  initialName,
  initialDescription,
  initialEntity,
  initialConfiguration,
  schema,
  executionResult,
  onSave,
  onExecute,
  executing,
}: ReportBuilderProps) {
  return (
    <ReportBuilderProvider
      initialReportId={reportId}
      initialName={initialName}
      initialDescription={initialDescription}
      initialEntity={initialEntity}
      initialConfiguration={initialConfiguration}
      initialSchema={schema}
      onChange={onSave}
    >
      <ReportBuilderContent
        executionResult={executionResult}
        onExecute={onExecute}
        executing={executing}
      />
    </ReportBuilderProvider>
  );
}

// ── Main Content Component ───────────────────────────────────

interface ReportBuilderContentProps {
  executionResult?: ReportExecutionResult;
  onExecute?: () => void;
  executing?: boolean;
}

function ReportBuilderContent({
  executionResult,
  onExecute,
  executing,
}: ReportBuilderContentProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    entity,
    editMode,
    setEditMode,
    previewMode,
    setPreviewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useReportBuilder();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"query" | "widgets">("query");

  // No entity selected yet - show entity selector
  if (!entity) {
    return (
      <div className="p-6">
        <EntitySelector />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-all duration-200 overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <EntitySelector />
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("query")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "query"
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Query
            </button>
            <button
              onClick={() => setActiveTab("widgets")}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "widgets"
                  ? "text-brand-primary border-b-2 border-brand-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Widgets
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === "query" && (
              <>
                <QueryBuilder />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <GroupingBuilder />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <AggregationBuilder />
                </div>
              </>
            )}
            {activeTab === "widgets" && <ChartWidgetPalette />}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        style={{ left: sidebarOpen ? "319px" : "0" }}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4 min-w-0">
            {/* Report Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Untitled Report"
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 min-w-0"
            />
            {isDirty && (
              <span className="text-xs text-gray-400">Unsaved changes</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo"
              >
                <ArrowUturnLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo"
              >
                <ArrowUturnRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Widget Toolbar */}
            <div className="border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
              <ChartWidgetToolbar />
            </div>

            {/* Edit/Preview Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => {
                  setEditMode(true);
                  setPreviewMode(false);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                  editMode && !previewMode
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setPreviewMode(true);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                  previewMode
                    ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <EyeIcon className="h-4 w-4" />
                Preview
              </button>
            </div>

            {/* Execute Button */}
            <button
              onClick={onExecute}
              disabled={executing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {executing ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              {executing ? "Running..." : "Run Report"}
            </button>
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-gray-900">
          <ReportDashboard
            data={executionResult?.data || []}
            editMode={editMode && !previewMode}
          />
        </div>
      </div>
    </div>
  );
}
