import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import FormFieldPalette from './FormFieldPalette';
import FormFieldEditor from './FormFieldEditor';
import FormPreview from './FormPreview';
import FormThemeEditor from './FormThemeEditor';
import FormSettingsEditor from './FormSettingsEditor';
import SortableFormField from './SortableFormField';
import { type FormField } from '~/lib/api/forms';
import { type FormData } from '~/routes/organizations.$orgId.forms.new';
import {
  EyeIcon,
  PencilIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DynamicFormEditorProps {
  formData: FormData;
  onFormDataChange: (formData: FormData) => void;
}

type ActiveTab = 'builder' | 'preview' | 'theme' | 'settings';

const DynamicFormEditor: React.FC<DynamicFormEditorProps> = ({
  formData,
  onFormDataChange
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addField = useCallback((fieldType: FormField['type']) => {
    const newField: FormField = {
      id: generateFieldId(),
      type: fieldType,
      label: `New ${fieldType} field`,
      required: false,
      placeholder: fieldType === 'textarea' ? 'Enter your message...' : 
                  fieldType === 'email' ? 'you@example.com' :
                  fieldType === 'phone' ? '+1 (555) 123-4567' :
                  fieldType === 'url' ? 'https://example.com' :
                  fieldType === 'date' ? '' :
                  fieldType === 'number' ? '0' :
                  'Enter value...',
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      validation: {},
      description: ''
    };

    onFormDataChange({
      ...formData,
      fields: [...formData.fields, newField]
    });

    // Auto-select the new field for editing
    setSelectedFieldId(newField.id);
    setIsFieldModalOpen(true);
  }, [formData, onFormDataChange]);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  }, [formData, onFormDataChange]);

  const deleteField = useCallback((fieldId: string) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.filter(field => field.id !== fieldId)
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
      setIsFieldModalOpen(false);
    }
  }, [formData, onFormDataChange, selectedFieldId]);

  const duplicateField = useCallback((fieldId: string) => {
    const fieldToDuplicate = formData.fields.find(field => field.id === fieldId);
    if (fieldToDuplicate) {
      const duplicatedField: FormField = {
        ...fieldToDuplicate,
        id: generateFieldId(),
        label: `${fieldToDuplicate.label} (Copy)`
      };
      
      const fieldIndex = formData.fields.findIndex(field => field.id === fieldId);
      const newFields = [...formData.fields];
      newFields.splice(fieldIndex + 1, 0, duplicatedField);
      
      onFormDataChange({
        ...formData,
        fields: newFields
      });
    }
  }, [formData, onFormDataChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.fields.findIndex(field => field.id === active.id);
      const newIndex = formData.fields.findIndex(field => field.id === over.id);

      onFormDataChange({
        ...formData,
        fields: arrayMove(formData.fields, oldIndex, newIndex)
      });
    }
  };

  const handleFieldEdit = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setIsFieldModalOpen(true);
  };

  const handleFieldModalClose = () => {
    setIsFieldModalOpen(false);
    setSelectedFieldId(null);
  };

  const selectedField = selectedFieldId ? formData.fields.find(field => field.id === selectedFieldId) : null;

  const tabs = [
    { id: 'builder', label: 'Builder', icon: PencilIcon },
    { id: 'preview', label: 'Preview', icon: EyeIcon },
    { id: 'theme', label: 'Theme', icon: PaintBrushIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 text-sm font-medium border-b-2 mr-8 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Field Palette */}
            <div className="lg:col-span-1">
              <FormFieldPalette onAddField={addField} />
            </div>

            {/* Form Builder */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-96">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Form Builder
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {formData.fields.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No fields yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop fields from the palette to get started
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={formData.fields.map(field => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {formData.fields.map((field) => (
                          <SortableFormField
                            key={field.id}
                            field={field}
                            onEdit={() => handleFieldEdit(field.id)}
                            onDelete={() => deleteField(field.id)}
                            onDuplicate={() => duplicateField(field.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <FormPreview formData={formData} />
        )}

        {activeTab === 'theme' && (
          <FormThemeEditor
            theme={formData.theme}
            onThemeChange={(theme) => onFormDataChange({ ...formData, theme })}
          />
        )}

        {activeTab === 'settings' && (
          <FormSettingsEditor
            settings={formData.settings}
            onSettingsChange={(settings) => onFormDataChange({ ...formData, settings })}
          />
        )}
      </div>

      {/* Field Editor Modal */}
      {selectedField && (
        <FormFieldEditor
          isOpen={isFieldModalOpen}
          field={selectedField}
          onClose={handleFieldModalClose}
          onSave={(updates) => {
            updateField(selectedField.id, updates);
            handleFieldModalClose();
          }}
        />
      )}
    </div>
  );
};

export default DynamicFormEditor;