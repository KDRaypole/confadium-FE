import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlayIcon, InformationCircleIcon, EnvelopeIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import SimpleSelect from '~/components/ui/SimpleSelect';
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
                    </div>

                    {/* Action-specific Parameters */}
                    {formData.type && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                        <h4 className="text-md font-medium mb-4">Action Parameters</h4>
                        
                        {formData.type === "send_email" && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={handleRequestEmailEditor}
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 dark:border-blue-600 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800"
                              >
                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                {formData.parameters.emailTemplate ? "Edit Email Template" : "Select Email Template"}
                              </button>
                            </div>
                            
                            {formData.parameters.emailTemplate && (
                              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Template: {formData.parameters.emailTemplate}
                                </div>
                                {formData.parameters.variableAssignments && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formData.parameters.variableAssignments.length} variable assignments configured
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Delay (optional)</label>
                              <input
                                type="text"
                                placeholder="e.g., 5 minutes, 1 hour, immediately"
                                value={formData.parameters.delay || ""}
                                onChange={(e) => updateParameter('delay', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            {errors.emailTemplate && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.emailTemplate}
                              </p>
                            )}
                          </div>
                        )}

                        {formData.type === "create_task" && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Task Title *</label>
                              <input
                                type="text"
                                placeholder="Enter task title..."
                                value={formData.parameters.title || ""}
                                onChange={(e) => updateParameter('title', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              {errors.title && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {errors.title}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Due Date</label>
                              <input
                                type="text"
                                placeholder="e.g., 2 hours, tomorrow, 3 days"
                                value={formData.parameters.dueDate || ""}
                                onChange={(e) => updateParameter('dueDate', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Priority</label>
                              <SimpleSelect
                                options={[
                                  { value: "", label: "Select priority..." },
                                  { value: "low", label: "Low" },
                                  { value: "medium", label: "Medium" },
                                  { value: "high", label: "High" },
                                  { value: "urgent", label: "Urgent" }
                                ]}
                                value={formData.parameters.priority || ""}
                                onChange={(value) => updateParameter('priority', value)}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}

                        {(formData.type === "add_tag" || formData.type === "remove_tag") && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Select Tag *</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Choose a tag..." },
                                ...tags.map(tag => ({
                                  value: tag.id,
                                  label: `${tag.name}${tag.description ? ` - ${tag.description}` : ''}`
                                }))
                              ]}
                              value={selectedTagIds[0] || ""}
                              onChange={(value) => {
                                if (value) {
                                  setSelectedTagIds([value]);
                                  updateParameter('tagId', value);
                                  const selectedTag = getTagById(value);
                                  if (selectedTag) {
                                    updateParameter('tagName', selectedTag.name);
                                  }
                                } else {
                                  setSelectedTagIds([]);
                                  updateParameter('tagId', '');
                                  updateParameter('tagName', '');
                                }
                              }}
                              size="sm"
                            />
                            {errors.tagId && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.tagId}
                              </p>
                            )}
                            {selectedTagIds.length > 0 && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected tag:</p>
                                {(() => {
                                  const selectedTag = getTagById(selectedTagIds[0]);
                                  if (selectedTag) {
                                    return (
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColorClass(selectedTag.color)}`}>
                                          {selectedTag.name}
                                        </span>
                                        {selectedTag.description && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">{selectedTag.description}</span>
                                        )}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {isFormBasedAction(formData.type) && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Field Mapping
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Map form fields to {getEntityTypeForAction(formData.type)} attributes
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={addFieldMapping}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                                disabled={formFields.length === 0}
                              >
                                <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
                                Add Mapping
                              </button>
                            </div>

                            {loadingFormFields && (
                              <div className="text-center py-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Loading form fields...
                                </div>
                              </div>
                            )}

                            {formFields.length === 0 && !loadingFormFields && (
                              <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                  No form fields available. Make sure the trigger is set to a form submission.
                                </div>
                              </div>
                            )}

                            {fieldMappings.map((mapping, index) => (
                              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                                {/* Form Field Selection */}
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Form Field
                                  </label>
                                  <SimpleSelect
                                    options={[
                                      { value: "", label: "Select form field..." },
                                      ...formFields.map(field => ({
                                        value: field.id,
                                        label: field.label
                                      }))
                                    ]}
                                    value={mapping.formFieldId}
                                    onChange={(value) => updateFieldMapping(index, { formFieldId: value })}
                                    size="sm"
                                  />
                                </div>

                                {/* Entity Field Selection */}
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    {getEntityTypeForAction(formData.type)} Field
                                  </label>
                                  <SimpleSelect
                                    options={[
                                      { value: "", label: "Select target field..." },
                                      ...getEntityFieldsForType(getEntityTypeForAction(formData.type)).map(field => ({
                                        value: field.value,
                                        label: field.label
                                      }))
                                    ]}
                                    value={mapping.entityField}
                                    onChange={(value) => updateFieldMapping(index, { entityField: value })}
                                    size="sm"
                                  />
                                </div>

                                {/* Remove Button */}
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeFieldMapping(index)}
                                    className="w-full px-2 py-1.5 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}

                            {fieldMappings.length === 0 && formFields.length > 0 && (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                Click "Add Mapping" to map form fields to {getEntityTypeForAction(formData.type)} attributes
                              </div>
                            )}

                            {errors.fieldMappings && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                  {errors.fieldMappings}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {formData.type === "webhook" && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Webhook URL *</label>
                              <input
                                type="url"
                                placeholder="https://api.example.com/webhook"
                                value={formData.parameters.webhookUrl || ""}
                                onChange={(e) => updateParameter('webhookUrl', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">HTTP Method</label>
                              <SimpleSelect
                                options={[
                                  { value: "POST", label: "POST" },
                                  { value: "PUT", label: "PUT" },
                                  { value: "PATCH", label: "PATCH" }
                                ]}
                                value={formData.parameters.method || "POST"}
                                onChange={(value) => updateParameter('method', value)}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

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