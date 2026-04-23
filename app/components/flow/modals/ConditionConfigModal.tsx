import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon, PlusIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SimpleSelect from '~/components/ui/SimpleSelect';
import { getTagColorClass } from '~/components/tags/TagsData';
import { useDarkMode } from '~/contexts/DarkModeContext';
import { useTags } from '~/hooks/useTags';
import { formsApi, type FormField } from '~/lib/api/forms';

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: "AND" | "OR";
}

interface TriggerConfig {
  entityType: string;
  action: string;
  attributeFilter?: string;
  formId?: string;
}

export interface CrmFieldConfig {
  value: string;
  label: string;
  type: string;
  options?: string[];
}

interface ConditionConfigModalProps {
  isOpen: boolean;
  conditions?: Condition[];
  trigger?: TriggerConfig;
  crmFields?: CrmFieldConfig[];
  onSave: (conditions: Condition[]) => void;
  onClose: () => void;
}

// Default CRM field options (fallback when schema is not provided)
const getBaseCrmFields = (): CrmFieldConfig[] => [
  { value: "contact.name", label: "Contact Name", type: "text" },
  { value: "contact.email", label: "Contact Email", type: "email" },
  { value: "contact.phone", label: "Contact Phone", type: "text" },
  { value: "contact.company", label: "Company", type: "text" },
  { value: "contact.status", label: "Contact Status", type: "select", options: ["hot", "warm", "cold"] },
  { value: "contact.source", label: "Lead Source", type: "select", options: ["Website", "Email", "Phone", "Social Media", "Referral"] },
  { value: "contact.score", label: "Lead Score", type: "number" },
  { value: "contact.value", label: "Estimated Value", type: "number" },
  { value: "contact.territory", label: "Territory", type: "text" },
  { value: "contact.lastContact", label: "Last Contact Date", type: "date" },
  { value: "contact.tags", label: "Contact Tags", type: "tag" },
  { value: "deal.stage", label: "Deal Stage", type: "select", options: ["prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"] },
  { value: "deal.value", label: "Deal Value", type: "number" },
  { value: "deal.probability", label: "Deal Probability", type: "number" },
  { value: "deal.closeDate", label: "Close Date", type: "date" },
  { value: "deal.tags", label: "Deal Tags", type: "tag" },
  { value: "activity.type", label: "Activity Type", type: "select", options: ["call", "email", "meeting", "task"] },
  { value: "activity.status", label: "Activity Status", type: "select", options: ["completed", "scheduled", "overdue"] }
];

const operators = [
  { value: "equals", label: "equals", types: ["text", "email", "select", "checkbox"] },
  { value: "not_equals", label: "does not equal", types: ["text", "email", "select", "checkbox"] },
  { value: "contains", label: "contains", types: ["text", "email"] },
  { value: "not_contains", label: "does not contain", types: ["text", "email"] },
  { value: "starts_with", label: "starts with", types: ["text", "email"] },
  { value: "ends_with", label: "ends with", types: ["text", "email"] },
  { value: "is_empty", label: "is empty", types: ["text", "email"] },
  { value: "not_empty", label: "is not empty", types: ["text", "email"] },
  { value: "greater_than", label: "greater than", types: ["number"] },
  { value: "less_than", label: "less than", types: ["number"] },
  { value: "greater_equal", label: "greater than or equal", types: ["number"] },
  { value: "less_equal", label: "less than or equal", types: ["number"] },
  { value: "between", label: "between", types: ["number", "date"] },
  { value: "before", label: "before", types: ["date"] },
  { value: "after", label: "after", types: ["date"] },
  { value: "older_than", label: "older than", types: ["date"] },
  { value: "newer_than", label: "newer than", types: ["date"] },
  { value: "has_tag", label: "has tag", types: ["tag"] },
  { value: "not_has_tag", label: "does not have tag", types: ["tag"] },
  { value: "is_checked", label: "is checked", types: ["checkbox"] },
  { value: "is_unchecked", label: "is unchecked", types: ["checkbox"] }
];

