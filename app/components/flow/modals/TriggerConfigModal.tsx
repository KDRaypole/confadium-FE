import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BoltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SimpleSelect from '~/components/ui/SimpleSelect';
import { useDarkMode } from '~/contexts/DarkModeContext';
import { useActiveForms } from '~/hooks/useForms';

export interface TriggerConfig {
  entityType: string;
  action: string;
  attributeFilter?: string;
  formId?: string; // Added for form-specific triggers
}

export interface EntityTypeConfig {
  value: string;
  label: string;
  actions: string[];
  attributes: { value: string; label: string }[];
}

interface TriggerConfigModalProps {
  isOpen: boolean;
  trigger?: TriggerConfig;
  entityTypes?: EntityTypeConfig[];
  onSave: (trigger: TriggerConfig) => void;
  onClose: () => void;
}

// Default entity types (fallback when schema is not provided)
const defaultEntityTypes: EntityTypeConfig[] = [
  {
    value: "contact",
    label: "Contact",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "status", label: "Status" },
      { value: "email", label: "Email" },
      { value: "first_name", label: "First Name" },
      { value: "last_name", label: "Last Name" },
      { value: "tags", label: "Tags" }
    ]
  },
  {
    value: "deal",
    label: "Deal",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "stage", label: "Stage" },
      { value: "name", label: "Name" },
      { value: "tags", label: "Tags" }
    ]
  },
  {
    value: "activity",
    label: "Activity",
    actions: ["create", "update"],
    attributes: [
      { value: "kind", label: "Kind" },
      { value: "subject", label: "Subject" }
    ]
  }
];

const triggerActions = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  sent: "Sent",
  opened: "Opened",
  clicked: "Clicked",
  bounced: "Bounced",
  replied: "Replied to",
  submitted: "Submitted",
  completed: "Completed",
  missed: "Missed",
  tag_added: "Tag Added",
  tag_removed: "Tag Removed"
};

const TriggerConfigModal: React.FC<TriggerConfigModalProps> = ({
  isOpen,
  trigger,
  entityTypes: entityTypesProp,
  onSave,
  onClose
}) => {
  const entityTypes = entityTypesProp || defaultEntityTypes;
  const { isDarkMode } = useDarkMode();
  const { forms: availableForms, loading: formsLoading } = useActiveForms();
  const [formData, setFormData] = useState<TriggerConfig>({
    entityType: '',
    action: '',
    attributeFilter: undefined,
    formId: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trigger) {
      setFormData(trigger);
    } else {
      setFormData({
        entityType: '',
        action: '',
        attributeFilter: undefined,
        formId: undefined
      });
    }
    setErrors({});
  }, [trigger, isOpen]);

  const getEntityType = (entityValue: string) => {
    return entityTypes.find(entity => entity.value === entityValue);
  };

  const getAvailableActions = (entityValue: string) => {
    const entity = getEntityType(entityValue);
    return entity ? entity.actions : [];
  };

  const getEntityAttributes = (entityValue: string) => {
    const entity = getEntityType(entityValue);
    return entity ? entity.attributes : [];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.entityType) {
      newErrors.entityType = 'Entity type is required';
    }

    if (!formData.action) {
      newErrors.action = 'Action is required';
    }

    // Validate form selection for form triggers
    if (formData.entityType === 'form' && formData.action === 'submitted' && !formData.formId) {
      newErrors.formId = 'Please select a form';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleEntityTypeChange = (entityType: string) => {
    setFormData({
      entityType,
      action: '',
      attributeFilter: undefined,
      formId: undefined
    });
    setErrors({});
  };

  const handleActionChange = (action: string) => {
    setFormData(prev => ({
      ...prev,
      action,
      attributeFilter: action === 'update' ? prev.attributeFilter : undefined,
      formId: prev.entityType === 'form' ? prev.formId : undefined
    }));
    setErrors({});
  };

  const formatTriggerPreview = () => {
    if (!formData.entityType || !formData.action) {
      return 'Select entity type and action to see preview';
    }
    
    const entity = getEntityType(formData.entityType);
    const actionLabel = triggerActions[formData.action as keyof typeof triggerActions];
    
    let preview = `When a ${entity?.label || formData.entityType} is ${actionLabel}`;
    
    if (formData.attributeFilter && formData.action === 'update') {
      const attribute = entity?.attributes.find(attr => attr.value === formData.attributeFilter);
      preview += ` (specifically when ${attribute?.label || formData.attributeFilter} changes)`;
    }
    
    if (formData.entityType === 'form' && formData.formId) {
      const selectedForm = availableForms.find(f => f.id === formData.formId);
      if (selectedForm) {
        preview = `When the "${selectedForm.name}" form is submitted`;
      }
    }
    
    return preview;
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
                w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all
                ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
              `}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <BoltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium">
                        Configure Trigger
                      </Dialog.Title>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Define what event starts this automation
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
                  {/* Entity Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Entity Type *
                    </label>
                    <SimpleSelect
                      options={[
                        { value: "", label: "Select entity type..." },
                        ...entityTypes.map(entity => ({
                          value: entity.value,
                          label: entity.label
                        }))
                      ]}
                      value={formData.entityType}
                      onChange={handleEntityTypeChange}
                      size="sm"
                    />
                    {errors.entityType && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.entityType}
                      </p>
                    )}
                  </div>

                  {/* Action Selection */}
                  {formData.entityType && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Action *
                      </label>
                      <SimpleSelect
                        options={[
                          { value: "", label: "Select action..." },
                          ...getAvailableActions(formData.entityType).map(action => ({
                            value: action,
                            label: triggerActions[action as keyof typeof triggerActions]
                          }))
                        ]}
                        value={formData.action}
                        onChange={handleActionChange}
                        size="sm"
                      />
                      {errors.action && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.action}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Attribute Filter for Update Actions */}
                  {formData.entityType && formData.action === "update" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Specific Attribute (Optional)
                      </label>
                      <SimpleSelect
                        options={[
                          { value: "", label: "Any attribute (trigger on any update)" },
                          ...getEntityAttributes(formData.entityType).map(attribute => ({
                            value: attribute.value,
                            label: attribute.label
                          }))
                        ]}
                        value={formData.attributeFilter || ""}
                        onChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          attributeFilter: value || undefined 
                        }))}
                        size="sm"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Leave empty to trigger on any update, or select a specific attribute
                      </p>
                    </div>
                  )}

                  {/* Form Selection for Form Triggers */}
                  {formData.entityType === "form" && formData.action === "submitted" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Form *
                      </label>
                      <SimpleSelect
                        options={[
                          { value: "", label: formsLoading ? "Loading forms..." : "Select a form..." },
                          ...availableForms.map(form => ({
                            value: form.id,
                            label: form.name
                          }))
                        ]}
                        value={formData.formId || ""}
                        onChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          formId: value || undefined 
                        }))}
                        size="sm"
                        disabled={formsLoading}
                      />
                      {errors.formId && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.formId}
                        </p>
                      )}
                      {formData.formId && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          {(() => {
                            const selectedForm = availableForms.find(f => f.id === formData.formId);
                            return selectedForm ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {selectedForm.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {selectedForm.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Fields: {selectedForm.fields}</span>
                                  <span>Submissions: {selectedForm.submissions}</span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    selectedForm.status === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>
                                    {selectedForm.status}
                                  </span>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trigger Preview */}
                  {formData.entityType && formData.action && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Trigger Preview
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            {formatTriggerPreview()}
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
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      Save Trigger
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

export default TriggerConfigModal;