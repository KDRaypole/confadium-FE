import { useState } from "react";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useEmailTemplates, useEmailTemplateStats } from "~/hooks/useEmailTemplates";
import EmailTemplateForm from "./EmailTemplateForm";
import { type EmailTemplate } from "~/lib/api/emailTemplates";

interface EmailTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  selectionMode?: boolean;
  onTemplateSelect?: (templateId: string) => void;
}

export default function EmailTemplateManager({
  isOpen,
  onClose,
  isDarkMode = false,
  selectionMode = false,
  onTemplateSelect
}: EmailTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

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

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "welcome", label: "Welcome" },
    { value: "follow_up", label: "Follow Up" },
    { value: "nurturing", label: "Nurturing" },
    { value: "promotion", label: "Promotion" },
    { value: "notification", label: "Notification" },
    { value: "reminder", label: "Reminder" }
  ];

  const filteredTemplates = templates.filter(template => {
    const attrs = template.attributes;
    const matchesSearch = (attrs?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (attrs?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (attrs?.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || attrs?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

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

  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    
    const colors = {
      welcome: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      follow_up: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      nurturing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      promotion: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      notification: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      reminder: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (!isOpen) return null;

  if (showForm) {
    return (
      <EmailTemplateForm
        template={editingTemplate}
        isOpen={true}
        onClose={() => {
          setShowForm(false);
          setEditingTemplate(null);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {selectionMode ? "Select Email Template" : "Email Template Manager"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectionMode ? "Choose a template for your automation workflow" : "Manage and organize your email templates"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                <strong>{stats.total}</strong> total templates
              </span>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <span key={category} className="text-gray-600 dark:text-gray-300">
                  <strong>{count}</strong> {category?.replace('_', ' ') || 'uncategorized'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
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

            {!selectionMode && (
              <button
                onClick={handleNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Template
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Templates</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No templates found</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first email template to get started"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                          {template.attributes?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {template.attributes?.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.attributes?.category)}`}>
                        {template.attributes?.category?.replace('_', ' ') || 'uncategorized'}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Subject:</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{template.attributes?.subject}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {template.attributes?.variables?.length || 0} variables
                      </span>

                      <div className="flex items-center space-x-1">
                        {selectionMode ? (
                          <button
                            onClick={() => {
                              onTemplateSelect?.(template.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            title="Select Template"
                          >
                            Select
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setPreviewTemplate(template)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Preview"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(template)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(template.id)}
                              disabled={isDuplicating}
                              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50"
                              title="Duplicate"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(template.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
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

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Preview: {previewTemplate.attributes?.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</h4>
                  <p className="text-gray-900 dark:text-gray-100">{previewTemplate.attributes?.subject}</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
                  <div dangerouslySetInnerHTML={{ __html: previewTemplate.attributes?.html_content || '' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}