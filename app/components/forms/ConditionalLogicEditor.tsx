import React, { useState } from 'react';
import { FormField, ConditionalAction } from '~/lib/api/forms';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeSlashIcon, 
  EyeIcon,
  StopIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ConditionalLogicEditorProps {
  field: FormField;
  allFields: FormField[];
  onUpdate: (updatedField: FormField) => void;
}

const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
  field,
  allFields,
  onUpdate
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingAction, setEditingAction] = useState<ConditionalAction | null>(null);

  const actions = field.conditionalActions || [];

  const handleAddAction = () => {
    const newAction: ConditionalAction = {
      id: `action_${Date.now()}`,
      triggerValue: '',
      type: 'hide_question',
      targetFieldId: '',
    };
    setEditingAction(newAction);
  };

  const handleSaveAction = (action: ConditionalAction) => {
    const updatedActions = editingAction?.id === action.id && actions.find(a => a.id === action.id)
      ? actions.map(a => a.id === action.id ? action : a)
      : [...actions, action];

    onUpdate({
      ...field,
      conditionalActions: updatedActions
    });
    setEditingAction(null);
  };

  const handleDeleteAction = (actionId: string) => {
    const updatedActions = actions.filter(a => a.id !== actionId);
    onUpdate({
      ...field,
      conditionalActions: updatedActions
    });
  };

  const getActionIcon = (type: ConditionalAction['type']) => {
    switch (type) {
      case 'hide_question': return <EyeSlashIcon className="h-4 w-4" />;
      case 'show_question': return <EyeIcon className="h-4 w-4" />;
      case 'end_form': return <StopIcon className="h-4 w-4" />;
      case 'remove_options': return <XMarkIcon className="h-4 w-4" />;
      case 'add_options': return <PlusIcon className="h-4 w-4" />;
      case 'enable_options': return <CheckIcon className="h-4 w-4" />;
      default: return <CheckIcon className="h-4 w-4" />;
    }
  };

  const getActionDescription = (action: ConditionalAction) => {
    const targetField = allFields.find(f => f.id === action.targetFieldId);
    const targetName = targetField?.label || 'Unknown Field';

    switch (action.type) {
      case 'hide_question':
        return `Hide "${targetName}" when answer is "${action.triggerValue}"`;
      case 'show_question':
        return `Show "${targetName}" when answer is "${action.triggerValue}"`;
      case 'end_form':
        return `End form with message when answer is "${action.triggerValue}"`;
      case 'remove_options':
        return `Remove options from "${targetName}" when answer is "${action.triggerValue}"`;
      case 'add_options':
        return `Add options to "${targetName}" when answer is "${action.triggerValue}"`;
      case 'enable_options':
        return `Enable options in "${targetName}" when answer is "${action.triggerValue}"`;
      default:
        return `Action when answer is "${action.triggerValue}"`;
    }
  };

  // Only show for fields that can have conditional logic (select, radio, checkbox)
  if (!['select', 'radio', 'checkbox'].includes(field.type)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Conditional Logic
        </h4>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {showEditor ? 'Hide' : 'Configure'}
        </button>
      </div>

      {showEditor && (
        <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {/* Existing Actions */}
          {actions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Current Actions
              </h5>
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    {getActionIcon(action.type)}
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {getActionDescription(action)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingAction(action)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Action Button */}
          <button
            onClick={handleAddAction}
            className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Conditional Action
          </button>
        </div>
      )}

      {/* Action Editor Modal */}
      {editingAction && (
        <ActionEditor
          action={editingAction}
          field={field}
          allFields={allFields}
          onSave={handleSaveAction}
          onCancel={() => setEditingAction(null)}
        />
      )}
    </div>
  );
};

interface ActionEditorProps {
  action: ConditionalAction;
  field: FormField;
  allFields: FormField[];
  onSave: (action: ConditionalAction) => void;
  onCancel: () => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({
  action,
  field,
  allFields,
  onSave,
  onCancel
}) => {
  const [editedAction, setEditedAction] = useState<ConditionalAction>({ ...action });

  const availableValues = field.type === 'checkbox' 
    ? ['true', 'false']
    : field.options || [];

  const targetableFields = allFields.filter(f => f.id !== field.id);

  const requiresTarget = !['end_form'].includes(editedAction.type);
  const requiresOptions = ['remove_options', 'add_options', 'enable_options'].includes(editedAction.type);

  const handleSave = () => {
    // Validation
    if (!editedAction.triggerValue) return;
    if (requiresTarget && !editedAction.targetFieldId) return;
    if (requiresOptions && (!editedAction.options || editedAction.options.length === 0)) return;

    onSave(editedAction);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Configure Conditional Action
        </h3>

        <div className="space-y-4">
          {/* Trigger Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              When user selects:
            </label>
            <select
              value={editedAction.triggerValue}
              onChange={(e) => setEditedAction({ ...editedAction, triggerValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select trigger value...</option>
              {availableValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Then:
            </label>
            <select
              value={editedAction.type}
              onChange={(e) => setEditedAction({ 
                ...editedAction, 
                type: e.target.value as ConditionalAction['type'],
                targetFieldId: '',
                options: [],
                endMessage: '',
                endTitle: ''
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="hide_question">Hide another question</option>
              <option value="show_question">Show another question</option>
              <option value="remove_options">Remove options from another question</option>
              <option value="add_options">Add options to another question</option>
              <option value="enable_options">Enable options in another question</option>
              <option value="end_form">End the form immediately</option>
            </select>
          </div>

          {/* Target Field */}
          {requiresTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Question:
              </label>
              <select
                value={editedAction.targetFieldId || ''}
                onChange={(e) => setEditedAction({ ...editedAction, targetFieldId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select target question...</option>
                {targetableFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Options */}
          {requiresOptions && editedAction.targetFieldId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options:
              </label>
              <textarea
                value={(editedAction.options || []).join('\n')}
                onChange={(e) => setEditedAction({ 
                  ...editedAction, 
                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                })}
                placeholder="Enter one option per line"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {/* End Form Message */}
          {editedAction.type === 'end_form' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Title:
                </label>
                <input
                  type="text"
                  value={editedAction.endTitle || ''}
                  onChange={(e) => setEditedAction({ ...editedAction, endTitle: e.target.value })}
                  placeholder="Form Complete"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Message:
                </label>
                <textarea
                  value={editedAction.endMessage || ''}
                  onChange={(e) => setEditedAction({ ...editedAction, endMessage: e.target.value })}
                  placeholder="Thank you for completing the questionnaire!"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!editedAction.triggerValue || (requiresTarget && !editedAction.targetFieldId)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionalLogicEditor;