import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { emailTemplates } from "~/components/email/EmailTemplates";
import { 
  EnvelopeIcon, 
  PencilIcon, 
  EyeIcon,
  TagIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Templates - CRM Dashboard" },
    { name: "description", content: "Manage and customize email templates" },
  ];
};

export default function EmailTemplates() {
  const params = useParams();
  const { orgId } = params;

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "welcome":
        return "👋";
      case "follow_up":
        return "📞";
      case "nurturing":
        return "🌱";
      case "promotion":
        return "🎉";
      case "notification":
        return "🚨";
      case "reminder":
        return "⏰";
      default:
        return "📧";
    }
  };

  // Group templates by category
  const templatesByCategory = emailTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof emailTemplates>);

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Templates</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage and customize email templates for your automation workflows
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create New Template
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Templates</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{emailTemplates.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TagIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Categories</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{Object.keys(templatesByCategory).length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Most Used</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">Welcome Email</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">%</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Open Rate</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">24.3%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates by Category */}
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category} className="mb-8">
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {category.replace('_', ' ')} Templates
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                    {templates.length} template{templates.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {template.name}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Template Details */}
                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Subject:</strong> {template.subject.length > 50 ? `${template.subject.substring(0, 50)}...` : template.subject}
                        </div>
                        {template.variables.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Variables:</strong> {template.variables.slice(0, 3).join(", ")}
                            {template.variables.length > 3 && ` +${template.variables.length - 3} more`}
                          </div>
                        )}
                      </div>

                      {/* Preview Text */}
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                          {template.previewText}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/organizations/${orgId}/email-templates/${template.id}/preview`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="-ml-0.5 mr-1 h-3 w-3" />
                            Preview
                          </Link>
                          <Link
                            to={`/organizations/${orgId}/email-templates/${template.id}/edit`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PencilIcon className="-ml-0.5 mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {emailTemplates.length === 0 && (
            <div className="text-center py-12">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No email templates</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first email template.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Create Email Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}