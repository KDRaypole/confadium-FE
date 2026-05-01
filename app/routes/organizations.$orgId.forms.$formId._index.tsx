import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import FormPreview from "~/components/forms/FormPreview";
import ShareFormButton from "~/components/forms/ShareFormButton";
import { useForm, FORMS_QUERY_KEYS } from "~/hooks/useForms";
import { useNodeContext } from "~/contexts/NodeContext";
import StateManager from "~/components/ui/StateManager";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  DocumentDuplicateIcon,
  TrashIcon,
  ShareIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "View Form - Confadium" },
    { name: "description", content: "View and manage form" },
  ];
};

type PreviewMode = 'desktop' | 'mobile';

export default function ViewForm() {
  const { orgId, formId } = useParams();
  const { buildListPath } = useNodeContext();
  const { form, loading, error } = useForm(formId || null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

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

  if (error || !form) {
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
                  to={buildListPath('forms')}
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

  // Convert API form to preview format
  const formData = {
    name: form.attributes?.name || '',
    description: form.attributes?.description || '',
    fields: form.attributes?.fields || [],
    theme: form.attributes?.theme || {},
    settings: form.attributes?.settings || {}
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to={buildListPath('forms')}
                  className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Forms
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {form.attributes?.name || ''}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {form.attributes?.description || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ShareFormButton 
                  formId={formId || ''} 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" 
                />
                
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Analytics
                </button>

                <Link
                  to={`/organizations/${orgId}/forms/${formId}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Form
                </Link>
              </div>
            </div>

            {/* Form Status and Stats */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {form.attributes && formId && (
                  <StateManager
                    entityType="forms"
                    entityId={formId}
                    stateAttrs={form.attributes}
                    invalidateKeys={[FORMS_QUERY_KEYS.all, FORMS_QUERY_KEYS.detail(formId)]}
                    layout="inline"
                  />
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    <strong className="text-gray-900 dark:text-gray-100">{(form.attributes?.fields || []).length}</strong> fields
                  </span>
                  <span>
                    Created {new Date(form.attributes?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md ${
                    previewMode === 'desktop'
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <ComputerDesktopIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md ${
                    previewMode === 'mobile'
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Live Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is how your form will appear to users
                  </p>
                </div>
                <div className="p-6">
                  <FormPreview formData={formData} />
                </div>
              </div>
            </div>

            {/* Form Details Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    to={`/organizations/${orgId}/forms/${formId}/edit`}
                    className="w-full inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Form
                  </Link>
                  
                  <button className="w-full inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Duplicate
                  </button>
                  
                  <button className="w-full inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Get Embed Code
                  </button>
                  
                  <button className="w-full inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Form
                  </button>
                </div>
              </div>

              {/* Form Settings Overview */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Settings Overview
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Submit Button:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      "{form.attributes?.settings?.submitButtonText || ''}"
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Authentication:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {form.attributes?.settings?.requireAuth ? 'Required' : 'Not required'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Multiple Submissions:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {form.attributes?.settings?.allowMultipleSubmissions ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Data Storage:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {form.attributes?.settings?.storeSubmissions ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {form.attributes?.settings?.notificationEmail && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Notifications:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {form.attributes?.settings?.notificationEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Colors */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Theme Colors
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Primary</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: form.attributes?.theme?.primaryColor || '' }}
                      />
                      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">
                        {form.attributes?.theme?.primaryColor || ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Background</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: form.attributes?.theme?.backgroundColor || '' }}
                      />
                      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">
                        {form.attributes?.theme?.backgroundColor || ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Text</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: form.attributes?.theme?.textColor || '' }}
                      />
                      <span className="text-xs font-mono text-gray-900 dark:text-gray-100">
                        {form.attributes?.theme?.textColor || ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
}