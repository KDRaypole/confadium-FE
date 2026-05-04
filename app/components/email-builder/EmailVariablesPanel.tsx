import { useMemo } from "react";
import { useEmailBuilder } from "./EmailBuilderContext";
import { extractVariablesFromComponents } from "~/lib/email/parser";
import { VariableIcon, ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function EmailVariablesPanel() {
  const { components } = useEmailBuilder();
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Extract variables from all components
  const variables = useMemo(() => {
    return extractVariablesFromComponents(components);
  }, [components]);

  const copyToClipboard = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  // Common variable suggestions
  const suggestions = [
    { name: 'first_name', description: 'Contact first name' },
    { name: 'last_name', description: 'Contact last name' },
    { name: 'email', description: 'Contact email address' },
    { name: 'company', description: 'Company name' },
    { name: 'unsubscribe_url', description: 'Unsubscribe link' },
  ];

  // Filter out suggestions that are already used
  const unusedSuggestions = suggestions.filter(s => !variables.includes(s.name));

  return (
    <div className="space-y-4">
      {/* Detected Variables */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center">
          <VariableIcon className="h-3.5 w-3.5 mr-1" />
          Detected Variables ({variables.length})
        </h4>
        {variables.length === 0 ? (
          <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
            No variables detected yet.
            <br />
            <span className="text-gray-500 dark:text-gray-400">
              Use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{variable_name}}'}</code> in your content.
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            {variables.map(varName => (
              <div
                key={varName}
                className="flex items-center justify-between px-2 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md group"
              >
                <code className="text-xs text-purple-700 dark:text-purple-300 font-mono">
                  {`{{${varName}}}`}
                </code>
                <button
                  onClick={() => copyToClipboard(varName)}
                  className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-800 text-purple-400 hover:text-purple-600"
                  title="Copy to clipboard"
                >
                  {copiedVar === varName ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variable Suggestions */}
      {unusedSuggestions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Suggestions
          </h4>
          <div className="space-y-1">
            {unusedSuggestions.map(({ name, description }) => (
              <div
                key={name}
                className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md group hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => copyToClipboard(name)}
                title={`Click to copy {{${name}}}`}
              >
                <div>
                  <code className="text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {`{{${name}}}`}
                  </code>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
                </div>
                <button
                  className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {copiedVar === name ? (
                    <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
        <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">How to use variables:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Add <code className="bg-gray-200 dark:bg-gray-700 px-0.5 rounded">{'{{variable_name}}'}</code> in any text field</li>
          <li>Variables are auto-detected and saved with the template</li>
          <li>Use dot notation for nested data: <code className="bg-gray-200 dark:bg-gray-700 px-0.5 rounded">{'{{contact.email}}'}</code></li>
        </ul>
      </div>
    </div>
  );
}
