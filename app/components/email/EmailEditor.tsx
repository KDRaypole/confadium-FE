import { useState, useEffect } from "react";
import { 
  EyeIcon, 
  PencilIcon, 
  DocumentTextIcon,
  ChevronDownIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { replaceVariables, type EmailTemplate } from "./EmailTemplates";
import { useEmailTemplates, useEmailTemplate } from "~/hooks/useEmailTemplates";

interface EmailEditorProps {
  selectedTemplate?: string;
  variables?: Record<string, string>;
  onTemplateSelect: (templateId: string) => void;
  onVariablesChange: (variables: Record<string, string>) => void;
  isDarkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNewTemplate?: () => void;
}

export default function EmailEditor({
  selectedTemplate,
  variables = {},
  onTemplateSelect,
  onVariablesChange,
  isDarkMode = false,
  isOpen,
  onClose,
  onNewTemplate
}: EmailEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [currentVariables, setCurrentVariables] = useState<Record<string, string>>(variables);
  
  // Use React Query hooks
  const { templates, loading: templatesLoading, error: templatesError } = useEmailTemplates();
  const { template, loading: templateLoading } = useEmailTemplate(selectedTemplate);

  useEffect(() => {
    setCurrentVariables(variables);
  }, [variables]);

  const handleVariableChange = (key: string, value: string) => {
    const newVariables = { ...currentVariables, [key]: value };
    setCurrentVariables(newVariables);
    onVariablesChange(newVariables);
  };

  const generatePreview = (content: string) => {
    if (!template) return content;
    return replaceVariables(content, currentVariables);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Template Editor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select and customize email templates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Template Selection & Variables */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* Template Selection */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select Template</h3>
                {onNewTemplate && (
                  <button
                    onClick={onNewTemplate}
                    className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    New Template
                  </button>
                )}
              </div>
              
              {templatesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading templates...</span>
                </div>
              ) : templatesError ? (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-200">Error loading templates: {templatesError}</p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTemplate || ""}
                    onChange={(e) => {
                      onTemplateSelect(e.target.value);
                      setShowPreview(false);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                  >
                    <option value="">Choose an email template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              
              {selectedTemplate && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {templateLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading template...</span>
                    </div>
                  ) : template ? (
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400">Template not found</p>
                  )}
                </div>
              )}
            </div>

            {/* Variables Configuration */}
            {template && template.variables.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Template Variables</h3>
                <div className="space-y-4">
                  {template.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {variable.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={currentVariables[variable] || ""}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter ${variable.replace(/_/g, " ")}`}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 flex flex-col">
            {/* Preview Controls */}
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

              {template && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Subject Line</label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm">
                      {generatePreview(template.subject)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Preview Text</label>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border text-sm text-gray-600 dark:text-gray-400">
                      {generatePreview(template.previewText)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!template ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Template Selected</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Choose a template to see the preview
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {previewMode === "html" ? "HTML Preview" : "Text Preview"}
                    </h4>
                    <button
                      onClick={() => copyToClipboard(
                        previewMode === "html" 
                          ? generatePreview(template.htmlContent)
                          : generatePreview(template.textContent)
                      )}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                      Copy
                    </button>
                  </div>
                  
                  {previewMode === "html" ? (
                    <div 
                      className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 p-4 min-h-[400px] overflow-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: generatePreview(template.htmlContent) 
                      }}
                    />
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 min-h-[400px]">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {generatePreview(template.textContent)}
                      </pre>
                    </div>
                  )}
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
            onClick={onClose}
            disabled={!selectedTemplate}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}