import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import HTMLEditor from "~/components/email/HTMLEditor";
import { replaceVariables } from "~/components/email/EmailTemplates";
import { useEmailTemplates } from "~/hooks/useEmailTemplates";
import type { EmailTemplateCreateData } from "~/lib/api/emailTemplates";
import { 
  ArrowLeftIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CodeBracketIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Email Template - Confadium" },
    { name: "description", content: "Create a new email template" },
  ];
};

export default function CreateEmailTemplate() {
  const params = useParams();
  const navigate = useNavigate();
  const { orgId } = params;
  
  // React Query hook
  const { createTemplate, isCreating } = useEmailTemplates();
  
  const [templateData, setTemplateData] = useState<EmailTemplateCreateData>({
    name: "",
    category: "welcome",
    subject: "",
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333; text-align: center;">Welcome!</h1>
  <p style="color: #666; line-height: 1.6;">
    Hi {{contact_name}},
  </p>
  <p style="color: #666; line-height: 1.6;">
    Welcome to {{company_name}}! We're excited to have you on board.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{action_link}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Get Started</a>
  </div>
  <p style="color: #666; font-size: 14px;">
    Best regards,<br>
    {{sender_name}}
  </p>
</div>`,
    textContent: `Hi {{contact_name}},

Welcome to {{company_name}}! We're excited to have you on board.

Get started: {{action_link}}

Best regards,
{{sender_name}}`,
    variables: ["contact_name", "company_name", "action_link", "sender_name"],
    description: "",
    previewText: ""
  });

  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({
    contact_name: "John Smith",
    company_name: "Acme Corporation",
    action_link: "https://example.com/get-started",
    sender_name: "Sarah Johnson"
  });

  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [showPreview, setShowPreview] = useState(true);
  const [htmlEditorMode, setHtmlEditorMode] = useState<"visual" | "code">("visual");

  const handleVariableChange = (variable: string, value: string) => {
    setSampleVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const extractVariablesFromContent = (content: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    return Array.from(variables);
  };

  const updateVariablesFromContent = () => {
    const htmlVars = extractVariablesFromContent(templateData.htmlContent);
    const textVars = extractVariablesFromContent(templateData.textContent);
    const subjectVars = extractVariablesFromContent(templateData.subject);
    const previewVars = extractVariablesFromContent(templateData.previewText);
    
    const allVars = [...new Set([...htmlVars, ...textVars, ...subjectVars, ...previewVars])];
    
    setTemplateData(prev => ({ ...prev, variables: allVars }));
    
    // Add sample values for new variables
    const newSampleVars = { ...sampleVariables };
    allVars.forEach(variable => {
      if (!newSampleVars[variable]) {
        newSampleVars[variable] = `Sample ${variable.replace(/_/g, " ")}`;
      }
    });
    setSampleVariables(newSampleVars);
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

  const handleSave = async () => {
    if (!templateData.name.trim()) {
      alert("Please enter a template name");
      return;
    }
    
    try {
      await createTemplate(templateData);
      alert("Template created successfully!");
      navigate(`/organizations/${orgId}/email-templates`);
    } catch (error) {
      console.error("Failed to create template:", error);
      alert("Failed to create template. Please try again.");
    }
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
              <span>Create New Template</span>
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
                    Create Email Template
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
                  disabled={isCreating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create Template"}
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
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter template name"
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
                      placeholder="Describe what this template is used for"
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
                      onChange={(e) => {
                        setTemplateData(prev => ({ ...prev, subject: e.target.value }));
                        setTimeout(updateVariablesFromContent, 100);
                      }}
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
                      onChange={(e) => {
                        setTemplateData(prev => ({ ...prev, previewText: e.target.value }));
                        setTimeout(updateVariablesFromContent, 100);
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Brief preview text shown in email clients"
                    />
                  </div>
                </div>
              </div>

              {/* HTML Content Editor */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">HTML Content</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "Use variable_name syntax for dynamic content. Variables will be automatically detected."
                  </p>
                </div>
                <div className="p-6">
                  <HTMLEditor
                    value={templateData.htmlContent}
                    onChange={(value) => {
                      setTemplateData(prev => ({ ...prev, htmlContent: value }));
                      setTimeout(updateVariablesFromContent, 100);
                    }}
                    placeholder="Enter HTML content with {{variables}}"
                    height="400px"
                    isDarkMode={false}
                  />
                </div>
              </div>

              {/* Text Content Editor */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Text Content</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plain text version for email clients that don't support HTML</p>
                </div>
                <div className="p-6">
                  <textarea
                    rows={8}
                    value={templateData.textContent}
                    onChange={(e) => {
                      setTemplateData(prev => ({ ...prev, textContent: e.target.value }));
                      setTimeout(updateVariablesFromContent, 100);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    placeholder="Enter plain text content with {{variables}}"
                  />
                </div>
              </div>

              {/* Variables */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Template Variables</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={updateVariablesFromContent}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Auto-detect
                      </button>
                      <button
                        onClick={addVariable}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        <PlusIcon className="-ml-1 mr-1 h-3 w-3" />
                        Add Variable
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure sample values for template variables
                  </p>
                </div>
                <div className="p-6">
                  {templateData.variables.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No variables detected. Use variable_name syntax in your content.
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
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white overflow-hidden">
                        <iframe
                          srcDoc={generatePreview(templateData.htmlContent) || "<p>No HTML content set</p>"}
                          className="w-full min-h-[400px] border-0"
                          title="Email Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
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