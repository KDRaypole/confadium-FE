import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import { getTemplateById, replaceVariables } from "~/components/email/EmailTemplates";
import { 
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Preview Email Template - CRM Dashboard" },
    { name: "description", content: "Preview email template with sample data" },
  ];
};

export default function PreviewEmailTemplate() {
  const params = useParams();
  const { orgId, templateId } = params;
  
  const template = getTemplateById(templateId!);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});

  // Initialize sample variables when template loads
  useEffect(() => {
    if (template?.variables) {
      const initialVars: Record<string, string> = {};
      template.variables.forEach((variable) => {
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
          case "calendar_link":
            initialVars[variable] = "https://calendly.com/schedule";
            break;
          case "crm_link":
            initialVars[variable] = "https://crm.example.com/leads/123";
            break;
          case "contact_phone":
            initialVars[variable] = "(555) 987-6543";
            break;
          case "original_price":
            initialVars[variable] = "$100";
            break;
          case "discounted_price":
            initialVars[variable] = "$80";
            break;
          case "savings_amount":
            initialVars[variable] = "$20";
            break;
          case "expiry_date":
            initialVars[variable] = "December 31, 2024";
            break;
          case "offer_link":
            initialVars[variable] = "https://example.com/special-offer";
            break;
          default:
            initialVars[variable] = `Sample ${variable.replace(/_/g, " ")}`;
        }
      });
      setSampleVariables(initialVars);
    }
  }, [template]);

  const generatePreview = (content: string) => {
    return replaceVariables(content, sampleVariables);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
              <span>Preview</span>
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
                    {template.name}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link
                  to={`/organizations/${orgId}/email-templates/${templateId}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                  Edit Template
                </Link>
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Template Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{template.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{template.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Variables</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">
                        {template.variables.length > 0 ? template.variables.join(", ") : "None"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Email Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject Line</dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                        {generatePreview(template.subject)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Preview Text</dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                        {generatePreview(template.previewText)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Email Preview</h3>
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
                        ? generatePreview(template.htmlContent)
                        : generatePreview(template.textContent)
                    )}
                    className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {previewMode === "html" ? (
                <div 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white p-6 min-h-[500px] overflow-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: generatePreview(template.htmlContent)
                  }}
                />
              ) : (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 p-6 min-h-[500px]">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {generatePreview(template.textContent)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}