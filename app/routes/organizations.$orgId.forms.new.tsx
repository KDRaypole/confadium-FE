import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import DynamicFormEditor from "~/components/forms/DynamicFormEditor";
import { useForms } from "~/hooks/useForms";
import { type FormField, type FormTheme, type FormSettings } from "~/lib/api/forms";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "New Form - CRM Dashboard" },
    { name: "description", content: "Create a new dynamic form" },
  ];
};

export interface FormData {
  name: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  settings: FormSettings;
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

const defaultSettings: FormSettings = {
  submitButtonText: "Submit",
  successMessage: "Thank you for your submission!",
  errorMessage: "Sorry, there was an error submitting your form. Please try again.",
  notificationEmail: "",
  storeSubmissions: true,
  requireAuth: false,
  enableCaptcha: false,
  submissionLimitPeriod: 'day',
  closedMessage: "This form is currently closed for submissions.",
  allowMultipleSubmissions: true,
  showProgressBar: false,
  autoSaveDraft: false,
  // Multi-stage form settings
  enableMultiStage: false,
  nextButtonText: "Next",
  previousButtonText: "Previous",
  showStepIndicator: true,
  allowStepNavigation: false
};

export default function NewForm() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { createForm } = useForms();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    fields: [],
    theme: defaultTheme,
    settings: defaultSettings
  });

  const handleSave = async (isDraft = true) => {
    if (!formData.name.trim()) {
      alert('Please enter a form name');
      return;
    }

    try {
      setSaving(true);
      const result = await createForm({
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
        theme: formData.theme,
        settings: formData.settings,
        status: isDraft ? 'draft' : 'active'
      });

      if (result?.data) {
        // Navigate to the newly created form
        if (isDraft) {
          navigate(`/organizations/${orgId}/forms/${result.data.id}/edit`);
        } else {
          navigate(`/organizations/${orgId}/forms/${result.data.id}`);
        }
      }
    } catch (err) {
      console.error('Failed to save form:', err);
      alert('Failed to save form. Please try again.');
    } finally {
      setSaving(false);
    }
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
                disabled={saving || !formData.name.trim()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full inline-block"></div>
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !formData.name.trim() || formData.fields.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Publish Form
                  </>
                )}
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