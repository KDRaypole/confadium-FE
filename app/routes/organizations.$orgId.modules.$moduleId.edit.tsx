import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import EmailEditor from "~/components/email/EmailEditor";
import EmailPreview from "~/components/email/EmailPreview";
import { getTemplateById } from "~/components/email/EmailTemplates";
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Module Configuration - CRM Dashboard" },
    { name: "description", content: "Create and edit automation configurations" },
  ];
};

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: "AND" | "OR";
}

interface Action {
  id: string;
  type: string;
  target: string;
  parameters: Record<string, any>;
}

interface Configuration {
  id?: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Condition[];
  actions: Action[];
  status: "active" | "inactive" | "draft";
}

// CRM field options for dropdown conditions
const crmFields = [
  { value: "contact.name", label: "Contact Name", type: "text" },
  { value: "contact.email", label: "Contact Email", type: "email" },
  { value: "contact.phone", label: "Contact Phone", type: "text" },
  { value: "contact.company", label: "Company", type: "text" },
  { value: "contact.status", label: "Contact Status", type: "select", options: ["hot", "warm", "cold"] },
  { value: "contact.source", label: "Lead Source", type: "select", options: ["Website", "Email", "Phone", "Social Media", "Referral"] },
  { value: "contact.score", label: "Lead Score", type: "number" },
  { value: "contact.value", label: "Estimated Value", type: "number" },
  { value: "contact.territory", label: "Territory", type: "text" },
  { value: "contact.lastContact", label: "Last Contact Date", type: "date" },
  { value: "deal.stage", label: "Deal Stage", type: "select", options: ["prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"] },
  { value: "deal.value", label: "Deal Value", type: "number" },
  { value: "deal.probability", label: "Deal Probability", type: "number" },
  { value: "deal.closeDate", label: "Close Date", type: "date" },
  { value: "activity.type", label: "Activity Type", type: "select", options: ["call", "email", "meeting", "task"] },
  { value: "activity.status", label: "Activity Status", type: "select", options: ["completed", "scheduled", "overdue"] }
];

const operators = [
  { value: "equals", label: "equals", types: ["text", "email", "select"] },
  { value: "not_equals", label: "does not equal", types: ["text", "email", "select"] },
  { value: "contains", label: "contains", types: ["text", "email"] },
  { value: "not_contains", label: "does not contain", types: ["text", "email"] },
  { value: "starts_with", label: "starts with", types: ["text", "email"] },
  { value: "ends_with", label: "ends with", types: ["text", "email"] },
  { value: "is_empty", label: "is empty", types: ["text", "email"] },
  { value: "not_empty", label: "is not empty", types: ["text", "email"] },
  { value: "greater_than", label: "greater than", types: ["number"] },
  { value: "less_than", label: "less than", types: ["number"] },
  { value: "greater_equal", label: "greater than or equal", types: ["number"] },
  { value: "less_equal", label: "less than or equal", types: ["number"] },
  { value: "between", label: "between", types: ["number", "date"] },
  { value: "before", label: "before", types: ["date"] },
  { value: "after", label: "after", types: ["date"] },
  { value: "older_than", label: "older than", types: ["date"] },
  { value: "newer_than", label: "newer than", types: ["date"] }
];

const triggers = [
  "New Contact Created",
  "Contact Updated", 
  "Contact Status Changed",
  "New Deal Created",
  "Deal Stage Changed",
  "Deal Value Updated",
  "Activity Completed",
  "Email Opened",
  "Email Clicked",
  "Form Submitted",
  "Page Visited",
  "Score Threshold Reached",
  "No Response for X Days",
  "Meeting Scheduled",
  "Call Completed"
];

const actionTypes = [
  { value: "assign_lead", label: "Assign Lead", targets: ["Sales Rep", "Sales Team", "Territory Owner"] },
  { value: "send_email", label: "Send Email", targets: ["Me", "Contact", "Lead", "Sales Rep", "Sales Manager"] },
  { value: "create_task", label: "Create Task", targets: ["Sales Rep", "Sales Manager", "Support Team"] },
  { value: "update_field", label: "Update Field", targets: ["Contact", "Deal", "Activity"] },
  { value: "change_status", label: "Change Status", targets: ["Contact", "Deal", "Lead"] },
  { value: "add_tag", label: "Add Tag", targets: ["Contact", "Deal"] },
  { value: "remove_tag", label: "Remove Tag", targets: ["Contact", "Deal"] },
  { value: "send_notification", label: "Send Notification", targets: ["Sales Team", "Management", "Support"] },
  { value: "create_deal", label: "Create Deal", targets: ["Contact"] },
  { value: "schedule_followup", label: "Schedule Follow-up", targets: ["Sales Rep", "Contact"] },
  { value: "webhook", label: "Send Webhook", targets: ["External System", "API Endpoint"] }
];

