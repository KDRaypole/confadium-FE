import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormField } from '~/routes/organizations.$orgId.forms.new';
import ConditionalLogicEditor from './ConditionalLogicEditor';

interface FormFieldEditorProps {
  isOpen: boolean;
  field: FormField;
  allFields: FormField[];
  onClose: () => void;
  onSave: (updates: Partial<FormField>) => void;
}

const FormFieldEditor: React.FC<FormFieldEditorProps> = ({
  isOpen,
  field,
  allFields,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormField>(field);

  useEffect(() => {
    setFormData(field);
  }, [field]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleOptionAdd = () => {
    const newOptions = [...(formData.options || []), 'New Option'];
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionUpdate = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionDelete = (index: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const requiresOptions = formData.type === 'select' || formData.type === 'radio';

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Edit Field: {field.label}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter field label"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Field Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as FormField['type'] })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="phone">Phone</option>
                        <option value="url">URL</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="textarea">Text Area</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={formData.placeholder || ''}
                      onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Optional description or help text for this field"
                    />
                  </div>

                  {/* Options for select/radio fields */}
                  {requiresOptions && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Options
                        </label>
                        <button
                          onClick={handleOptionAdd}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(formData.options || []).map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionUpdate(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                              placeholder={`Option ${index + 1}`}
                            />
                            <button
                              onClick={() => handleOptionDelete(index)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {(!formData.options || formData.options.length === 0) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                            No options added yet. Click "Add Option" to get started.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Validation Rules
                    </h4>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.required}
                          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required field</span>
                      </label>

                      {(formData.type === 'text' || formData.type === 'textarea') && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Min Length
                            </label>
                            <input
                              type="number"
                              value={formData.validation?.minLength || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                validation: {
                                  ...formData.validation,
                                  minLength: e.target.value ? parseInt(e.target.value) : undefined
                                }
                              })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Max Length
                            </label>
                            <input
                              type="number"
                              value={formData.validation?.maxLength || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                validation: {
                                  ...formData.validation,
                                  maxLength: e.target.value ? parseInt(e.target.value) : undefined
                                }
                              })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                              placeholder="∞"
                            />
                          </div>
                        </div>
                      )}

                      {formData.type === 'number' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Minimum Value
                            </label>
                            <input
                              type="number"
                              value={formData.validation?.min || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                validation: {
                                  ...formData.validation,
                                  min: e.target.value ? parseFloat(e.target.value) : undefined
                                }
                              })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                              Maximum Value
                            </label>
                            <input
                              type="number"
                              value={formData.validation?.max || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                validation: {
                                  ...formData.validation,
                                  max: e.target.value ? parseFloat(e.target.value) : undefined
                                }
                              })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditional Logic */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <ConditionalLogicEditor
                      field={formData}
                      allFields={allFields}
                      onUpdate={setFormData}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Save Field
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FormFieldEditor;