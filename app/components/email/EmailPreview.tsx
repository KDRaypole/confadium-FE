import { XMarkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { getTemplateById, replaceVariables } from "./EmailTemplates";

interface EmailPreviewProps {
  isOpen: boolean;
  templateId?: string;
  variables?: Record<string, string>;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function EmailPreview({
  isOpen,
  templateId,
  variables = {},
  onClose,
  isDarkMode = false
}: EmailPreviewProps) {
  if (!isOpen || !templateId) return null;

  const template = getTemplateById(templateId);
  if (!template) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generatePreview = (content: string) => {
    return replaceVariables(content, variables);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Preview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Email Details */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subject Line</label>
              <div className="p-3 bg-white dark:bg-gray-800 rounded border text-sm font-medium">
                {generatePreview(template.subject)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview Text</label>
              <div className="p-3 bg-white dark:bg-gray-800 rounded border text-sm text-gray-600 dark:text-gray-400">
                {generatePreview(template.previewText)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {template.category}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(generatePreview(template.htmlContent))}
                className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                Copy HTML
              </button>
            </div>
          </div>
        </div>

        {/* Email Content Preview */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "60vh" }}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ 
                __html: generatePreview(template.htmlContent)
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}