import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import { useEmailTemplate } from "~/hooks/useEmailTemplates";
import type { EmailTemplateUpdateData } from "~/lib/api/emailTemplates";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { EmailBuilder } from "~/components/email-builder";
import type { EmailComponentNode, EmailTheme } from "~/lib/api/types";
import { extractVariablesFromComponents } from "~/lib/email/parser";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Email Template - Confadium" },
    { name: "description", content: "Edit and customize email template" },
  ];
};

export default function EditEmailTemplate() {
  const params = useParams();
  const navigate = useNavigate();
  const { orgId, templateId } = params;

  // React Query hooks
  const { template, loading, error, updateTemplate, isUpdating } = useEmailTemplate(templateId);

  const [templateData, setTemplateData] = useState<EmailTemplateUpdateData>({
    name: "",
    category: "welcome",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [],
    description: "",
    previewText: ""
  });

  // Load template data when it becomes available
  useEffect(() => {
    if (template) {
      setTemplateData({
        name: template.attributes?.name || '',
        category: template.attributes?.category || 'welcome',
        subject: template.attributes?.subject || '',
        htmlContent: template.attributes?.html_content || '',
        textContent: template.attributes?.text_content || '',
        variables: template.attributes?.variables || [],
        description: template.attributes?.description || '',
        previewText: template.attributes?.preview_text || ''
      });
    }
  }, [template]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "welcome":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "follow_up":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "nurturing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "promotion":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "notification":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "reminder":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading template...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Template</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
              <Link
                to={`/organizations/${orgId}/email-templates`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Templates
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Template not found
  if (!template) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Template Not Found</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                The email template you're looking for doesn't exist.
              </p>
              <Link
                to={`/organizations/${orgId}/email-templates`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Templates
              </Link>
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
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={`/organizations/${orgId}/email-templates`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Email Templates
              </Link>
              <span>/</span>
              <span>Edit Template</span>
            </nav>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={`/organizations/${orgId}/email-templates`}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Templates
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit: {templateData.name}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(templateData.category)}`}>
                      {templateData.category?.replace('_', ' ') || 'uncategorized'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {templateData.variables.length} variable{templateData.variables.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Builder */}
          {template && (
            <div className="space-y-6">
              {/* Basic metadata fields */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                    <input type="text" value={templateData.name} onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={templateData.category} onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm">
                      <option value="welcome">Welcome</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="nurturing">Nurturing</option>
                      <option value="promotion">Promotion</option>
                      <option value="notification">Notification</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
                    <input type="text" value={templateData.subject} onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Email subject... Use {{variable_name}} for dynamic content" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview Text</label>
                    <input type="text" value={templateData.previewText} onChange={(e) => setTemplateData(prev => ({ ...prev, previewText: e.target.value }))} placeholder="Preview text shown in inbox... Use {{variable_name}} for dynamic content" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                  </div>
                </div>
              </div>

              {/* Email Builder - use key to force remount when template changes */}
              <EmailBuilder
                key={templateId}
                initialComponents={((template.attributes as any)?.structure as EmailComponentNode[]) || []}
                initialTheme={((template.attributes as any)?.theme as EmailTheme) || {}}
                initialHtmlContent={template.attributes?.html_content || ''}
                subject={templateData.subject}
                previewText={templateData.previewText}
                onSave={async (data) => {
                  // Extract variables from the components
                  const componentVars = extractVariablesFromComponents(data.structure);
                  // Also check subject and preview text for variables
                  const subjectVars = (templateData.subject.match(/\{\{([^}]+)\}\}/g) || []).map(m => m.slice(2, -2).trim());
                  const previewVars = (templateData.previewText.match(/\{\{([^}]+)\}\}/g) || []).map(m => m.slice(2, -2).trim());
                  const allVars = [...new Set([...componentVars, ...subjectVars, ...previewVars])];

                  try {
                    await updateTemplate({
                      ...templateData,
                      htmlContent: data.html_content,
                      textContent: data.text_content,
                      structure: data.structure as any,
                      theme: data.theme as any,
                      variables: allVars,
                    });
                    alert("Template saved!");
                    navigate(`/organizations/${orgId}/email-templates`);
                  } catch (err) {
                    alert("Failed to save template.");
                  }
                }}
                saving={isUpdating}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}