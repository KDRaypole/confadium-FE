import { useState } from "react";
import { useReportBuilder } from "./ReportBuilderContext";
import SimpleSelect from "~/components/ui/SimpleSelect";
import type { ReportWidget, WidgetType, AggregationFunction, DateInterval } from "~/lib/api/reports";
import { AGGREGATION_LABELS, DATE_INTERVAL_LABELS } from "~/lib/api/reports";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface WidgetEditorProps {
  widget: ReportWidget;
  onUpdate: (changes: Partial<ReportWidget>) => void;
  onClose: () => void;
}

export default function WidgetEditor({
  widget,
  onUpdate,
  onClose,
}: WidgetEditorProps) {
  const { getEntitySchema } = useReportBuilder();
  const entitySchema = getEntitySchema();

  const [title, setTitle] = useState(widget.title);
  const [type, setType] = useState<WidgetType>(widget.type);
  const [config, setConfig] = useState(widget.config);

  const groupableAttributes =
    entitySchema?.attributes.filter(
      (a) => a.filterable && a.type === "string" && !a.format
    ) || [];

  const dateAttributes =
    entitySchema?.attributes.filter(
      (a) => a.format === "date" || a.format === "date-time"
    ) || [];

  const numericAttributes =
    entitySchema?.attributes.filter(
      (a) => a.type === "number" || a.type === "integer"
    ) || [];

  const handleSave = () => {
    onUpdate({
      title,
      type,
      config,
    });
    onClose();
  };

  const updateConfig = (changes: Partial<typeof config>) => {
    setConfig((prev) => ({ ...prev, ...changes }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Edit Widget
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Chart Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chart Type
          </label>
          <SimpleSelect
            options={[
              { value: "metric", label: "Metric Card" },
              { value: "bar", label: "Bar Chart" },
              { value: "pie", label: "Pie Chart" },
              { value: "line", label: "Line Chart" },
              { value: "area", label: "Area Chart" },
              { value: "table", label: "Data Table" },
            ]}
            value={type}
            onChange={(v) => setType(v as WidgetType)}
            className="w-full"
            size="sm"
          />
        </div>

        {/* Group By (for bar, pie) */}
        {(type === "bar" || type === "pie") && groupableAttributes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group By
            </label>
            <SimpleSelect
              options={[
                { value: "", label: "None" },
                ...groupableAttributes.map((a) => ({
                  value: a.name,
                  label: formatFieldName(a.name),
                })),
              ]}
              value={config.groupBy || ""}
              onChange={(v) => updateConfig({ groupBy: v || undefined })}
              className="w-full"
              size="sm"
            />
          </div>
        )}

        {/* Date Field (for line, area) */}
        {(type === "line" || type === "area") && dateAttributes.length > 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Field
              </label>
              <SimpleSelect
                options={dateAttributes.map((a) => ({
                  value: a.name,
                  label: formatFieldName(a.name),
                }))}
                value={config.dateField || dateAttributes[0]?.name || ""}
                onChange={(v) => updateConfig({ dateField: v })}
                className="w-full"
                size="sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Interval
              </label>
              <SimpleSelect
                options={Object.entries(DATE_INTERVAL_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  })
                )}
                value={config.dateInterval || "month"}
                onChange={(v) =>
                  updateConfig({ dateInterval: v as DateInterval })
                }
                className="w-full"
                size="sm"
              />
            </div>
          </>
        )}

        {/* Aggregation */}
        {type !== "table" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aggregation
            </label>

            <div className="space-y-2">
              <SimpleSelect
                options={Object.entries(AGGREGATION_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  })
                )}
                value={config.aggregation?.function || "count"}
                onChange={(v) =>
                  updateConfig({
                    aggregation: {
                      ...config.aggregation,
                      function: v as AggregationFunction,
                      field: config.aggregation?.field || "*",
                    },
                  })
                }
                placeholder="Function"
                className="w-full"
                size="sm"
              />

              <SimpleSelect
                options={[
                  { value: "*", label: "All Records" },
                  ...numericAttributes.map((a) => ({
                    value: a.name,
                    label: formatFieldName(a.name),
                  })),
                ]}
                value={config.aggregation?.field || "*"}
                onChange={(v) =>
                  updateConfig({
                    aggregation: {
                      function: config.aggregation?.function || "count",
                      field: v,
                    },
                  })
                }
                placeholder="Field"
                className="w-full"
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Table-specific options */}
        {type === "table" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Row Limit
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={config.limit || 10}
              onChange={(e) =>
                updateConfig({ limit: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        )}

        {/* Display Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Options
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showLegend !== false}
              onChange={(e) =>
                updateConfig({ showLegend: e.target.checked })
              }
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show legend
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showLabels !== false}
              onChange={(e) =>
                updateConfig({ showLabels: e.target.checked })
              }
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show data labels
            </span>
          </label>

          {type === "bar" && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.stacked || false}
                onChange={(e) =>
                  updateConfig({ stacked: e.target.checked })
                }
                className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Stacked bars
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function formatFieldName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
