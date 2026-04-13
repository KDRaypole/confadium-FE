import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useEmailTemplates, useEmailTemplateStats } from "~/hooks/useEmailTemplates";
import { 
  EnvelopeIcon, 
  PencilIcon, 
  EyeIcon,
  TagIcon,
  DocumentTextIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
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
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // React Query hooks
  const { 
    templates, 
    loading, 
    error, 
    deleteTemplate, 
    duplicateTemplate, 
    isDeleting, 
    isDuplicating 
  } = useEmailTemplates();
  
  const { data: stats } = useEmailTemplateStats();

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

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.attributes?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.attributes?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (template.attributes?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.attributes?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.attributes?.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "welcome", label: "Welcome" },
    { value: "follow_up", label: "Follow Up" },
    { value: "nurturing", label: "Nurturing" },
    { value: "promotion", label: "Promotion" },
    { value: "notification", label: "Notification" },
    { value: "reminder", label: "Reminder" }
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate(id);
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

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
              <Link
                to={`/organizations/${orgId}/email-templates/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create New Template
              </Link>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTemplates.length} of {templates.length} templates
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
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
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.total}</dd>
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
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{Object.keys(stats.byCategory).length}</dd>
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
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Most Popular</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {Object.entries(stats.byCategory).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace?.('_', ' ') || 'N/A'}
                        </dd>
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
                        <span className="text-white text-xs font-medium">✓</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{filteredTemplates.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Templates</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          )}

          {/* Templates by Category */}
          {!loading && !error && Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
            <div key={category} className="mb-8">
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {category?.replace('_', ' ') || 'uncategorized'} Templates
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                    {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {template.attributes?.name || ''}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.attributes?.category || '')}`}>
                              {template.attributes?.category?.replace('_', ' ') || 'uncategorized'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {template.attributes?.description || ''}
                          </p>
                        </div>
                      </div>

                      {/* Template Details */}
                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Name:</strong> {(template.attributes?.name || '').length > 50 ? `${(template.attributes?.name || '').substring(0, 50)}...` : (template.attributes?.name || '')}
                        </div>
                        {(template.attributes?.variables || []).length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Variables:</strong> {(template.attributes?.variables || []).slice(0, 3).join(", ")}
                            {(template.attributes?.variables || []).length > 3 && ` +${(template.attributes?.variables || []).length - 3} more`}
                          </div>
                        )}
                      </div>

                      {/* Preview Text */}
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                          {template.attributes?.preview_text || ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/organizations/${orgId}/email-templates/${template.id}/preview`}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </Link>
                          <Link
                            to={`/organizations/${orgId}/email-templates/${template.id}/edit`}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(template.id)}
                            disabled={isDuplicating}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <DocumentDuplicateIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(template.id)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs leading-4 font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {(template.attributes?.variables || []).length} variable{(template.attributes?.variables || []).length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!loading && !error && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {templates.length === 0 ? "No email templates" : "No templates match your search"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {templates.length === 0 
                  ? "Get started by creating your first email template."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {templates.length === 0 && (
                <div className="mt-6">
                  <Link
                    to={`/organizations/${orgId}/email-templates/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create Email Template
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Delete Template
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this template? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}