import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import DynamicFormEditor from "~/components/forms/DynamicFormEditor";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "New Form - CRM Dashboard" },
    { name: "description", content: "Create a new dynamic form" },
  ];
};

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'url' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio fields
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  spacing: number;
}

export interface FormData {
  name: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  settings: {
    allowMultipleSubmissions: boolean;
    requireAuthentication: boolean;
    showProgressBar: boolean;
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
  };
}

const defaultTheme: FormTheme = {
  primaryColor: "#7c3aed",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  spacing: 16
};

const defaultSettings = {
  allowMultipleSubmissions: true,
  requireAuthentication: false,
  showProgressBar: false,
  submitButtonText: "Submit",
  successMessage: "Thank you for your submission!",
  redirectUrl: ""
};

export default function NewForm() {
  const { orgId } = useParams();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    fields: [],
    theme: defaultTheme,
    settings: defaultSettings
  });

  const handleSave = async (isDraft = true) => {
    // Here you would implement the actual save logic
    console.log("Saving form:", { ...formData, status: isDraft ? 'draft' : 'active' });
    // For now, just show an alert
    alert(`Form ${isDraft ? 'saved as draft' : 'published'} successfully!`);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to={`/organizations/${orgId}/forms`}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Form</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Build a dynamic form with custom fields and styling
                </p>
              </div>
            </div>

            {/* Form Name and Description */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter form name..."
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the form..."
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Actions */}
            <div className="flex justify-end space-x-3 mb-8">
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={!formData.name.trim() || formData.fields.length === 0}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Form
              </button>
            </div>
          </div>

          {/* Dynamic Form Editor */}
          <DynamicFormEditor
            formData={formData}
            onFormDataChange={setFormData}
          />
        </div>
      </div>
    </Layout>
  );
}