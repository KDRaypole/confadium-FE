import { useState } from "react";
import { useReportBuilder } from "./ReportBuilderContext";
import SimpleSelect from "~/components/ui/SimpleSelect";
import {
  PlusIcon,
  TrashIcon,
  Squares2X2Icon,
  CalendarIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  type DateInterval,
  DATE_INTERVAL_LABELS,
} from "~/lib/api/reports";

export default function GroupingBuilder() {
  const {
    configuration,
    getEntitySchema,
    addGrouping,
    removeGrouping,
    reorderGroupings,
    setDateGrouping,
  } = useReportBuilder();

  const entitySchema = getEntitySchema();
  const groupings = configuration.groupings || [];
  const dateGrouping = configuration.dateGrouping;

  // Get attributes suitable for grouping (string/enum types, not datetime)
  const groupableAttributes =
    entitySchema?.attributes.filter(
      (a) => a.filterable && a.type === "string" && !a.format
    ) || [];

  // Get date/datetime attributes for date grouping
  const dateAttributes =
    entitySchema?.attributes.filter(
      (a) => a.format === "date" || a.format === "date-time"
    ) || [];

  const [showAddGrouping, setShowAddGrouping] = useState(false);

  if (!entitySchema) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Select an entity to configure groupings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Field Groupings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Squares2X2Icon className="h-5 w-5 text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Group By Fields
            </h4>
            {groupings.length > 0 && (
              <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                {groupings.length}
              </span>
            )}
          </div>
          {groupableAttributes.length > 0 && (
            <button
              onClick={() => setShowAddGrouping(!showAddGrouping)}
              className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80"
            >
              <PlusIcon className="h-4 w-4" />
              Add Grouping
            </button>
          )}
        </div>

        {/* Existing groupings */}
        {groupings.map((grouping, index) => (
          <div
            key={grouping.id}
            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            {/* Drag handle / reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  if (index > 0) reorderGroupings(index, index - 1);
                }}
                disabled={index === 0}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowsUpDownIcon className="h-3 w-3 rotate-180" />
              </button>
              <button
                onClick={() => {
                  if (index < groupings.length - 1)
                    reorderGroupings(index, index + 1);
                }}
                disabled={index === groupings.length - 1}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowsUpDownIcon className="h-3 w-3" />
              </button>
            </div>

            {/* Field label */}
            <div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                {index + 1}.
              </span>
              {formatFieldName(grouping.field)}
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeGrouping(grouping.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add new grouping */}
        {showAddGrouping && (
          <NewGroupingRow
            attributes={groupableAttributes}
            existingFields={groupings.map((g) => g.field)}
            onAdd={(field) => {
              addGrouping(field);
              setShowAddGrouping(false);
            }}
            onCancel={() => setShowAddGrouping(false)}
          />
        )}

        {groupings.length === 0 &&
          !showAddGrouping &&
          groupableAttributes.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No field groupings. Results will be aggregated as a single total.
            </p>
          )}

        {groupableAttributes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No groupable fields available for this entity.
          </p>
        )}
      </div>

      {/* Date Grouping */}
      {dateAttributes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Date Grouping
            </h4>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Group by:
            </label>

            {/* Date field selector */}
            <SimpleSelect
              options={[
                { value: "", label: "None" },
                ...dateAttributes.map((a) => ({
                  value: a.name,
                  label: formatFieldName(a.name),
                })),
              ]}
              value={dateGrouping?.field || ""}
              onChange={(field) => {
                if (field) {
                  setDateGrouping({
                    field,
                    interval: dateGrouping?.interval || "month",
                  });
                } else {
                  setDateGrouping(null);
                }
              }}
              placeholder="Select date field..."
              className="w-40"
              size="sm"
            />

            {/* Interval selector */}
            {dateGrouping?.field && (
              <>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  by:
                </label>
                <SimpleSelect
                  options={Object.entries(DATE_INTERVAL_LABELS).map(
                    ([value, label]) => ({
                      value,
                      label,
                    })
                  )}
                  value={dateGrouping.interval || "month"}
                  onChange={(interval) =>
                    setDateGrouping({
                      ...dateGrouping,
                      interval: interval as DateInterval,
                    })
                  }
                  placeholder="Interval"
                  className="w-32"
                  size="sm"
                />
              </>
            )}
          </div>

          {!dateGrouping && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable date grouping to see trends over time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── New Grouping Row Component ───────────────────────────────

interface NewGroupingRowProps {
  attributes: { name: string }[];
  existingFields: string[];
  onAdd: (field: string) => void;
  onCancel: () => void;
}

function NewGroupingRow({
  attributes,
  existingFields,
  onAdd,
  onCancel,
}: NewGroupingRowProps) {
  const [field, setField] = useState("");

  // Filter out already used fields
  const availableAttributes = attributes.filter(
    (a) => !existingFields.includes(a.name)
  );

  const options = availableAttributes.map((a) => ({
    value: a.name,
    label: formatFieldName(a.name),
  }));

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <SimpleSelect
        options={options}
        value={field}
        onChange={setField}
        placeholder="Select field to group by..."
        className="flex-1"
        size="sm"
      />

      <button
        onClick={() => field && onAdd(field)}
        disabled={!field}
        className="px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function formatFieldName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