export default function ModuleEdit() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { orgId, moduleId } = params;
  const configId = searchParams.get("configId");

  // Initialize with empty configuration or load existing one
  const [configuration, setConfiguration] = useState<Configuration>({
    name: "",
    description: "",
    trigger: "",
    conditions: [],
    actions: [],
    status: "draft"
  });

  // Email editor state
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Math.random().toString(36).substr(2, 9),
      field: "",
      operator: "",
      value: "",
      logicOperator: configuration.conditions.length > 0 ? "AND" : undefined
    };
    setConfiguration(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConfiguration(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  };

  const removeCondition = (id: string) => {
    setConfiguration(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Math.random().toString(36).substr(2, 9),
      type: "",
      target: "",
      parameters: {}
    };
    setConfiguration(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setConfiguration(prev => ({
      ...prev,
      actions: prev.actions.map(action =>
        action.id === id ? { ...action, ...updates } : action
      )
    }));
  };

  const removeAction = (id: string) => {
    setConfiguration(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== id)
    }));
  };

  const getFieldType = (fieldValue: string) => {
    const field = crmFields.find(f => f.value === fieldValue);
    return field?.type || "text";
  };

  const getFieldOptions = (fieldValue: string) => {
    const field = crmFields.find(f => f.value === fieldValue);
    return field?.options || [];
  };

  const getAvailableOperators = (fieldValue: string) => {
    const fieldType = getFieldType(fieldValue);
    return operators.filter(op => op.types.includes(fieldType));
  };

  const getAvailableTargets = (actionType: string) => {
    const action = actionTypes.find(a => a.value === actionType);
    return action?.targets || [];
  };

  const handleSave = (status: "draft" | "active") => {
    const updatedConfig = { ...configuration, status };
    console.log("Saving configuration:", updatedConfig);
    // Here you would typically save to your backend
  };

  const openEmailEditor = (actionId: string) => {
    setCurrentActionId(actionId);
    setEmailEditorOpen(true);
  };

  const handleEmailTemplateSelect = (templateId: string) => {
    if (currentActionId) {
      updateAction(currentActionId, {
        parameters: {
          ...getActionById(currentActionId)?.parameters,
          emailTemplate: templateId,
          emailVariables: {}
        }
      });
    }
  };

  const handleEmailVariablesChange = (variables: Record<string, string>) => {
    if (currentActionId) {
      updateAction(currentActionId, {
        parameters: {
          ...getActionById(currentActionId)?.parameters,
          emailVariables: variables
        }
      });
    }
  };

  const getActionById = (actionId: string) => {
    return configuration.actions.find(action => action.id === actionId);
  };

  const getCurrentEmailTemplate = () => {
    if (!currentActionId) return undefined;
    const action = getActionById(currentActionId);
    return action?.parameters?.emailTemplate;
  };

  const getCurrentEmailVariables = () => {
    if (!currentActionId) return {};
    const action = getActionById(currentActionId);
    return action?.parameters?.emailVariables || {};
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={`/organizations/${orgId}/modules`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Modules
              </Link>
              <span>/</span>
              <Link to={`/organizations/${orgId}/modules/${moduleId}`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Module Details
              </Link>
              <span>/</span>
              <span>{configId ? "Edit Configuration" : "New Configuration"}</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={`/organizations/${orgId}/modules/${moduleId}`}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Module
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {configId ? "Edit Configuration" : "New Configuration"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set up automated workflows with if-this-then-that logic
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSave("draft")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave("active")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save & Activate
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Basic Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Configuration Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={configuration.name}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter a descriptive name for this configuration"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={configuration.description}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe what this configuration does"
                  />
                </div>
              </div>
            </div>

            {/* Trigger Selection */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Trigger</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose what event will start this automation</p>
              </div>
              <div className="p-6">
                <div className="relative">
                  <select
                    value={configuration.trigger}
                    onChange={(e) => setConfiguration(prev => ({ ...prev, trigger: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                  >
                    <option value="">Select a trigger event...</option>
                    {triggers.map((trigger) => (
                      <option key={trigger} value={trigger}>
                        {trigger}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Conditions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set conditions that must be met for the automation to run</p>
                  </div>
                  <button
                    onClick={addCondition}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Add Condition
                  </button>
                </div>
              </div>
              <div className="p-6">
                {configuration.conditions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No conditions set. The automation will run for all triggers.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configuration.conditions.map((condition, index) => (
                      <div key={condition.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        {index > 0 && (
                          <div className="mb-4">
                            <select
                              value={condition.logicOperator}
                              onChange={(e) => updateCondition(condition.id, { logicOperator: e.target.value as "AND" | "OR" })}
                              className="inline-flex px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </select>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Field</label>
                            <select
                              value={condition.field}
                              onChange={(e) => updateCondition(condition.id, { field: e.target.value, operator: "", value: "" })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select field...</option>
                              {crmFields.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Operator</label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={!condition.field}
                            >
                              <option value="">Select operator...</option>
                              {getAvailableOperators(condition.field).map((operator) => (
                                <option key={operator.value} value={operator.value}>
                                  {operator.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                            {getFieldType(condition.field) === "select" ? (
                              <select
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              >
                                <option value="">Select value...</option>
                                {getFieldOptions(condition.field).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={getFieldType(condition.field) === "number" ? "number" : getFieldType(condition.field) === "date" ? "date" : "text"}
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Enter value..."
                              />
                            )}
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeCondition(condition.id)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Actions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Define what happens when the trigger and conditions are met</p>
                  </div>
                  <button
                    onClick={addAction}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Add Action
                  </button>
                </div>
              </div>
              <div className="p-6">
                {configuration.actions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No actions defined. Add actions to specify what should happen.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {configuration.actions.map((action, index) => (
                      <div key={action.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action {index + 1}</span>
                          <button
                            onClick={() => removeAction(action.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action Type</label>
                            <select
                              value={action.type}
                              onChange={(e) => updateAction(action.id, { type: e.target.value, target: "" })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select action type...</option>
                              {actionTypes.map((actionType) => (
                                <option key={actionType.value} value={actionType.value}>
                                  {actionType.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                            <select
                              value={action.target}
                              onChange={(e) => updateAction(action.id, { target: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={!action.type}
                            >
                              <option value="">Select target...</option>
                              {getAvailableTargets(action.type).map((target) => (
                                <option key={target} value={target}>
                                  {target}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {/* Action-specific parameters */}
                        {action.type && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Parameters</label>
                            <div className="space-y-2">
                              {action.type === "send_email" && (
                                <>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => openEmailEditor(action.id)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 dark:border-blue-600 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        <EnvelopeIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                        {action.parameters?.emailTemplate ? "Edit Email Template" : "Select Email Template"}
                                      </button>
                                      {action.parameters?.emailTemplate && (
                                        <button
                                          onClick={() => {
                                            setCurrentActionId(action.id);
                                            setEmailPreviewOpen(true);
                                          }}
                                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                          title="Preview email"
                                        >
                                          <EyeIcon className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                    
                                    {action.parameters?.emailTemplate && (
                                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        {(() => {
                                          const template = getTemplateById(action.parameters.emailTemplate);
                                          return template ? (
                                            <div>
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                  {template.name}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                  {template.category}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {template.description}
                                              </p>
                                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <strong>Subject:</strong> {template.subject}
                                              </div>
                                              {template.variables.length > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                  <strong>Variables:</strong> {template.variables.join(", ")}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-sm text-red-600 dark:text-red-400">Template not found</span>
                                          );
                                        })()}
                                      </div>
                                    )}
                                    
                                    <input
                                      type="text"
                                      placeholder="Delay (e.g., 5 minutes, 1 hour)..."
                                      value={action.parameters?.delay || ""}
                                      onChange={(e) => updateAction(action.id, {
                                        parameters: { ...action.parameters, delay: e.target.value }
                                      })}
                                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                  </div>
                                </>
                              )}
                              {action.type === "create_task" && (
                                <>
                                  <input
                                    type="text"
                                    placeholder="Task title..."
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Due date (e.g., 2 hours, tomorrow)..."
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    <option>Task priority...</option>
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Urgent</option>
                                  </select>
                                </>
                              )}
                              {action.type === "update_field" && (
                                <>
                                  <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                                    <option>Field to update...</option>
                                    {crmFields.map((field) => (
                                      <option key={field.value} value={field.value}>
                                        {field.label}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="New value..."
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Editor Modal */}
      <EmailEditor
        isOpen={emailEditorOpen}
        selectedTemplate={getCurrentEmailTemplate()}
        variables={getCurrentEmailVariables()}
        onTemplateSelect={handleEmailTemplateSelect}
        onVariablesChange={handleEmailVariablesChange}
        onClose={() => {
          setEmailEditorOpen(false);
          setCurrentActionId(null);
        }}
        isDarkMode={false} // You can integrate with your dark mode context here
      />

      {/* Email Preview Modal */}
      <EmailPreview
        isOpen={emailPreviewOpen}
        templateId={getCurrentEmailTemplate()}
        variables={getCurrentEmailVariables()}
        onClose={() => {
          setEmailPreviewOpen(false);
          setCurrentActionId(null);
        }}
        isDarkMode={false} // You can integrate with your dark mode context here
      />
    </Layout>
  );
}