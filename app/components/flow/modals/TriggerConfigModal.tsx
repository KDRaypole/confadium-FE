import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BoltIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SimpleSelect from '~/components/ui/SimpleSelect';
import { useDarkMode } from '~/contexts/DarkModeContext';

export interface TriggerConfig {
  entityType: string;
  action: string;
  attributeFilter?: string;
}

interface TriggerConfigModalProps {
  isOpen: boolean;
  trigger?: TriggerConfig;
  onSave: (trigger: TriggerConfig) => void;
  onClose: () => void;
}

// Entity types and their available actions
const entityTypes = [
  {
    value: "contact",
    label: "Contact",
    actions: ["create", "update", "delete", "tag_added", "tag_removed"],
    attributes: [
      { value: "name", label: "Name" },
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
      { value: "company", label: "Company" },
      { value: "status", label: "Status" },
      { value: "source", label: "Lead Source" },
      { value: "score", label: "Lead Score" },
      { value: "value", label: "Estimated Value" },
      { value: "territory", label: "Territory" },
      { value: "lastContact", label: "Last Contact Date" },
      { value: "tags", label: "Tags" }
    ]
  },
  {
    value: "deal",
    label: "Deal/Opportunity",
    actions: ["create", "update", "delete", "tag_added", "tag_removed"],
    attributes: [
      { value: "name", label: "Deal Name" },
      { value: "stage", label: "Stage" },
      { value: "value", label: "Deal Value" },
      { value: "probability", label: "Probability" },
      { value: "closeDate", label: "Close Date" },
      { value: "assignedTo", label: "Assigned To" },
      { value: "contactId", label: "Primary Contact" },
      { value: "description", label: "Description" },
      { value: "tags", label: "Tags" }
    ]
  },
  {
    value: "activity",
    label: "Activity",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "type", label: "Activity Type" },
      { value: "status", label: "Status" },
      { value: "subject", label: "Subject" },
      { value: "description", label: "Description" },
      { value: "dueDate", label: "Due Date" },
      { value: "priority", label: "Priority" },
      { value: "assignedTo", label: "Assigned To" },
      { value: "contactId", label: "Related Contact" },
      { value: "dealId", label: "Related Deal" }
    ]
  },
  {
    value: "email",
    label: "Email",
    actions: ["sent", "opened", "clicked", "bounced", "replied"],
    attributes: [
      { value: "subject", label: "Subject" },
      { value: "templateId", label: "Template" },
      { value: "recipientEmail", label: "Recipient Email" },
      { value: "openCount", label: "Open Count" },
      { value: "clickCount", label: "Click Count" },
      { value: "sentDate", label: "Sent Date" },
      { value: "campaignId", label: "Campaign ID" }
    ]
  },
  {
    value: "form",
    label: "Form",
    actions: ["submitted"],
    attributes: [
      { value: "formId", label: "Form ID" },
      { value: "formName", label: "Form Name" },
      { value: "submitterEmail", label: "Submitter Email" },
      { value: "submissionDate", label: "Submission Date" },
      { value: "source", label: "Source Page" }
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
  onSave,
  onClose
}) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState<TriggerConfig>({
    entityType: '',
    action: '',
    attributeFilter: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trigger) {
      setFormData(trigger);
    } else {
      setFormData({
        entityType: '',
        action: '',
        attributeFilter: undefined
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
      attributeFilter: undefined
    });
    setErrors({});
  };

  const handleActionChange = (action: string) => {
    setFormData(prev => ({
      ...prev,
      action,
      attributeFilter: action === 'update' ? prev.attributeFilter : undefined
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