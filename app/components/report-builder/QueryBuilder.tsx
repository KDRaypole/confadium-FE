import { useState } from "react";
import { useReportBuilder } from "./ReportBuilderContext";
import SimpleSelect from "~/components/ui/SimpleSelect";
import {
  PlusIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  type ReportFilter,
  type FilterOperator,
  getFilterInputType,
  getOperatorsForType,
  OPERATOR_LABELS,
} from "~/lib/api/reports";

export default function QueryBuilder() {
  const { configuration, getEntitySchema, addFilter, updateFilter, removeFilter } =
    useReportBuilder();

  const entitySchema = getEntitySchema();
  const filters = configuration.filters || [];

  const filterableAttributes =
    entitySchema?.attributes.filter((a) => a.filterable) || [];

  const [showAddFilter, setShowAddFilter] = useState(false);

  if (!entitySchema) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        Select an entity to configure filters
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Filters
          </h4>
          {filters.length > 0 && (
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
              {filters.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddFilter(!showAddFilter)}
          className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80"
        >
          <PlusIcon className="h-4 w-4" />
          Add Filter
        </button>
      </div>

      {/* Existing filters */}
      {filters.map((filter) => (
        <FilterRow
          key={filter.id}
          filter={filter}
          attributes={filterableAttributes}
          onUpdate={(changes) => updateFilter(filter.id, changes)}
          onRemove={() => removeFilter(filter.id)}
        />
      ))}

      {/* Add new filter */}
      {showAddFilter && (
        <NewFilterRow
          attributes={filterableAttributes}
          onAdd={(filter) => {
            addFilter(filter);
            setShowAddFilter(false);
          }}
          onCancel={() => setShowAddFilter(false)}
        />
      )}

      {filters.length === 0 && !showAddFilter && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No filters applied. All records will be included.
        </p>
      )}
    </div>
  );
}

// ── Filter Row Component ─────────────────────────────────────

interface FilterRowProps {
  filter: ReportFilter;
  attributes: { name: string; type: string; format?: string }[];
  onUpdate: (changes: Partial<ReportFilter>) => void;
  onRemove: () => void;
}

function FilterRow({ filter, attributes, onUpdate, onRemove }: FilterRowProps) {
  const attribute = attributes.find((a) => a.name === filter.field);
  const operators = attribute
    ? getOperatorsForType(attribute as any)
    : (["eq", "neq"] as FilterOperator[]);
  const inputType = attribute ? getFilterInputType(attribute as any) : "text";

  const attributeOptions = attributes.map((a) => ({
    value: a.name,
    label: formatFieldName(a.name),
  }));

  const operatorOptions = operators.map((op) => ({
    value: op,
    label: OPERATOR_LABELS[op],
  }));

  const needsValue = !["is_null", "is_not_null"].includes(filter.operator);
  const isBetween = filter.operator === "between";

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Field selector */}
      <SimpleSelect
        options={attributeOptions}
        value={filter.field}
        onChange={(field) => onUpdate({ field })}
        placeholder="Field"
        className="w-40"
        size="sm"
      />

      {/* Operator selector */}
      <SimpleSelect
        options={operatorOptions}
        value={filter.operator}
        onChange={(op) => onUpdate({ operator: op as FilterOperator })}
        placeholder="Operator"
        className="w-40"
        size="sm"
      />

      {/* Value input */}
      {needsValue && !isBetween && (
        <FilterValueInput
          type={inputType}
          value={filter.value}
          onChange={(value) => onUpdate({ value })}
          operator={filter.operator}
        />
      )}

      {/* Between range inputs */}
      {isBetween && (
        <div className="flex items-center gap-2">
          <FilterValueInput
            type={inputType}
            value={(filter.value as { from?: unknown })?.from}
            onChange={(from) =>
              onUpdate({ value: { ...(filter.value as object), from } })
            }
            placeholder="From"
          />
          <span className="text-gray-400">to</span>
          <FilterValueInput
            type={inputType}
            value={(filter.value as { to?: unknown })?.to}
            onChange={(to) =>
              onUpdate({ value: { ...(filter.value as object), to } })
            }
            placeholder="To"
          />
        </div>
      )}

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

// ── New Filter Row Component ─────────────────────────────────

interface NewFilterRowProps {
  attributes: { name: string; type: string; format?: string }[];
  onAdd: (filter: Omit<ReportFilter, "id">) => void;
  onCancel: () => void;
}

function NewFilterRow({ attributes, onAdd, onCancel }: NewFilterRowProps) {
  const [field, setField] = useState("");
  const [operator, setOperator] = useState<FilterOperator>("eq");
  const [value, setValue] = useState<unknown>("");

  const attribute = attributes.find((a) => a.name === field);
  const operators = attribute
    ? getOperatorsForType(attribute as any)
    : (["eq", "neq"] as FilterOperator[]);
  const inputType = attribute ? getFilterInputType(attribute as any) : "text";

  const attributeOptions = attributes.map((a) => ({
    value: a.name,
    label: formatFieldName(a.name),
  }));

  const operatorOptions = operators.map((op) => ({
    value: op,
    label: OPERATOR_LABELS[op],
  }));

  const needsValue = !["is_null", "is_not_null"].includes(operator);

  const canAdd = field && operator && (needsValue ? value !== "" : true);

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Field selector */}
      <SimpleSelect
        options={attributeOptions}
        value={field}
        onChange={(f) => {
          setField(f);
          setValue("");
        }}
        placeholder="Select field..."
        className="w-40"
        size="sm"
      />

      {/* Operator selector */}
      <SimpleSelect
        options={operatorOptions}
        value={operator}
        onChange={(op) => setOperator(op as FilterOperator)}
        placeholder="Operator"
        className="w-40"
        size="sm"
      />

      {/* Value input */}
      {needsValue && (
        <FilterValueInput
          type={inputType}
          value={value}
          onChange={setValue}
          operator={operator}
        />
      )}

      {/* Action buttons */}
      <button
        onClick={() => onAdd({ field, operator, value })}
        disabled={!canAdd}
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

// ── Filter Value Input Component ─────────────────────────────

interface FilterValueInputProps {
  type: "text" | "number" | "date" | "datetime" | "boolean" | "select";
  value: unknown;
  onChange: (value: unknown) => void;
  operator?: FilterOperator;
  placeholder?: string;
}

function FilterValueInput({
  type,
  value,
  onChange,
  operator,
  placeholder = "Value",
}: FilterValueInputProps) {
  const baseClasses =
    "px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary";

  if (type === "boolean") {
    return (
      <SimpleSelect
        options={[
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ]}
        value={String(value)}
        onChange={(v) => onChange(v === "true")}
        placeholder="Select..."
        className="w-24"
        size="sm"
      />
    );
  }

  if (type === "number") {
    return (
      <input
        type="number"
        value={value as number}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className={`${baseClasses} w-28`}
      />
    );
  }

  if (type === "date") {
    return (
      <input
        type="date"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} w-36`}
      />
    );
  }

  if (type === "datetime") {
    return (
      <input
        type="datetime-local"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseClasses} w-44`}
      />
    );
  }

  // Default: text input (supports 'in' operator for comma-separated values)
  return (
    <input
      type="text"
      value={value as string}
      onChange={(e) => {
        if (operator === "in") {
          onChange(e.target.value.split(",").map((v) => v.trim()));
        } else {
          onChange(e.target.value);
        }
      }}
      placeholder={operator === "in" ? "value1, value2, ..." : placeholder}
      className={`${baseClasses} w-40`}
    />
  );
}

// ── Helpers ──────────────────────────────────────────────────

function formatFieldName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
