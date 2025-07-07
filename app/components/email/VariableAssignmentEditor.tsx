import React, { useState, useEffect } from "react";
import { 
  ChevronDownIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import SimpleSelect from "~/components/ui/SimpleSelect";

export interface EntityField {
  value: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select";
  options?: string[];
  description?: string;
}

export interface VariableAssignment {
  templateVariable: string;
  entityField?: string;
  staticValue?: string;
  conversion?: {
    type: "format_date" | "format_currency" | "format_number" | "capitalize" | "uppercase" | "lowercase";
    options?: Record<string, any>;
  };
}

interface VariableAssignmentEditorProps {
  templateVariables: string[];
  entityType: string;
  entityFields: EntityField[];
  assignments: VariableAssignment[];
  onAssignmentsChange: (assignments: VariableAssignment[]) => void;
  isDarkMode?: boolean;
}

// Variable type inference based on name patterns
const inferVariableType = (variableName: string): "text" | "email" | "number" | "date" => {
  const name = variableName.toLowerCase();
  
  if (name.includes("email") || name.includes("mail")) return "email";
  if (name.includes("date") || name.includes("time") || name.includes("created") || name.includes("updated")) return "date";
  if (name.includes("value") || name.includes("amount") || name.includes("price") || name.includes("cost") || name.includes("score")) return "number";
  
  return "text";
};

// Check if entity field type is compatible with variable type
const isTypeCompatible = (variableType: string, fieldType: string): boolean => {
  const compatibilityMap: Record<string, string[]> = {
    text: ["text", "email", "select", "number", "date"], // Text can accept any type with conversion
    email: ["email", "text"],
    number: ["number", "text"],
    date: ["date", "text"]
  };
  
  return compatibilityMap[variableType]?.includes(fieldType) || false;
};

// Get available conversions for field type to variable type
const getAvailableConversions = (fieldType: string, variableType: string) => {
  const conversions = [];
  
  if (fieldType === "date" && variableType === "text") {
    conversions.push(
      { value: "format_date", label: "Format Date", description: "Format as readable date (e.g., Jan 15, 2024)" }
    );
  }
  
  if (fieldType === "number" && variableType === "text") {
    conversions.push(
      { value: "format_currency", label: "Format Currency", description: "Format as currency (e.g., $1,234.56)" },
      { value: "format_number", label: "Format Number", description: "Format with commas (e.g., 1,234)" }
    );
  }
  
  if (fieldType === "text") {
    conversions.push(
      { value: "capitalize", label: "Capitalize", description: "Capitalize first letter" },
      { value: "uppercase", label: "Uppercase", description: "Convert to uppercase" },
      { value: "lowercase", label: "Lowercase", description: "Convert to lowercase" }
    );
  }
  
  return conversions;
};

const AssignmentRow: React.FC<{
  assignment: VariableAssignment;
  entityFields: EntityField[];
  onUpdate: (assignment: VariableAssignment) => void;
  onRemove: () => void;
  isDarkMode?: boolean;
}> = ({ assignment, entityFields, onUpdate, onRemove, isDarkMode }) => {
  const [sourceType, setSourceType] = useState<"entity" | "static">(
    assignment.entityField ? "entity" : "static"
  );
  
  const variableType = inferVariableType(assignment.templateVariable);
  const selectedField = entityFields.find(f => f.value === assignment.entityField);
  const isCompatible = selectedField ? isTypeCompatible(variableType, selectedField.type) : true;
  const needsConversion = selectedField && selectedField.type !== variableType && selectedField.type !== "text";
  const availableConversions = selectedField ? getAvailableConversions(selectedField.type, variableType) : [];

  const handleSourceTypeChange = (type: "entity" | "static") => {
    setSourceType(type);
    if (type === "entity") {
      onUpdate({
        ...assignment,
        staticValue: undefined,
        entityField: entityFields[0]?.value || ""
      });
    } else {
      onUpdate({
        ...assignment,
        entityField: undefined,
        conversion: undefined,
        staticValue: ""
      });
    }
  };

  const handleEntityFieldChange = (fieldValue: string) => {
    const field = entityFields.find(f => f.value === fieldValue);
    onUpdate({
      ...assignment,
      entityField: fieldValue,
      conversion: field && needsConversion ? undefined : assignment.conversion
    });
  };

  const handleConversionChange = (conversionType: string) => {
    onUpdate({
      ...assignment,
      conversion: conversionType ? { type: conversionType as any } : undefined
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {assignment.templateVariable}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Expected type: {variableType}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Remove assignment"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Source Type Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          Value Source
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={sourceType === "entity"}
              onChange={() => handleSourceTypeChange("entity")}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">From Entity Field</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={sourceType === "static"}
              onChange={() => handleSourceTypeChange("static")}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Static Value</span>
          </label>
        </div>
      </div>

      {sourceType === "entity" ? (
        <div className="space-y-3">
          {/* Entity Field Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entity Field
            </label>
            <SimpleSelect
              options={entityFields.map(field => ({
                value: field.value,
                label: `${field.label} (${field.type})`
              }))}
              value={assignment.entityField || ""}
              onChange={handleEntityFieldChange}
              size="sm"
            />
            {selectedField?.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {selectedField.description}
              </p>
            )}
          </div>

          {/* Compatibility Warning */}
          {selectedField && !isCompatible && (
            <div className="flex items-start space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Type mismatch:</strong> {selectedField.type} field mapped to {variableType} variable. 
                Consider using a conversion or different field.
              </div>
            </div>
          )}

          {/* Conversion Options */}
          {selectedField && availableConversions.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value Conversion {needsConversion && <span className="text-red-500">*</span>}
              </label>
              <SimpleSelect
                options={[
                  { value: "", label: "No conversion" },
                  ...availableConversions.map(conv => ({
                    value: conv.value,
                    label: conv.label
                  }))
                ]}
                value={assignment.conversion?.type || ""}
                onChange={handleConversionChange}
                size="sm"
              />
              {assignment.conversion && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {availableConversions.find(c => c.value === assignment.conversion?.type)?.description}
                </p>
              )}
              {needsConversion && !assignment.conversion && (
                <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded mt-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-700 dark:text-red-300">
                    Conversion required for {selectedField.type} to {variableType} mapping.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Static Value
          </label>
          <input
            type="text"
            value={assignment.staticValue || ""}
            onChange={(e) => onUpdate({
              ...assignment,
              staticValue: e.target.value
            })}
            placeholder={`Enter ${variableType} value...`}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default function VariableAssignmentEditor({
  templateVariables,
  entityType,
  entityFields,
  assignments,
  onAssignmentsChange,
  isDarkMode = false
}: VariableAssignmentEditorProps) {
  const [unassignedVariables, setUnassignedVariables] = useState<string[]>([]);

  useEffect(() => {
    const assignedVars = new Set(assignments.map(a => a.templateVariable));
    setUnassignedVariables(templateVariables.filter(v => !assignedVars.has(v)));
  }, [templateVariables, assignments]);

  const addAssignment = (variable: string) => {
    const newAssignment: VariableAssignment = {
      templateVariable: variable,
      entityField: entityFields[0]?.value || "",
      staticValue: undefined
    };

    onAssignmentsChange([...assignments, newAssignment]);
  };

  const updateAssignment = (index: number, assignment: VariableAssignment) => {
    const newAssignments = [...assignments];
    newAssignments[index] = assignment;
    onAssignmentsChange(newAssignments);
  };

  const removeAssignment = (index: number) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    onAssignmentsChange(newAssignments);
  };

  const autoAssignVariables = () => {
    const newAssignments = [...assignments];
    
    unassignedVariables.forEach(variable => {
      // Try to find a matching entity field by name similarity
      const varName = variable.toLowerCase().replace(/_/g, "");
      const matchingField = entityFields.find(field => {
        const fieldName = field.value.toLowerCase().replace(/\./g, "");
        return fieldName.includes(varName) || varName.includes(fieldName);
      });

      newAssignments.push({
        templateVariable: variable,
        entityField: matchingField?.value || entityFields[0]?.value || "",
        staticValue: undefined
      });
    });

    onAssignmentsChange(newAssignments);
  };

  if (templateVariables.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <InformationCircleIcon className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">No variables found in the selected template.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Variable Assignment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Map template variables to {entityType} fields or static values
          </p>
        </div>
        {unassignedVariables.length > 0 && (
          <button
            onClick={autoAssignVariables}
            className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            Auto-assign Variables
          </button>
        )}
      </div>

      {/* Current Assignments */}
      {assignments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Current Assignments
          </h4>
          <div className="space-y-3">
            {assignments.map((assignment, index) => (
              <AssignmentRow
                key={assignment.templateVariable}
                assignment={assignment}
                entityFields={entityFields}
                onUpdate={(updatedAssignment) => updateAssignment(index, updatedAssignment)}
                onRemove={() => removeAssignment(index)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unassigned Variables */}
      {unassignedVariables.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Unassigned Variables
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unassignedVariables.map(variable => (
              <div 
                key={variable}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {variable}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type: {inferVariableType(variable)}
                  </p>
                </div>
                <button
                  onClick={() => addAssignment(variable)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Variables: {assignments.length} assigned, {unassignedVariables.length} unassigned
          </span>
          {assignments.length === templateVariables.length && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✓ All variables assigned
            </span>
          )}
        </div>
      </div>
    </div>
  );
}