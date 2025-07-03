import { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  EyeIcon, 
  PlusIcon,
  MinusIcon
} from "@heroicons/react/24/outline";
import { useEmailTemplates, useEmailTemplate } from "~/hooks/useEmailTemplates";
import { type EmailTemplate, type EmailTemplateCreateData } from "~/lib/api/emailTemplates";
import HTMLEditor from "./HTMLEditor";

interface EmailTemplateFormProps {
  template?: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function EmailTemplateForm({
  template,
  isOpen,
  onClose,
  isDarkMode = false
}: EmailTemplateFormProps) {
  const [formData, setFormData] = useState<EmailTemplateCreateData>({
    name: "",
    category: "welcome",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [],
    description: "",
    previewText: ""
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [newVariable, setNewVariable] = useState("");

  const { createTemplate, isCreating } = useEmailTemplates();
  const { updateTemplate, isUpdating } = useEmailTemplate(template?.id);

  const isEditing = !!template;
  const isSaving = isCreating || isUpdating;

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables,
        description: template.description,
        previewText: template.previewText
      });
    }
  }, [template]);

  const handleInputChange = (field: keyof EmailTemplateCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing && template) {
        await updateTemplate(formData);
      } else {
        await createTemplate(formData);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
    }
  };

  const generatePreview = (content: string) => {
    // Simple variable replacement for preview
    let result = content;
    formData.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      result = result.replace(regex, `[${variable}]`);
    });
    return result;
  };

  const categories = [
    { value: "welcome", label: "Welcome" },
    { value: "follow_up", label: "Follow Up" },
    { value: "nurturing", label: "Nurturing" },
    { value: "promotion", label: "Promotion" },
    { value: "notification", label: "Notification" },
    { value: "reminder", label: "Reminder" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Email Template" : "Create New Email Template"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditing ? "Modify the template details and content" : "Create a new reusable email template"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-160px)]">
          {/* Left Panel - Form */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this template"
                    />
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Email Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email subject line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preview Text
                    </label>
                    <input
                      type="text"
                      value={formData.previewText}
                      onChange={(e) => handleInputChange("previewText", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Short preview text shown in email clients"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      HTML Content
                    </label>
                    <HTMLEditor
                      content={formData.htmlContent}
                      onChange={(content) => handleInputChange("htmlContent", content)}
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Text Content
                    </label>
                    <textarea
                      rows={8}
                      value={formData.textContent}
                      onChange={(e) => handleInputChange("textContent", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Plain text version of the email"
                    />
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Template Variables</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddVariable()}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add variable (e.g., contact_name)"
                    />
                    <button
                      onClick={handleAddVariable}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {formData.variables.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Variables:</h4>
                      <div className="space-y-2">
                        {formData.variables.map((variable) => (
                          <div key={variable} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                              {`{{${variable}}}`}
                            </span>
                            <button
                              onClick={() => handleRemoveVariable(variable)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode("html")}
                    className={`px-3 py-1 text-sm rounded ${
                      previewMode === "html"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setPreviewMode("text")}
                    className={`px-3 py-1 text-sm rounded ${
                      previewMode === "text"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    Text
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Subject Line</label>
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm">
                    {generatePreview(formData.subject) || "No subject"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Preview Text</label>
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm text-gray-600 dark:text-gray-400">
                    {generatePreview(formData.previewText) || "No preview text"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {previewMode === "html" ? (
                <div 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 p-4 min-h-[400px] overflow-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: generatePreview(formData.htmlContent) || "<p>No HTML content</p>"
                  }}
                />
              ) : (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 min-h-[400px]">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {generatePreview(formData.textContent) || "No text content"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim() || !formData.subject.trim()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : (isEditing ? "Update Template" : "Create Template")}
          </button>
        </div>
      </div>
    </div>
  );
}