const ConditionConfigModal: React.FC<ConditionConfigModalProps> = ({
  isOpen,
  conditions = [],
  trigger,
  crmFields: crmFieldsProp,
  onSave,
  onClose
}) => {
  const resolvedCrmFields = crmFieldsProp || getBaseCrmFields();
  const { isDarkMode } = useDarkMode();
  const { tags } = useTags();
  const getTagById = (id: string) => tags.find(t => t.id === id);
  const [formConditions, setFormConditions] = useState<Condition[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loadingFormFields, setLoadingFormFields] = useState(false);

  useEffect(() => {
    if (conditions.length > 0) {
      setFormConditions([...conditions]);
    } else {
      // Start with one empty condition
      setFormConditions([{
        id: generateId(),
        field: '',
        operator: '',
        value: '',
        logicOperator: undefined
      }]);
    }
    setErrors({});
  }, [conditions, isOpen]);

  // Load form fields when trigger is form-based
  useEffect(() => {
    const loadFormFields = async () => {
      if (trigger?.entityType === 'form' && trigger.formId) {
        setLoadingFormFields(true);
        try {
          const form = await formsApi.getById(trigger.formId);
          if (form) {
            setFormFields(form.fields);
          }
        } catch (error) {
          console.error('Error loading form fields:', error);
          setFormFields([]);
        } finally {
          setLoadingFormFields(false);
        }
      } else {
        setFormFields([]);
      }
    };

    if (isOpen) {
      loadFormFields();
    }
  }, [trigger, isOpen]);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Map FormField types to condition types
  const mapFormFieldTypeToConditionType = (formFieldType: string): string => {
    switch (formFieldType) {
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
      case 'textarea':
        return 'text';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'select':
      case 'radio':
        return 'select';
      case 'checkbox':
        return 'checkbox';
      default:
        return 'text';
    }
  };

  // Generate form field condition options
  const getFormFieldOptions = () => {
    if (!formFields.length) return [];
    
    return formFields.map(field => ({
      value: `form.fields.${field.id}`,
      label: `${field.label} (Form Field)`,
      type: mapFormFieldTypeToConditionType(field.type),
      options: field.options || [], // For select/radio fields
      formField: field // Store reference to original field
    }));
  };

  // Combine base CRM fields with form fields
  const crmFields = [...resolvedCrmFields, ...getFormFieldOptions()];

  const getFieldType = (fieldValue: string) => {
    const field = crmFields.find(f => f.value === fieldValue);
    return field?.type || "text";
  };

  const getFieldOptions = (fieldValue: string) => {
    const field = crmFields.find(f => f.value === fieldValue);
    if (field?.type === 'tag') {
      return tags.map(tag => ({ value: tag.id, label: tag.name }));
    }
    if (field?.type === 'checkbox') {
      return [
        { value: 'true', label: 'Checked' },
        { value: 'false', label: 'Unchecked' }
      ];
    }
    return field?.options || [];
  };

  const getAvailableOperators = (fieldValue: string) => {
    const fieldType = getFieldType(fieldValue);
    return operators.filter(op => op.types.includes(fieldType));
  };

  const addCondition = () => {
    const newCondition: Condition = {
      id: generateId(),
      field: '',
      operator: '',
      value: '',
      logicOperator: formConditions.length > 0 ? 'AND' : undefined
    };
    setFormConditions([...formConditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setFormConditions(prev => 
      prev.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
    setErrors({});
  };

  const removeCondition = (id: string) => {
    if (formConditions.length > 1) {
      const newConditions = formConditions.filter(condition => condition.id !== id);
      // Remove logic operator from first condition if it exists
      if (newConditions.length > 0) {
        newConditions[0] = { ...newConditions[0], logicOperator: undefined };
      }
      setFormConditions(newConditions);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    formConditions.forEach((condition, index) => {
      if (!condition.field) {
        newErrors[`field-${index}`] = 'Field is required';
        hasError = true;
      }
      if (!condition.operator) {
        newErrors[`operator-${index}`] = 'Operator is required';
        hasError = true;
      }
      if (!condition.value && !["is_empty", "not_empty", "is_checked", "is_unchecked"].includes(condition.operator)) {
        newErrors[`value-${index}`] = 'Value is required';
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formConditions);
      onClose();
    }
  };

  const formatConditionsPreview = () => {
    if (formConditions.length === 0) return 'No conditions';
    
    return formConditions.map((condition, index) => {
      if (!condition.field || !condition.operator) return '';
      
      const field = crmFields.find(f => f.value === condition.field);
      const operator = operators.find(o => o.value === condition.operator);
      
      let conditionText = `${field?.label || condition.field} ${operator?.label || condition.operator}`;
      if (condition.value && !["is_empty", "not_empty", "is_checked", "is_unchecked"].includes(condition.operator)) {
        conditionText += ` "${condition.value}"`;
      }
      
      if (index > 0 && condition.logicOperator) {
        conditionText = `${condition.logicOperator} ${conditionText}`;
      }
      
      return conditionText;
    }).filter(Boolean).join(' ');
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`
                w-full max-w-4xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
                ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
              `}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <FunnelIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium">
                        Configure Conditions
                      </Dialog.Title>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set conditions that must be met for the automation to run
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Conditions List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium">Conditions</h4>
                      <button
                        type="button"
                        onClick={addCondition}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Condition
                      </button>
                    </div>

                    {formConditions.map((condition, index) => (
                      <div key={condition.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        {index > 0 && (
                          <div className="mb-4">
                            <label className="block text-xs font-medium mb-1">Logic Operator</label>
                            <SimpleSelect
                              options={[
                                { value: "AND", label: "AND" },
                                { value: "OR", label: "OR" }
                              ]}
                              value={condition.logicOperator || "AND"}
                              onChange={(value) => updateCondition(condition.id, { logicOperator: value as "AND" | "OR" })}
                              size="sm"
                              className="w-20"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Field Selection */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Field</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select field..." },
                                ...crmFields.map(field => ({
                                  value: field.value,
                                  label: field.label
                                }))
                              ]}
                              value={condition.field}
                              onChange={(value) => updateCondition(condition.id, { 
                                field: value, 
                                operator: "", 
                                value: "" 
                              })}
                              size="sm"
                            />
                            {errors[`field-${index}`] && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors[`field-${index}`]}
                              </p>
                            )}
                            {loadingFormFields && (
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Loading form fields...
                              </p>
                            )}
                            {formFields.length > 0 && (
                              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                {formFields.length} form field{formFields.length !== 1 ? 's' : ''} available
                              </p>
                            )}
                          </div>

                          {/* Operator Selection */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Operator</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select operator..." },
                                ...getAvailableOperators(condition.field).map(operator => ({
                                  value: operator.value,
                                  label: operator.label
                                }))
                              ]}
                              value={condition.operator}
                              onChange={(value) => updateCondition(condition.id, { operator: value })}
                              disabled={!condition.field}
                              size="sm"
                            />
                            {errors[`operator-${index}`] && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors[`operator-${index}`]}
                              </p>
                            )}
                          </div>

                          {/* Value Input */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Value</label>
                            {getFieldType(condition.field) === "select" || getFieldType(condition.field) === "checkbox" ? (
                              <SimpleSelect
                                options={[
                                  { value: "", label: "Select value..." },
                                  ...getFieldOptions(condition.field).map(option => 
                                    typeof option === 'string' 
                                      ? ({ value: option, label: option })
                                      : ({ value: option.value, label: option.label })
                                  )
                                ]}
                                value={condition.value}
                                onChange={(value) => updateCondition(condition.id, { value })}
                                size="sm"
                                disabled={["is_empty", "not_empty", "is_checked", "is_unchecked"].includes(condition.operator)}
                              />
                            ) : getFieldType(condition.field) === "tag" ? (
                              <div className="space-y-2">
                                <SimpleSelect
                                  options={[
                                    { value: "", label: "Select tag..." },
                                    ...getFieldOptions(condition.field).map(option => 
                                      typeof option === 'string' 
                                        ? ({ value: option, label: option })
                                        : ({ value: option.value, label: option.label })
                                    )
                                  ]}
                                  value={condition.value}
                                  onChange={(value) => updateCondition(condition.id, { value })}
                                  size="sm"
                                  disabled={["is_empty", "not_empty", "is_checked", "is_unchecked"].includes(condition.operator)}
                                />
                                {condition.value && (() => {
                                  const selectedTag = getTagById(condition.value);
                                  return selectedTag ? (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColorClass(selectedTag.color)}`}>
                                        {selectedTag.name}
                                      </span>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            ) : (
                              <input
                                type={
                                  getFieldType(condition.field) === "number" ? "number" : 
                                  getFieldType(condition.field) === "date" ? "date" : "text"
                                }
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                disabled={["is_empty", "not_empty", "is_checked", "is_unchecked"].includes(condition.operator)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                                placeholder="Enter value..."
                              />
                            )}
                            
                            {errors[`value-${index}`] && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                {errors[`value-${index}`]}
                              </p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeCondition(condition.id)}
                              disabled={formConditions.length === 1}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove condition"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Conditions Preview */}
                  {formConditions.some(c => c.field && c.operator) && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <InformationCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                            Conditions Preview
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Automation will run when: {formatConditionsPreview()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-md border transition-colors
                        ${isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
                    >
                      Save Conditions
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConditionConfigModal;