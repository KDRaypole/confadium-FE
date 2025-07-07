import { useState, useEffect } from "react";
import { 
  EyeIcon, 
  PencilIcon, 
  DocumentTextIcon,
  ChevronDownIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  CogIcon,
  BeakerIcon
} from "@heroicons/react/24/outline";
import { replaceVariables, type EmailTemplate } from "./EmailTemplates";
import { useEmailTemplates, useEmailTemplate } from "~/hooks/useEmailTemplates";
import VariableAssignmentEditor, { type VariableAssignment } from "./VariableAssignmentEditor";
import { 
  processVariableAssignments, 
  validateAssignments, 
  generateAutoAssignments,
  getEntityFieldsForType 
} from "~/lib/utils/variableProcessor";

interface EnhancedEmailEditorProps {
  selectedTemplate?: string;
  variables?: Record<string, string>;
  variableAssignments?: VariableAssignment[];
  entityType?: string;
  entityData?: Record<string, any>;
  onTemplateSelect: (templateId: string) => void;
  onVariablesChange: (variables: Record<string, string>) => void;
  onVariableAssignmentsChange?: (assignments: VariableAssignment[]) => void;
  isDarkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNewTemplate?: () => void;
  mode?: 'simple' | 'advanced'; // simple = manual variables, advanced = entity assignments
}

