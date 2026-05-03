import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useEmailTemplates } from "~/hooks/useEmailTemplates";
import type { EmailTemplateCreateData } from "~/lib/api/emailTemplates";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { EmailBuilder } from "~/components/email-builder";
import type { EmailComponentNode, EmailTheme } from "~/lib/api/types";
import { extractVariablesFromComponents } from "~/lib/email/parser";
import { EMAIL_TEMPLATE_PRESETS, type EmailTemplatePreset } from "~/lib/email/presets";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Email Template - Confadium" },
    { name: "description", content: "Create a new email template" },
  ];
};

// Thumbnail preview component for each template preset
function TemplateThumbnail({ preset, selected, onSelect }: {
  preset: EmailTemplatePreset;
  selected: boolean;
  onSelect: () => void;
}) {
  const thumbnailStyles: Record<string, { bg: string; accent: string; pattern: React.ReactNode }> = {
    blank: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      accent: 'border-gray-300 dark:border-gray-600',
      pattern: (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <div className="w-8 h-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-2" />
          <span className="text-xs">Empty</span>
        </div>
      ),
    },
    welcome: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      accent: 'border-purple-200 dark:border-purple-800',
      pattern: (
        <div className="space-y-2 p-3">
          <div className="h-6 bg-purple-500 rounded w-full" />
          <div className="h-3 bg-purple-200 dark:bg-purple-700 rounded w-3/4 mx-auto" />
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full" />
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-5/6" />
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-4/6" />
          <div className="h-6 bg-purple-500 rounded w-1/2 mx-auto mt-3" />
          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded w-full mt-2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto" />
        </div>
      ),
    },
    newsletter: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      accent: 'border-blue-200 dark:border-blue-800',
      pattern: (
        <div className="space-y-2 p-3">
          <div className="h-5 bg-blue-600 rounded w-full" />
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto" />
          <div className="h-12 bg-blue-100 dark:bg-blue-800/50 rounded w-full" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="flex gap-1 mt-2">
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded flex-1" />
            <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded flex-1" />
          </div>
        </div>
      ),
    },
    promotion: {
      bg: 'bg-gray-900 dark:bg-gray-950',
      accent: 'border-gray-700',
      pattern: (
        <div className="space-y-2 p-3">
          <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto" />
          <div className="h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded w-full" />
          <div className="h-2 bg-amber-400 rounded w-1/3 mx-auto" />
          <div className="h-3 bg-white rounded w-2/3 mx-auto" />
          <div className="h-6 bg-white rounded-full w-1/2 mx-auto mt-2" />
          <div className="flex gap-1 mt-3 justify-center">
            <div className="w-6 h-6 bg-gray-700 rounded" />
            <div className="w-6 h-6 bg-gray-700 rounded" />
            <div className="w-6 h-6 bg-gray-700 rounded" />
          </div>
        </div>
      ),
    },
    event: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      accent: 'border-violet-200 dark:border-violet-800',
      pattern: (
        <div className="space-y-2 p-3">
          <div className="h-5 bg-violet-500 rounded w-full" />
          <div className="h-2 bg-violet-300 dark:bg-violet-700 rounded w-1/3 mx-auto" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto" />
          <div className="h-10 bg-violet-100 dark:bg-violet-800/50 rounded w-full" />
          <div className="flex gap-1">
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded flex-1 p-1">
              <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded w-2/3 mx-auto" />
              <div className="h-2 bg-gray-400 dark:bg-gray-400 rounded w-1/2 mx-auto mt-1" />
            </div>
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded flex-1 p-1">
              <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded w-2/3 mx-auto" />
              <div className="h-2 bg-gray-400 dark:bg-gray-400 rounded w-1/2 mx-auto mt-1" />
            </div>
          </div>
          <div className="h-5 bg-violet-500 rounded w-1/2 mx-auto mt-2" />
        </div>
      ),
    },
    transactional: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      accent: 'border-emerald-200 dark:border-emerald-800',
      pattern: (
        <div className="space-y-2 p-3">
          <div className="h-5 bg-emerald-500 rounded w-full" />
          <div className="h-4 w-4 bg-emerald-400 rounded-full mx-auto" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="h-5 bg-emerald-500 rounded w-1/3 mx-auto" />
          <div className="h-px bg-gray-200 dark:bg-gray-700 w-full mt-2" />
          <div className="flex justify-between">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
          </div>
          <div className="flex justify-between">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/4" />
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/6" />
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
          <div className="flex justify-between">
            <div className="h-2 bg-gray-400 dark:bg-gray-500 rounded w-1/6" />
            <div className="h-2 bg-emerald-500 rounded w-1/5" />
          </div>
        </div>
      ),
    },
    minimal: {
      bg: 'bg-white dark:bg-gray-800',
      accent: 'border-gray-200 dark:border-gray-700',
      pattern: (
        <div className="space-y-2 p-4">
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mt-3" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-5 bg-gray-700 dark:bg-gray-500 rounded w-1/3 mt-3" />
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mt-4" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      ),
    },
  };

  const style = thumbnailStyles[preset.thumbnail] || thumbnailStyles.minimal;

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full text-left rounded-xl border-2 transition-all overflow-hidden
        ${selected
          ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-lg scale-[1.02]'
          : `${style.accent} hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md`
        }
      `}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Preview area */}
      <div className={`h-40 ${style.bg} overflow-hidden`}>
        {style.pattern}
      </div>

      {/* Info */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{preset.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{preset.description}</p>
      </div>
    </button>
  );
}

export default function CreateEmailTemplate() {
  const params = useParams();
  const navigate = useNavigate();
  const { orgId } = params;

  // React Query hook
  const { createTemplate, isCreating } = useEmailTemplates();

  // Two-step state: selection or editing
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const [selectedPreset, setSelectedPreset] = useState<EmailTemplatePreset | null>(null);

  const [templateData, setTemplateData] = useState<EmailTemplateCreateData>({
    name: "",
    category: "welcome",
    subject: "",
    htmlContent: "",
    textContent: "",
    variables: [],
    description: "",
    previewText: ""
  });

  const handleSelectPreset = (preset: EmailTemplatePreset) => {
    setSelectedPreset(preset);
  };

  const handleContinue = () => {
    if (!selectedPreset) return;

    // Pre-fill template data from preset
    setTemplateData(prev => ({
      ...prev,
      category: selectedPreset.category,
      subject: selectedPreset.subject,
      previewText: selectedPreset.previewText,
    }));

    setStep('edit');
  };

  const handleBack = () => {
    setStep('select');
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

  // Step 1: Template Selection
  if (step === 'select') {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Link to={`/organizations/${orgId}/email-templates`} className="hover:text-gray-700 dark:hover:text-gray-200">
                  Email Templates
                </Link>
                <span>/</span>
                <span>Choose Template</span>
              </nav>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link
                    to={`/organizations/${orgId}/email-templates`}
                    className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Choose a Template
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Start with a pre-built template or create from scratch
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedPreset}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue with Template
                </button>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {EMAIL_TEMPLATE_PRESETS.map((preset) => (
                <TemplateThumbnail
                  key={preset.id}
                  preset={preset}
                  selected={selectedPreset?.id === preset.id}
                  onSelect={() => handleSelectPreset(preset)}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Step 2: Template Editor
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
              <button onClick={handleBack} className="hover:text-gray-700 dark:hover:text-gray-200">
                Choose Template
              </button>
              <span>/</span>
              <span>Edit</span>
            </nav>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Change Template
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create Email Template
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Based on: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPreset?.name}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(templateData.category)}`}>
                      {templateData.category?.replace('_', ' ') || 'uncategorized'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Builder */}
          <div className="space-y-6">
            {/* Basic metadata fields */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" value={templateData.name} onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter template name" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={templateData.category} onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm">
                    <option value="welcome">Welcome</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="nurturing">Nurturing</option>
                    <option value="promotion">Promotion</option>
                    <option value="notification">Notification</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
                  <input type="text" value={templateData.subject} onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))} placeholder="Email subject... Use {{variable_name}} for dynamic content" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview Text</label>
                  <input type="text" value={templateData.previewText} onChange={(e) => setTemplateData(prev => ({ ...prev, previewText: e.target.value }))} placeholder="Preview text shown in inbox... Use {{variable_name}} for dynamic content" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                </div>
              </div>
            </div>

            {/* Email Builder */}
            {selectedPreset && (
              <EmailBuilder
                key={selectedPreset.id}
                initialComponents={selectedPreset.components}
                initialTheme={selectedPreset.theme}
                initialHtmlContent=""
                onSave={async (data) => {
                  if (!templateData.name.trim()) {
                    alert("Please enter a template name");
                    return;
                  }

                  // Extract variables from the components
                  const componentVars = extractVariablesFromComponents(data.structure);
                  // Also check subject and preview text for variables
                  const subjectVars = (templateData.subject.match(/\{\{([^}]+)\}\}/g) || []).map(m => m.slice(2, -2).trim());
                  const previewVars = (templateData.previewText.match(/\{\{([^}]+)\}\}/g) || []).map(m => m.slice(2, -2).trim());
                  const allVars = [...new Set([...componentVars, ...subjectVars, ...previewVars])];

                  try {
                    await createTemplate({
                      ...templateData,
                      htmlContent: data.html_content,
                      textContent: data.text_content,
                      structure: data.structure as any,
                      theme: data.theme as any,
                      variables: allVars,
                    });
                    alert("Template created successfully!");
                    navigate(`/organizations/${orgId}/email-templates`);
                  } catch (err) {
                    console.error("Failed to create template:", err);
                    alert("Failed to create template. Please try again.");
                  }
                }}
                saving={isCreating}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
