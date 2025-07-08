import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '~/routes/organizations.$orgId.forms.new';
import {
  Bars3Icon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SortableFormFieldProps {
  field: FormField;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const getFieldIcon = (type: FormField['type']) => {
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return '📝';
    case 'number':
      return '🔢';
    case 'select':
      return '📋';
    case 'radio':
      return '🔘';
    case 'checkbox':
      return '☑️';
    case 'textarea':
      return '📄';
    case 'date':
      return '📅';
    default:
      return '📝';
  }
};

const getFieldTypeLabel = (type: FormField['type']) => {
  const labels = {
    text: 'Text',
    email: 'Email',
    number: 'Number',
    phone: 'Phone',
    url: 'URL',
    date: 'Date',
    select: 'Dropdown',
    radio: 'Radio',
    checkbox: 'Checkbox',
    textarea: 'Text Area'
  };
  return labels[type] || 'Unknown';
};

const SortableFormField: React.FC<SortableFormFieldProps> = ({
  field,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'
      } transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        {/* Drag Handle and Field Info */}
        <div className="flex items-center space-x-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-lg">{getFieldIcon(field.type)}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {field.label}
                </h4>
                {field.required && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getFieldTypeLabel(field.type)}
                </span>
                {field.validation && Object.keys(field.validation).length > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Validated
                  </span>
                )}
                {field.options && field.options.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {field.options.length} option{field.options.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Edit field"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Duplicate field"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Delete field"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Field Preview */}
      <div className="mt-3 pl-8">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
          {field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'phone' || field.type === 'number' ? (
            <input
              type={field.type}
              placeholder={field.placeholder}
              disabled
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
          ) : field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              disabled
              rows={2}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60 resize-none"
            />
          ) : field.type === 'select' ? (
            <select
              disabled
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            >
              <option>Select an option...</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'checkbox' ? (
            <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300">
              <input type="checkbox" disabled className="rounded" />
              <span>Check this option</span>
            </label>
          ) : field.type === 'radio' ? (
            <div className="space-y-1">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300">
                  <input type="radio" name={field.id} disabled className="rounded-full" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : field.type === 'date' ? (
            <input
              type="date"
              disabled
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Preview not available for this field type
            </div>
          )}
        </div>
        
        {field.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {field.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableFormField;