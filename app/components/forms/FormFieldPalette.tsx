import React from 'react';
import { FormField } from '~/routes/organizations.$orgId.forms.new';
import {
  DocumentTextIcon,
  AtSymbolIcon,
  HashtagIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  RadioIcon,
  CalendarDaysIcon,
  LinkIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface FormFieldPaletteProps {
  onAddField: (fieldType: FormField['type']) => void;
}

const fieldTypes = [
  {
    type: 'text' as const,
    label: 'Text Input',
    description: 'Single line text input',
    icon: DocumentTextIcon,
    color: 'blue'
  },
  {
    type: 'email' as const,
    label: 'Email',
    description: 'Email address input',
    icon: AtSymbolIcon,
    color: 'purple'
  },
  {
    type: 'number' as const,
    label: 'Number',
    description: 'Numeric input field',
    icon: HashtagIcon,
    color: 'green'
  },
  {
    type: 'phone' as const,
    label: 'Phone',
    description: 'Phone number input',
    icon: PhoneIcon,
    color: 'indigo'
  },
  {
    type: 'url' as const,
    label: 'URL',
    description: 'Website URL input',
    icon: LinkIcon,
    color: 'cyan'
  },
  {
    type: 'date' as const,
    label: 'Date',
    description: 'Date picker input',
    icon: CalendarDaysIcon,
    color: 'orange'
  },
  {
    type: 'select' as const,
    label: 'Dropdown',
    description: 'Single selection dropdown',
    icon: ChevronDownIcon,
    color: 'pink'
  },
  {
    type: 'radio' as const,
    label: 'Radio Buttons',
    description: 'Single choice from options',
    icon: RadioIcon,
    color: 'yellow'
  },
  {
    type: 'checkbox' as const,
    label: 'Checkbox',
    description: 'True/false selection',
    icon: CheckIcon,
    color: 'emerald'
  },
  {
    type: 'textarea' as const,
    label: 'Text Area',
    description: 'Multi-line text input',
    icon: ChatBubbleLeftRightIcon,
    color: 'red'
  }
];

const getColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:border-blue-700 dark:text-blue-200',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900 dark:hover:bg-purple-800 dark:border-purple-700 dark:text-purple-200',
    green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:border-green-700 dark:text-green-200',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:border-indigo-700 dark:text-indigo-200',
    cyan: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:hover:bg-cyan-800 dark:border-cyan-700 dark:text-cyan-200',
    orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900 dark:hover:bg-orange-800 dark:border-orange-700 dark:text-orange-200',
    pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-800 dark:bg-pink-900 dark:hover:bg-pink-800 dark:border-pink-700 dark:text-pink-200',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:hover:bg-yellow-800 dark:border-yellow-700 dark:text-yellow-200',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:border-emerald-700 dark:text-emerald-200',
    red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:border-red-700 dark:text-red-200'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};

const FormFieldPalette: React.FC<FormFieldPaletteProps> = ({ onAddField }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Field Types
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Click to add fields to your form
        </p>
      </div>

      <div className="space-y-2">
        {fieldTypes.map((fieldType) => {
          const Icon = fieldType.icon;
          return (
            <button
              key={fieldType.type}
              onClick={() => onAddField(fieldType.type)}
              className={`w-full p-3 border rounded-lg transition-colors text-left ${getColorClasses(fieldType.color)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {fieldType.label}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {fieldType.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-6">
        <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
          Pro Tips
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Click a field to add it to your form</li>
          <li>• Drag fields in the builder to reorder</li>
          <li>• Click on any field to edit its properties</li>
          <li>• Use the preview tab to test your form</li>
        </ul>
      </div>
    </div>
  );
};

export default FormFieldPalette;