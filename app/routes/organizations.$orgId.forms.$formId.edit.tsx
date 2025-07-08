import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import DynamicFormEditor from "~/components/forms/DynamicFormEditor";
import { useForm } from "~/hooks/useForms";
import { ArrowLeftIcon, CheckIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { FormData } from './new';

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Form - CRM Dashboard" },
    { name: "description", content: "Edit an existing form" },
  ];
};

export default function EditForm() {
  const { orgId, formId } = useParams();
  const navigate = useNavigate();
  const { form, loading, error, updateForm } = useForm(formId || null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);

  // Convert API form data to editor format
  useEffect(() => {
    if (form) {
      setFormData({
        name: form.name,
        description: form.description,
        fields: form.fields,
        theme: form.theme,
        settings: form.settings
      });
    }
  }, [form]);

  const handleSave = async (isDraft = true) => {
    if (!formData || !formId) return;

    try {
      setSaving(true);
      const result = await updateForm({
        id: formId,
        name: formData.name,
        description: formData.description,
        fields: formData.fields,
        theme: formData.theme,
        settings: formData.settings,
        status: isDraft ? 'draft' : 'active'
      });

      if (result) {
        // Show success message or redirect
        if (!isDraft) {
          // Redirect to view page after publishing
          navigate(`/organizations/${orgId}/forms/${formId}`);
        }
      }
    } catch (err) {
      console.error('Failed to save form:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading form...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !form || !formData) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Form Not Found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {error || "The requested form could not be found."}
                </p>
                <Link
                  to={`/organizations/${orgId}/forms`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Forms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/organizations/${orgId}/forms`}
                  className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Forms
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Form
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Make changes to your form design and settings
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/organizations/${orgId}/forms/${formId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </Link>
                
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </button>
                
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {form.status === 'active' ? 'Update & Publish' : 'Publish'}
                </button>
              </div>
            </div>

            {/* Form Status */}
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                form.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : form.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {form.status === 'active' ? '🟢' : form.status === 'draft' ? '🟡' : '⭕'} {form.status.toUpperCase()}
              </span>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Last updated {new Date(form.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Form Editor */}
          <DynamicFormEditor
            formData={formData}
            onFormDataChange={setFormData}
          />

          {/* Form Info */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Form Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Submissions:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                  {form.submissions}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Form ID:</span>
                <span className="ml-1 font-mono text-xs text-gray-900 dark:text-gray-100">
                  {form.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}