import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlayIcon, InformationCircleIcon, EnvelopeIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import SimpleSelect from '~/components/ui/SimpleSelect';
import ResourceSelect from '~/components/ui/ResourceSelect';
import EnhancedEmailEditor from '~/components/email/EnhancedEmailEditor';
import { type VariableAssignment } from '~/components/email/VariableAssignmentEditor';
import { getTagColorClass } from '~/components/tags/TagsData';
import { useDarkMode } from '~/contexts/DarkModeContext';
import { useTags } from '~/hooks/useTags';
import { formsApi, type FormField } from '~/lib/api/forms';
import { getEntityFieldsForType } from '~/lib/utils/variableProcessor';
import type { TriggerableActionPreset } from '~/lib/api/types';

export interface ActionConfig {
  id: string;
  type: string;
  target: string;
  parameters: Record<string, any>;
}

interface TriggerConfig {
  entityType: string;
  action: string;
  attributeFilter?: string;
  formId?: string;
}

interface FieldMapping {
  formFieldId: string;
  entityField: string;
  conversion?: {
    type: string;
    parameters?: Record<string, any>;
  };
}

export interface ActionTypeConfig {
  value: string;
  label: string;
  targets: string[];
}

interface ActionConfigModalProps {
  isOpen: boolean;
  action?: ActionConfig;
  entityType?: string;
  trigger?: TriggerConfig;
  actionTypes?: ActionTypeConfig[];
  actionPresets?: TriggerableActionPreset[];
  onSave: (action: ActionConfig) => void;
  onClose: () => void;
  onRequestEmailEditor?: (actionId: string, currentTemplate?: string, currentVariables?: Record<string, string>, currentAssignments?: VariableAssignment[]) => void;
}

const defaultActionTypes: ActionTypeConfig[] = [];

