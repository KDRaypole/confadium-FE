import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import { getTemplateById, replaceVariables } from "~/components/email/EmailTemplates";
import { 
  ArrowLeftIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  TagIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Email Template - CRM Dashboard" },
    { name: "description", content: "Edit and customize email template" },
  ];
};

export default function EditEmailTemplate() {
  const params = useParams();
  const { orgId, templateId } = params;
  
  const originalTemplate = getTemplateById(templateId!);
  
  const [templateData, setTemplateData] = useState(originalTemplate || {
    id: "",
    name: "",
    category: "welcome",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [],
    description: "",
    previewText: ""
  });

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [showPreview, setShowPreview] = useState(true);

  // Initialize sample variables when template loads
  useEffect(() => {
    if (templateData.variables) {
      const initialVars: Record<string, string> = {};
      templateData.variables.forEach((variable) => {
        // Provide default sample values
        switch (variable) {
          case "contact_name":
            initialVars[variable] = "John Smith";
            break;
          case "company_name":
            initialVars[variable] = "Acme Corporation";
            break;
          case "sender_name":
            initialVars[variable] = "Sarah Johnson";
            break;
          case "phone_number":
            initialVars[variable] = "(555) 123-4567";
            break;
          case "email":
            initialVars[variable] = "john.smith@example.com";
            break;
          case "lead_score":
            initialVars[variable] = "85";
            break;
          case "estimated_value":
            initialVars[variable] = "$50,000";
            break;
          case "discount_percent":
            initialVars[variable] = "20";
            break;
          case "service_name":
            initialVars[variable] = "Premium Package";
            break;
          default:
            initialVars[variable] = `Sample ${variable.replace(/_/g, " ")}`;
        }
      });
      setSampleVariables(initialVars);
    }
  }, [templateData.variables]);

  const handleVariableChange = (variable: string, value: string) => {
    setSampleVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const addVariable = () => {
    const newVariable = prompt("Enter variable name (without {{ }}):");
    if (newVariable && !templateData.variables.includes(newVariable)) {
      setTemplateData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable]
      }));
      setSampleVariables(prev => ({
        ...prev,
        [newVariable]: `Sample ${newVariable.replace(/_/g, " ")}`
      }));
    }
  };

  const removeVariable = (variable: string) => {
    setTemplateData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
    setSampleVariables(prev => {
      const { [variable]: removed, ...rest } = prev;
      return rest;
    });
  };

  const generatePreview = (content: string) => {
    return replaceVariables(content, sampleVariables);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving template:", templateData);
    alert("Template saved successfully!");
  };

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

  if (!originalTemplate) {
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
                      {templateData.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {templateData.variables.length} variable{templateData.variables.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EyeIcon className="-ml-1 mr-2 h-4 w-4" />
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Template Editor */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Template Details</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={templateData.description}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={templateData.category}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="welcome">Welcome</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="nurturing">Nurturing</option>
                      <option value="promotion">Promotion</option>
                      <option value="notification">Notification</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email Content</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={templateData.subject}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter subject line with {{variables}}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preview Text
                    </label>
                    <input
                      type="text"
                      value={templateData.previewText}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, previewText: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Brief preview text shown in email clients"
                    />
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Template Variables</h3>
                    <button
                      onClick={addVariable}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <PlusIcon className="-ml-1 mr-1 h-3 w-3" />
                      Add Variable
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure sample values for template variables
                  </p>
                </div>
                <div className="p-6">
                  {templateData.variables.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No variables defined
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {templateData.variables.map((variable) => (
                        <div key={variable} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {variable}
                            </label>
                            <input
                              type="text"
                              value={sampleVariables[variable] || ""}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder={`Sample value for {{${variable}}}`}
                            />
                          </div>
                          <button
                            onClick={() => removeVariable(variable)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            {showPreview && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Live Preview</h3>
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
                        <button
                          onClick={() => copyToClipboard(
                            previewMode === "html" 
                              ? generatePreview(templateData.htmlContent)
                              : generatePreview(templateData.textContent)
                          )}
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Details Preview */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Subject</label>
                        <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-sm">
                          {generatePreview(templateData.subject) || "No subject set"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Preview Text</label>
                        <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border text-sm text-gray-600 dark:text-gray-400">
                          {generatePreview(templateData.previewText) || "No preview text set"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-6">
                    {previewMode === "html" ? (
                      <div 
                        className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white p-4 min-h-[400px] overflow-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: generatePreview(templateData.htmlContent) || "<p>No HTML content set</p>"
                        }}
                      />
                    ) : (
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 min-h-[400px]">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {generatePreview(templateData.textContent) || "No text content set"}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}