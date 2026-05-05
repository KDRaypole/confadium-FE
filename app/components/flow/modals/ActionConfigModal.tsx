import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlayIcon, InformationCircleIcon, EnvelopeIcon, ArrowsRightLeftIcon, VariableIcon } from '@heroicons/react/24/outline';
import SimpleSelect, { type SimpleSelectOption } from '~/components/ui/SimpleSelect';
import ResourceSelect from '~/components/ui/ResourceSelect';
import EnhancedEmailEditor from '~/components/email/EnhancedEmailEditor';
import { type VariableAssignment } from '~/components/email/VariableAssignmentEditor';
import { getTagColorClass } from '~/components/tags/TagsData';
import { useDarkMode } from '~/contexts/DarkModeContext';
import { useTags } from '~/hooks/useTags';
import { formsApi, type FormField } from '~/lib/api/forms';
import { getEntityFieldsForType } from '~/lib/utils/variableProcessor';
import { emailTemplatesAPI } from '~/lib/api/emailTemplates';
import type { TriggerableActionPreset, TriggerableModelField, TriggerableModelAssociation, EmailTemplateVariable } from '~/lib/api/types';

// Variable mapping types
interface VariableMapping {
  source: 'static' | 'field' | 'association' | 'template';
  value: string;
}

// State for template variable picker modal
interface TemplatePickerState {
  isOpen: boolean;
  paramName: string;
  currentValue: string;
  cursorPosition: number;
}

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
  modelFields?: TriggerableModelField[];
  modelAssociations?: TriggerableModelAssociation[];
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
  modelFields = [],
  modelAssociations = [],
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

  // Email template variable mapping state
  const [templateVariables, setTemplateVariables] = useState<EmailTemplateVariable[]>([]);
  const [variableMappings, setVariableMappings] = useState<Record<string, VariableMapping>>({});
  const [loadingTemplateVariables, setLoadingTemplateVariables] = useState(false);

  // Template string variable picker modal state
  const [templatePicker, setTemplatePicker] = useState<TemplatePickerState>({
    isOpen: false,
    paramName: '',
    currentValue: '',
    cursorPosition: 0
  });

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
      // Initialize variable mappings for send_email action
      if (action.parameters.variable_mappings) {
        setVariableMappings(action.parameters.variable_mappings);
      } else {
        setVariableMappings({});
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
      setVariableMappings({});
      setTemplateVariables([]);
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

  // Get the selected email template ID from parameters
  const getSelectedTemplateId = (): string | null => {
    const params = formData.parameters;
    if (!params) return null;

    // Check for email_template_id (the parameter name from SendEmailAction)
    const emailTemplateParam = params.email_template_id;
    if (emailTemplateParam) {
      return typeof emailTemplateParam === 'object' ? emailTemplateParam.value : emailTemplateParam;
    }

    return null;
  };

  // Load email template variables when template is selected
  const selectedTemplateId = getSelectedTemplateId();

  useEffect(() => {
    const loadTemplateVariables = async () => {
      if (formData.type === 'send_email' && selectedTemplateId) {
        setLoadingTemplateVariables(true);
        try {
          const response = await emailTemplatesAPI.getTemplateVariables(selectedTemplateId);
          setTemplateVariables(response.data.attributes.variables || []);
        } catch (error) {
          console.error('[ActionConfigModal] Error loading template variables:', error);
          setTemplateVariables([]);
        } finally {
          setLoadingTemplateVariables(false);
        }
      } else {
        setTemplateVariables([]);
      }
    };

    loadTemplateVariables();
  }, [formData.type, selectedTemplateId]);

  // Build field options for variable mapping
  const fieldOptions = useMemo(() => {
    const options: { value: string; label: string; group?: string }[] = [];

    // Add record fields
    modelFields.forEach(field => {
      options.push({
        value: field.name,
        label: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        group: 'Record Fields'
      });
    });

    // Add association fields
    modelAssociations.forEach(assoc => {
      assoc.fields.forEach(field => {
        options.push({
          value: `${assoc.name}.${field.name}`,
          label: `${assoc.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} → ${field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          group: `${assoc.model} (${assoc.name})`
        });
      });
    });

    return options;
  }, [modelFields, modelAssociations]);

  // Update a variable mapping
  const updateVariableMapping = (variableName: string, mapping: VariableMapping) => {
    setVariableMappings(prev => ({
      ...prev,
      [variableName]: mapping
    }));
  };

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

    // Only require target when not using action presets (presets auto-determine target)
    if (!formData.target && !actionPresets) {
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

      // Auto-set target when using action presets (target is determined by the action type)
      if (actionPresets && !updatedFormData.target) {
        updatedFormData.target = updatedFormData.type;
      }

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

      // Add variable mappings for send_email action
      if (formData.type === 'send_email' && Object.keys(variableMappings).length > 0) {
        updatedFormData.parameters.variable_mappings = variableMappings;
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
    setTemplateVariables([]);
    setVariableMappings({});
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
      {/* Variable Picker Modal */}
      <Transition appear show={templatePicker.isOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          onClose={() => setTemplatePicker(prev => ({ ...prev, isOpen: false }))}
        >
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
                  w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
                  ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <VariableIcon className="h-5 w-5 text-purple-500" />
                      <Dialog.Title as="h3" className="text-lg font-medium">
                        Insert Variable
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={() => setTemplatePicker(prev => ({ ...prev, isOpen: false }))}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Click a variable to insert it into your template string.
                  </p>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {/* Record Fields */}
                    {modelFields.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Record Fields
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {modelFields.map(field => (
                            <button
                              key={field.name}
                              type="button"
                              onClick={() => {
                                const newValue = templatePicker.currentValue + `{{${field.name}}}`;
                                setFormData(prev => ({
                                  ...prev,
                                  parameters: {
                                    ...prev.parameters,
                                    [templatePicker.paramName]: { source: 'template', value: newValue }
                                  }
                                }));
                                setTemplatePicker(prev => ({ ...prev, currentValue: newValue }));
                              }}
                              className="flex items-center px-3 py-2 text-left text-sm bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                            >
                              <code className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                                {`{{${field.name}}}`}
                              </code>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Association Fields */}
                    {modelAssociations.map(assoc => (
                      <div key={assoc.name}>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {assoc.model} ({assoc.name})
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {assoc.fields.map(field => (
                            <button
                              key={`${assoc.name}.${field.name}`}
                              type="button"
                              onClick={() => {
                                const varPath = `${assoc.name}.${field.name}`;
                                const newValue = templatePicker.currentValue + `{{${varPath}}}`;
                                setFormData(prev => ({
                                  ...prev,
                                  parameters: {
                                    ...prev.parameters,
                                    [templatePicker.paramName]: { source: 'template', value: newValue }
                                  }
                                }));
                                setTemplatePicker(prev => ({ ...prev, currentValue: newValue }));
                              }}
                              className="flex items-center px-3 py-2 text-left text-sm bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                            >
                              <code className="text-purple-600 dark:text-purple-400 font-mono text-xs truncate">
                                {`{{${assoc.name}.${field.name}}}`}
                              </code>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {modelFields.length === 0 && modelAssociations.length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <VariableIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No variables available for this entity type.</p>
                      </div>
                    )}
                  </div>

                  {/* Current template preview */}
                  {templatePicker.currentValue && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Current Template:</h4>
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono break-all">
                        {templatePicker.currentValue}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTemplatePicker(prev => ({ ...prev, isOpen: false }))}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Main Action Config Modal */}
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
                                          { value: "field", label: "From record field" },
                                          { value: "template", label: "Template string" }
                                        ]}
                                        value={currentSource}
                                        onChange={(v) => setParamValue(v, '')}
                                        size="sm"
                                        className="w-44"
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
                                          // Record fields group
                                          ...(modelFields.length > 0 ? [
                                            { value: '__group_record__', label: 'Record Fields', isGroupHeader: true },
                                            ...modelFields.map(f => ({
                                              value: f.name,
                                              label: f.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                            }))
                                          ] : []),
                                          // Association fields groups
                                          ...modelAssociations.flatMap(assoc => [
                                            { value: `__group_${assoc.name}__`, label: `${assoc.model} (${assoc.name})`, isGroupHeader: true },
                                            ...assoc.fields.map(f => ({
                                              value: `${assoc.name}.${f.name}`,
                                              label: f.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                            }))
                                          ])
                                        ]}
                                        value={currentValue}
                                        onChange={(v) => setParamValue('field', v)}
                                        placeholder="Select record field..."
                                        size="sm"
                                      />
                                    )
                                  ) : (param.source === 'any' && currentSource === 'template') ? (
                                    <div className="space-y-2">
                                      <div className="relative">
                                        <textarea
                                          value={currentValue}
                                          onChange={(e) => setParamValue('template', e.target.value)}
                                          placeholder={`Enter template with {{variables}}...`}
                                          rows={2}
                                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const paramVal = formData.parameters?.[param.name];
                                            const templateValue = typeof paramVal === 'object' && paramVal?.value ? paramVal.value : (typeof paramVal === 'string' ? paramVal : '');
                                            setTemplatePicker({
                                              isOpen: true,
                                              paramName: param.name,
                                              currentValue: templateValue,
                                              cursorPosition: templateValue.length
                                            });
                                          }}
                                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                        >
                                          <VariableIcon className="h-3.5 w-3.5 mr-1" />
                                          Insert Variable
                                        </button>
                                        <span className="text-xs text-gray-400">
                                          Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{field_name}}'}</code> syntax
                                        </span>
                                      </div>
                                    </div>
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

                    {/* Email Template Variable Mapping */}
                    {formData.type === 'send_email' && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <VariableIcon className="h-5 w-5 text-purple-500" />
                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Template Variable Mapping</h4>
                          </div>
                          {selectedTemplateId && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Template: {selectedTemplateId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                        {!selectedTemplateId ? (
                          <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            Select an email template in the parameters above to map variables.
                          </div>
                        ) : loadingTemplateVariables ? (
                          <div className="text-sm text-gray-500 italic py-4 text-center">Loading template variables...</div>
                        ) : templateVariables.length === 0 ? (
                          <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            No variables found in this template. Variables use the format <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{variable_name}}'}</code>.
                          </div>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <div className="col-span-4">Template Variable</div>
                              <div className="col-span-1 text-center">→</div>
                              <div className="col-span-7">Maps To</div>
                            </div>
                            {/* Mapping Rows */}
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {templateVariables.map(variable => {
                                const mapping = variableMappings[variable.name] || { source: 'field', value: '' };
                                const isStatic = mapping.source === 'static';

                                // Build grouped options for the field selector using SimpleSelect format
                                const fieldOptions: SimpleSelectOption[] = [
                                  // Record fields group
                                  ...(modelFields.length > 0 ? [
                                    { value: '__group_record__', label: 'Record Fields', isGroupHeader: true },
                                    ...modelFields.map(f => ({
                                      value: `field:${f.name}`,
                                      label: f.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    }))
                                  ] : []),
                                  // Association fields groups
                                  ...modelAssociations.flatMap(assoc => [
                                    { value: `__group_${assoc.name}__`, label: `${assoc.model} (${assoc.name})`, isGroupHeader: true },
                                    ...assoc.fields.map(f => ({
                                      value: `association:${assoc.name}.${f.name}`,
                                      label: f.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    }))
                                  ]),
                                  // Static value option
                                  { value: '__group_static__', label: 'Other', isGroupHeader: true },
                                  { value: 'static:', label: 'Enter static value...' }
                                ];

                                // Get current combined value
                                const currentCombinedValue = isStatic ? 'static:' : `${mapping.source}:${mapping.value}`;

                                const handleMappingChange = (combinedValue: string) => {
                                  if (combinedValue === 'static:') {
                                    updateVariableMapping(variable.name, { source: 'static', value: '' });
                                  } else if (combinedValue.startsWith('field:')) {
                                    updateVariableMapping(variable.name, { source: 'field', value: combinedValue.replace('field:', '') });
                                  } else if (combinedValue.startsWith('association:')) {
                                    updateVariableMapping(variable.name, { source: 'association', value: combinedValue.replace('association:', '') });
                                  }
                                };

                                return (
                                  <div key={variable.name} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-100/50 dark:hover:bg-gray-700/30">
                                    <div className="col-span-4">
                                      <code className="px-2 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono">
                                        {`{{${variable.name}}}`}
                                      </code>
                                    </div>
                                    <div className="col-span-1 text-center text-gray-400">
                                      <ArrowsRightLeftIcon className="h-4 w-4 inline" />
                                    </div>
                                    <div className="col-span-7">
                                      {isStatic ? (
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={mapping.value}
                                            onChange={(e) => updateVariableMapping(variable.name, { ...mapping, value: e.target.value })}
                                            placeholder="Enter static value..."
                                            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                                          />
                                          <button
                                            onClick={() => updateVariableMapping(variable.name, { source: 'field', value: '' })}
                                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded"
                                            title="Switch to field mapping"
                                          >
                                            Field
                                          </button>
                                        </div>
                                      ) : (
                                        <SimpleSelect
                                          options={fieldOptions}
                                          value={currentCombinedValue}
                                          onChange={handleMappingChange}
                                          placeholder="Select a field..."
                                          size="sm"
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Summary footer */}
                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                              {templateVariables.length} variable{templateVariables.length !== 1 ? 's' : ''} • {Object.values(variableMappings).filter(m => m.value).length} mapped
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