export default function EnhancedEmailEditor({
  selectedTemplate,
  variables = {},
  variableAssignments = [],
  entityType = 'contact',
  entityData = {},
  onTemplateSelect,
  onVariablesChange,
  onVariableAssignmentsChange,
  isDarkMode = false,
  isOpen,
  onClose,
  onNewTemplate,
  mode = 'simple'
}: EnhancedEmailEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [currentVariables, setCurrentVariables] = useState<Record<string, string>>(variables);
  const [currentAssignments, setCurrentAssignments] = useState<VariableAssignment[]>(variableAssignments);
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>(mode);
  const [activeTab, setActiveTab] = useState<'template' | 'variables' | 'preview'>('template');
  
  // Use React Query hooks
  const { templates, loading: templatesLoading, error: templatesError } = useEmailTemplates();
  const { template, loading: templateLoading } = useEmailTemplate(selectedTemplate);

  const entityFields = getEntityFieldsForType(entityType);

  useEffect(() => {
    setCurrentVariables(variables);
  }, [variables]);

  useEffect(() => {
    setCurrentAssignments(variableAssignments);
  }, [variableAssignments]);

  useEffect(() => {
    setEditorMode(mode);
  }, [mode]);

  // When template changes and we have entity data, auto-generate assignments if none exist
  useEffect(() => {
    if (template && editorMode === 'advanced' && currentAssignments.length === 0 && template.variables.length > 0) {
      const autoAssignments = generateAutoAssignments(template.variables, entityFields);
      setCurrentAssignments(autoAssignments);
      if (onVariableAssignmentsChange) {
        onVariableAssignmentsChange(autoAssignments);
      }
    }
  }, [template, editorMode, entityFields, currentAssignments.length, onVariableAssignmentsChange]);

  const handleVariableChange = (key: string, value: string) => {
    const newVariables = { ...currentVariables, [key]: value };
    setCurrentVariables(newVariables);
    onVariablesChange(newVariables);
  };

  const handleAssignmentsChange = (assignments: VariableAssignment[]) => {
    setCurrentAssignments(assignments);
    if (onVariableAssignmentsChange) {
      onVariableAssignmentsChange(assignments);
    }

    // If we have entity data, process assignments to generate variable values
    if (entityData && Object.keys(entityData).length > 0) {
      const processedVariables = processVariableAssignments(assignments, entityData);
      setCurrentVariables(processedVariables);
      onVariablesChange(processedVariables);
    }
  };

  const generatePreview = (content: string) => {
    if (!template) return content;
    
    let finalVariables = currentVariables;
    
    // If in advanced mode and we have entity data, process assignments
    if (editorMode === 'advanced' && entityData && Object.keys(entityData).length > 0) {
      finalVariables = processVariableAssignments(currentAssignments, entityData);
    }
    
    return replaceVariables(content, finalVariables);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testWithSampleData = () => {
    // Generate sample data for the entity type
    const sampleData = {
      contact: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        company: "Acme Corporation",
        position: "CEO",
        status: "hot",
        lastContact: "2024-01-15",
        notes: "Interested in enterprise solution",
        address: "123 Main St, San Francisco, CA",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15"
      },
      deal: {
        name: "Enterprise License Deal",
        stage: "proposal",
        value: 50000,
        probability: 75,
        closeDate: "2024-02-28",
        assignedTo: "Sarah Johnson",
        contactId: "1",
        description: "Large enterprise licensing opportunity",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15"
      },
      activity: {
        type: "meeting",
        status: "scheduled",
        subject: "Demo Presentation",
        description: "Product demo for potential client",
        dueDate: "2024-01-20",
        priority: "high",
        assignedTo: "Mike Chen",
        contactId: "1",
        dealId: "1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15"
      }
    };

    const testData = sampleData[entityType as keyof typeof sampleData] || sampleData.contact;
    const testVariables = processVariableAssignments(currentAssignments, testData);
    setCurrentVariables(testVariables);
  };

  const switchMode = (newMode: 'simple' | 'advanced') => {
    setEditorMode(newMode);
    if (newMode === 'simple') {
      // In simple mode, clear assignments and just use manual variables
      setCurrentAssignments([]);
      if (onVariableAssignmentsChange) {
        onVariableAssignmentsChange([]);
      }
    } else if (newMode === 'advanced' && template && template.variables.length > 0) {
      // In advanced mode, generate auto-assignments if we don't have any
      if (currentAssignments.length === 0) {
        const autoAssignments = generateAutoAssignments(template.variables, entityFields);
        setCurrentAssignments(autoAssignments);
        if (onVariableAssignmentsChange) {
          onVariableAssignmentsChange(autoAssignments);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Template Editor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select and customize email templates with {editorMode === 'advanced' ? 'entity field mapping' : 'manual variables'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mode Switcher */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => switchMode('simple')}
                className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                  editorMode === 'simple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => switchMode('advanced')}
                className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                  editorMode === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <CogIcon className="h-4 w-4 inline mr-1" />
                Advanced
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('template')}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'template'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4 inline mr-2" />
              Template
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'variables'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {editorMode === 'advanced' ? (
                <CogIcon className="h-4 w-4 inline mr-2" />
              ) : (
                <PencilIcon className="h-4 w-4 inline mr-2" />
              )}
              {editorMode === 'advanced' ? 'Variable Mapping' : 'Variables'}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <EyeIcon className="h-4 w-4 inline mr-2" />
              Preview
            </button>
          </nav>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Template Selection Tab */}
          {activeTab === 'template' && (
            <div className="w-full overflow-y-auto">
              <div className="p-6">
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
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading templates...</span>
                  </div>
                ) : templatesError ? (
                  <div className="text-center py-8 text-red-600 dark:text-red-400">
                    Error loading templates: {templatesError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => onTemplateSelect(tmpl.id)}
                        className={`cursor-pointer border rounded-lg p-4 transition-colors ${
                          selectedTemplate === tmpl.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{tmpl.name}</h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tmpl.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <strong>Subject:</strong> {tmpl.subject}
                        </p>
                        {tmpl.variables.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <strong>Variables:</strong> {tmpl.variables.length} variable{tmpl.variables.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variables/Mapping Tab */}
          {activeTab === 'variables' && (
            <div className="w-full overflow-y-auto">
              <div className="p-6">
                {!template ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Select a template first to configure variables</p>
                  </div>
                ) : editorMode === 'advanced' ? (
                  <div className="space-y-6">
                    {/* Advanced Mode - Variable Assignment */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Advanced Variable Mapping
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Map template variables to {entityType} entity fields with automatic type conversion
                        </p>
                      </div>
                      {entityData && Object.keys(entityData).length === 0 && (
                        <button
                          onClick={testWithSampleData}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800"
                        >
                          <BeakerIcon className="h-4 w-4 mr-2" />
                          Test with Sample Data
                        </button>
                      )}
                    </div>
                    
                    <VariableAssignmentEditor
                      templateVariables={template.variables}
                      entityType={entityType}
                      entityFields={entityFields}
                      assignments={currentAssignments}
                      onAssignmentsChange={handleAssignmentsChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ) : (
                  <div>
                    {/* Simple Mode - Manual Variables */}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Template Variables</h3>
                    <div className="space-y-4">
                      {template.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {variable?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || 'variable'}
                          </label>
                          <input
                            type="text"
                            value={currentVariables[variable] || ""}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable?.replace(/_/g, " ") || 'variable'}`}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="w-full flex flex-col">
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
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!template ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <EyeIcon className="h-8 w-8 mx-auto mb-2" />
                    <p>Select a template to see preview</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Subject Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {generatePreview(template.subject)}
                        </p>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {previewMode === "html" ? "HTML Content" : "Text Content"}
                      </label>
                      <div className="border border-gray-200 dark:border-gray-600 rounded">
                        {previewMode === "html" ? (
                          <div
                            className="p-4 min-h-64 bg-white"
                            dangerouslySetInnerHTML={{
                              __html: generatePreview(template.htmlContent)
                            }}
                          />
                        ) : (
                          <pre className="p-4 min-h-64 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {generatePreview(template.textContent)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}