const ActionConfigModal: React.FC<ActionConfigModalProps> = ({
  isOpen,
  action,
  entityType = 'contact',
  trigger,
  actionTypes: actionTypesProp,
  actionPresets,
  onSave,
  onClose,
  onRequestEmailEditor
}) => {
  const actionTypes = actionTypesProp || defaultActionTypes;
  const { isDarkMode } = useDarkMode();
  const { tags } = useTags();
  const getTagById = (id: string) => tags.find(t => t.id === id);
  const [formData, setFormData] = useState<ActionConfig>({
    id: '',
    type: '',
    target: '',
    parameters: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [loadingFormFields, setLoadingFormFields] = useState(false);

  useEffect(() => {
    if (action) {
      setFormData(action);
      // Initialize selected tag IDs from existing action parameters
      if (action.parameters.tagId) {
        setSelectedTagIds([action.parameters.tagId]);
      } else if (action.parameters.tagIds) {
        setSelectedTagIds(action.parameters.tagIds);
      } else {
        setSelectedTagIds([]);
      }
      // Initialize field mappings from existing action parameters
      if (action.parameters.fieldMappings) {
        setFieldMappings(action.parameters.fieldMappings);
      } else {
        setFieldMappings([]);
      }
    } else {
      setFormData({
        id: generateId(),
        type: '',
        target: '',
        parameters: {}
      });
      setSelectedTagIds([]);
      setFieldMappings([]);
    }
    setErrors({});
  }, [action, isOpen]);

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

  // Get entity type for creation actions
  const getEntityTypeForAction = (actionType: string): string => {
    switch (actionType) {
      case 'create_contact':
        return 'contact';
      case 'create_deal_from_form':
        return 'deal';
      case 'create_activity_from_form':
        return 'activity';
      default:
        return 'contact';
    }
  };

  // Check if action type requires field mapping
  const isFormBasedAction = (actionType: string): boolean => {
    return ['create_contact', 'create_deal_from_form', 'create_activity_from_form'].includes(actionType);
  };

  // Add a new field mapping
  const addFieldMapping = () => {
    const newMapping: FieldMapping = {
      formFieldId: '',
      entityField: '',
      conversion: undefined
    };
    setFieldMappings(prev => [...prev, newMapping]);
  };

  // Update a field mapping
  const updateFieldMapping = (index: number, updates: Partial<FieldMapping>) => {
    setFieldMappings(prev => 
      prev.map((mapping, i) => 
        i === index ? { ...mapping, ...updates } : mapping
      )
    );
  };

  // Remove a field mapping
  const removeFieldMapping = (index: number) => {
    setFieldMappings(prev => prev.filter((_, i) => i !== index));
  };

  const getAvailableTargets = (actionType: string): string[] => {
    const actionDef = actionTypes.find(at => at.value === actionType);
    return actionDef ? actionDef.targets : [];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Action type is required';
    }

    if (!formData.target) {
      newErrors.target = 'Target is required';
    }

    // Validate action-specific requirements
    switch (formData.type) {
      case 'send_email':
        if (!formData.parameters.emailTemplate) {
          newErrors.emailTemplate = 'Email template is required';
        }
        break;
      case 'create_task':
        if (!formData.parameters.title) {
          newErrors.title = 'Task title is required';
        }
        break;
      case 'add_tag':
      case 'remove_tag':
        if (selectedTagIds.length === 0) {
          newErrors.tagId = 'Tag selection is required';
        }
        break;
      case 'create_contact':
      case 'create_deal_from_form':
      case 'create_activity_from_form':
        if (fieldMappings.length === 0) {
          newErrors.fieldMappings = 'At least one field mapping is required';
        } else {
          // Validate each field mapping
          const incompleteMappings = fieldMappings.filter(mapping => 
            !mapping.formFieldId || !mapping.entityField
          );
          if (incompleteMappings.length > 0) {
            newErrors.fieldMappings = 'All field mappings must have both form field and entity field selected';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update parameters with selected tag data and field mappings
      const updatedFormData = { ...formData };
      
      if ((formData.type === 'add_tag' || formData.type === 'remove_tag') && selectedTagIds.length > 0) {
        // Store both tag ID and tag name for backward compatibility
        updatedFormData.parameters.tagId = selectedTagIds[0];
        const selectedTag = getTagById(selectedTagIds[0]);
        if (selectedTag) {
          updatedFormData.parameters.tagName = selectedTag.name;
        }
      }
      
      // Add field mappings for form-based actions
      if (isFormBasedAction(formData.type) && fieldMappings.length > 0) {
        updatedFormData.parameters.fieldMappings = fieldMappings;
        updatedFormData.parameters.entityType = getEntityTypeForAction(formData.type);
      }
      
      onSave(updatedFormData);
      onClose();
    }
  };

  const handleTypeChange = (actionType: string) => {
    setFormData(prev => ({
      ...prev,
      type: actionType,
      target: '',
      parameters: {}
    }));
    setSelectedTagIds([]);
    setFieldMappings([]);
    setErrors({});
  };

  const updateParameter = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
    setErrors({});
  };

  const handleRequestEmailEditor = () => {
    if (onRequestEmailEditor) {
      onRequestEmailEditor(
        formData.id,
        formData.parameters.emailTemplate,
        formData.parameters.emailVariables,
        formData.parameters.variableAssignments
      );
    }
  };

  const formatActionPreview = () => {
    if (!formData.type || !formData.target) {
      return 'Select action type and target to see preview';
    }

    const actionLabel = actionTypes.find(at => at.value === formData.type)?.label || formData.type;
    let preview = `${actionLabel} → ${formData.target}`;

    switch (formData.type) {
      case 'send_email':
        if (formData.parameters.emailTemplate) {
          preview += ` (Template: ${formData.parameters.emailTemplate})`;
        }
        break;
      case 'create_task':
        if (formData.parameters.title) {
          preview += ` (Title: "${formData.parameters.title}")`;
        }
        break;
      case 'add_tag':
      case 'remove_tag':
        if (selectedTagIds.length > 0) {
          const selectedTag = getTagById(selectedTagIds[0]);
          if (selectedTag) {
            preview += ` (Tag: "${selectedTag.name}")`;
          }
        }
        break;
    }

    return preview;
  };

  return (
    <>
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
                  w-full max-w-2xl transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
                  ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
                `}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <PlayIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium">
                          Configure Action
                        </Dialog.Title>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Define what happens when conditions are met
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
                    {/* Action Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Action Type *
                        </label>
                        <SimpleSelect
                          options={[
                            { value: "", label: "Select action type..." },
                            ...actionTypes.map(actionType => ({
                              value: actionType.value,
                              label: actionType.label
                            }))
                          ]}
                          value={formData.type}
                          onChange={handleTypeChange}
                          size="sm"
                        />
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.type}
                          </p>
                        )}
                      </div>

                      {!actionPresets && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Target *
                          </label>
                          <SimpleSelect
                            options={[
                              { value: "", label: "Select target..." },
                              ...getAvailableTargets(formData.type).map(target => ({
                                value: target,
                                label: target
                              }))
                            ]}
                            value={formData.target}
                            onChange={(value) => setFormData(prev => ({ ...prev, target: value }))}
                            disabled={!formData.type}
                            size="sm"
                          />
                          {errors.target && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {errors.target}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dynamic action parameters from schema */}
                    {formData.type && actionPresets && (() => {
                      const preset = actionPresets.find(p => p.name === formData.type);
                      if (!preset || preset.params.length === 0) return null;
                      return (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                          <h4 className="text-md font-medium mb-4">Action Parameters</h4>
                          <div className="space-y-4">
                            {preset.params.map(param => {
                              const paramValue = formData.parameters?.[param.name] as { source?: string; value?: string } | string | undefined;
                              const currentSource = typeof paramValue === 'object' && paramValue?.source ? paramValue.source : 'static';
                              const currentValue = typeof paramValue === 'object' && paramValue?.value !== undefined ? paramValue.value : (typeof paramValue === 'string' ? paramValue : '');

                              const setParamValue = (source: string, value: string) => {
                                setFormData(prev => ({
                                  ...prev,
                                  parameters: {
                                    ...prev.parameters,
                                    [param.name]: { source, value }
                                  }
                                }));
                              };

                              return (
                                <div key={param.name} className="border border-gray-200 dark:border-gray-600 rounded-md p-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-medium">
                                      {param.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      {param.required && <span className="text-red-500 ml-0.5">*</span>}
                                    </label>
                                    {param.source === 'any' && (
                                      <SimpleSelect
                                        options={[
                                          { value: "static", label: "Static value" },
                                          { value: "field", label: "From record field" }
                                        ]}
                                        value={currentSource}
                                        onChange={(v) => setParamValue(v, '')}
                                        size="sm"
                                        className="w-40"
                                      />
                                    )}
                                  </div>
                                  {param.description && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">{param.description}</p>
                                  )}
                                  {(param.source === 'field' || (param.source === 'any' && currentSource === 'field')) ? (
                                    trigger?.entityType === 'form_submission' ? (
                                      <ResourceSelect
                                        resource="form_field"
                                        value={currentValue}
                                        onChange={(v) => setParamValue('field', v)}
                                        size="sm"
                                        formId={trigger?.formId}
                                      />
                                    ) : (
                                      <SimpleSelect
                                        options={[
                                          { value: "", label: "Select record field..." },
                                          ...(preset.available_fields || []).map(f => ({
                                            value: f.name,
                                            label: f.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                          }))
                                        ]}
                                        value={currentValue}
                                        onChange={(v) => setParamValue('field', v)}
                                        size="sm"
                                      />
                                    )
                                  ) : param.resource ? (
                                    <ResourceSelect
                                      resource={param.resource}
                                      value={currentValue}
                                      onChange={(v) => setParamValue('static', v)}
                                      size="sm"
                                    />
                                  ) : param.source_options ? (
                                    <SimpleSelect
                                      options={[
                                        { value: "", label: `Select ${param.name.replace(/_/g, ' ')}...` },
                                        ...param.source_options.map(opt => ({
                                          value: opt,
                                          label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                        }))
                                      ]}
                                      value={currentValue}
                                      onChange={(v) => setParamValue('static', v)}
                                      size="sm"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={currentValue}
                                      onChange={(e) => setParamValue('static', e.target.value)}
                                      placeholder={`Enter ${param.name.replace(/_/g, ' ')}...`}
                                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action Preview */}
                    {formData.type && formData.target && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <InformationCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                              Action Preview
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {formatActionPreview()}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                      >
                        Save Action
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ActionConfigModal;