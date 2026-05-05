import { useState } from "react";
import { useReportBuilder } from "./ReportBuilderContext";
import SimpleSelect from "~/components/ui/SimpleSelect";
import {
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import {
  type ReportAggregation,
  type AggregationFunction,
  AGGREGATION_LABELS,
} from "~/lib/api/reports";

export default function AggregationBuilder() {
  const {
    configuration,
    getEntitySchema,
    addAggregation,
    updateAggregation,
    removeAggregation,
  } = useReportBuilder();

  const entitySchema = getEntitySchema();
  const aggregations = configuration.aggregations || [];

  const aggregatableAttributes =
    entitySchema?.attributes.filter((a) => a.aggregatable) || [];

  const [showAddAggregation, setShowAddAggregation] = useState(false);

  if (!entitySchema) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Select an entity to configure aggregations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5 text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Aggregations
          </h4>
          {aggregations.length > 0 && (
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
              {aggregations.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddAggregation(!showAddAggregation)}
          className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80"
        >
          <PlusIcon className="h-4 w-4" />
          Add Aggregation
        </button>
      </div>

      {/* Existing aggregations */}
      {aggregations.map((agg) => (
        <AggregationRow
          key={agg.id}
          aggregation={agg}
          attributes={aggregatableAttributes}
          onUpdate={(changes) => updateAggregation(agg.id, changes)}
          onRemove={() => removeAggregation(agg.id)}
        />
      ))}

      {/* Add new aggregation */}
      {showAddAggregation && (
        <NewAggregationRow
          attributes={aggregatableAttributes}
          onAdd={(agg) => {
            addAggregation(agg);
            setShowAddAggregation(false);
          }}
          onCancel={() => setShowAddAggregation(false)}
        />
      )}

      {aggregations.length === 0 && !showAddAggregation && (
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>No aggregations configured.</p>
          <p className="text-xs">
            Default: Count of all records matching filters
          </p>
        </div>
      )}
    </div>
  );
}

// ── Aggregation Row Component ────────────────────────────────

interface AggregationRowProps {
  aggregation: ReportAggregation;
  attributes: { name: string; type: string; aggregations: string[] }[];
  onUpdate: (changes: Partial<ReportAggregation>) => void;
  onRemove: () => void;
}

function AggregationRow({
  aggregation,
  attributes,
  onUpdate,
  onRemove,
}: AggregationRowProps) {
  const attribute = attributes.find((a) => a.name === aggregation.field);
  const availableFunctions = getAvailableFunctions(attribute);

  const attributeOptions = [
    { value: "*", label: "All Records (Count)" },
    ...attributes.map((a) => ({
      value: a.name,
      label: formatFieldName(a.name),
    })),
  ];

  const functionOptions = availableFunctions.map((fn) => ({
    value: fn,
    label: AGGREGATION_LABELS[fn],
  }));

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Function selector */}
      <SimpleSelect
        options={functionOptions}
        value={aggregation.function}
        onChange={(fn) => onUpdate({ function: fn as AggregationFunction })}
        placeholder="Function"
        className="w-32"
        size="sm"
      />

      <span className="text-gray-400 text-sm">of</span>

      {/* Field selector */}
      <SimpleSelect
        options={attributeOptions}
        value={aggregation.field}
        onChange={(field) => {
          const newAttr = attributes.find((a) => a.name === field);
          const newFunctions = getAvailableFunctions(newAttr);
          onUpdate({
            field,
            // Reset function if current one is not available for new field
            function: newFunctions.includes(aggregation.function)
              ? aggregation.function
              : newFunctions[0],
          });
        }}
        placeholder="Field"
        className="flex-1"
        size="sm"
      />

      {/* Preview label */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
        {`${aggregation.function}_${aggregation.field}`}
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── New Aggregation Row Component ────────────────────────────

interface NewAggregationRowProps {
  attributes: { name: string; type: string; aggregations: string[] }[];
  onAdd: (agg: Omit<ReportAggregation, "id">) => void;
  onCancel: () => void;
}

function NewAggregationRow({
  attributes,
  onAdd,
  onCancel,
}: NewAggregationRowProps) {
  const [field, setField] = useState("*");
  const [func, setFunc] = useState<AggregationFunction>("count");

  const attribute = attributes.find((a) => a.name === field);
  const availableFunctions = getAvailableFunctions(attribute);

  const attributeOptions = [
    { value: "*", label: "All Records (Count)" },
    ...attributes.map((a) => ({
      value: a.name,
      label: formatFieldName(a.name),
    })),
  ];

  const functionOptions = availableFunctions.map((fn) => ({
    value: fn,
    label: AGGREGATION_LABELS[fn],
  }));

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Function selector */}
      <SimpleSelect
        options={functionOptions}
        value={func}
        onChange={(fn) => setFunc(fn as AggregationFunction)}
        placeholder="Function"
        className="w-32"
        size="sm"
      />

      <span className="text-gray-400 text-sm">of</span>

      {/* Field selector */}
      <SimpleSelect
        options={attributeOptions}
        value={field}
        onChange={(f) => {
          setField(f);
          const newAttr = attributes.find((a) => a.name === f);
          const newFunctions = getAvailableFunctions(newAttr);
          if (!newFunctions.includes(func)) {
            setFunc(newFunctions[0]);
          }
        }}
        placeholder="Select field..."
        className="flex-1"
        size="sm"
      />

      {/* Action buttons */}
      <button
        onClick={() => onAdd({ field, function: func })}
        className="px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
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

function getAvailableFunctions(
  attribute?: { type: string; aggregations?: string[] }
): AggregationFunction[] {
  if (!attribute) {
    return ["count"];
  }

  // If attribute has explicit aggregations, use those
  if (attribute.aggregations?.length) {
    return attribute.aggregations.filter(
      (a) => a !== "date_histogram"
    ) as AggregationFunction[];
  }

  // Default based on type
  if (attribute.type === "number" || attribute.type === "integer") {
    return ["count", "sum", "avg", "min", "max"];
  }

  return ["count"];
}

function formatFieldName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
