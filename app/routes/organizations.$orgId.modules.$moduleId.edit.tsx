import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useSearchParams } from "@remix-run/react";
import React, { useState } from "react";
import Layout from "~/components/layout/Layout";
import EnhancedEmailEditor from "~/components/email/EnhancedEmailEditor";
import { type VariableAssignment } from "~/components/email/VariableAssignmentEditor";
import EmailPreview from "~/components/email/EmailPreview";
import EmailTemplateManager from "~/components/email/EmailTemplateManager";
import { getTemplateById } from "~/components/email/EmailTemplates";
import { getTagColorClass } from "~/components/tags/TagsData";
import SimpleSelect, { type SimpleSelectOption } from "~/components/ui/SimpleSelect";
import { useTags, type Tag } from "~/hooks/useTags";
import { useModule, useConfiguration, useModuleConfigurations, type Configuration, type ConfigurationCreateData } from "~/hooks/useModules";
import InteractiveFlowEditor from "~/components/flow/InteractiveFlowEditor";
import TriggerConfigModal, { type TriggerConfig } from "~/components/flow/modals/TriggerConfigModal";
import ConditionConfigModal, { type Condition } from "~/components/flow/modals/ConditionConfigModal";
import ActionConfigModal, { type ActionConfig } from "~/components/flow/modals/ActionConfigModal";
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  EyeIcon,
  ComputerDesktopIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Module Configuration - CRM Dashboard" },
    { name: "description", content: "Create and edit automation configurations" },
  ];
};

// Re-export types from modal components for consistency
export type { Condition } from "~/components/flow/modals/ConditionConfigModal";
export type { ActionConfig as Action } from "~/components/flow/modals/ActionConfigModal";
export type { TriggerConfig } from "~/components/flow/modals/TriggerConfigModal";

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

// Entity types and their available actions
const entityTypes = [
  {
    value: "contact",
    label: "Contact",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "name", label: "Name", type: "text" },
      { value: "email", label: "Email", type: "email" },
      { value: "phone", label: "Phone", type: "text" },
      { value: "company", label: "Company", type: "text" },
      { value: "status", label: "Status", type: "select", options: ["hot", "warm", "cold"] },
      { value: "source", label: "Lead Source", type: "select", options: ["Website", "Email", "Phone", "Social Media", "Referral"] },
      { value: "score", label: "Lead Score", type: "number" },
      { value: "value", label: "Estimated Value", type: "number" },
      { value: "territory", label: "Territory", type: "text" },
      { value: "lastContact", label: "Last Contact Date", type: "date" },
      { value: "tags", label: "Tags", type: "text" }
    ]
  },
  {
    value: "deal",
    label: "Deal/Opportunity",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "name", label: "Deal Name", type: "text" },
      { value: "stage", label: "Stage", type: "select", options: ["prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"] },
      { value: "value", label: "Deal Value", type: "number" },
      { value: "probability", label: "Probability", type: "number" },
      { value: "closeDate", label: "Close Date", type: "date" },
      { value: "assignedTo", label: "Assigned To", type: "text" },
      { value: "contactId", label: "Primary Contact", type: "text" },
      { value: "description", label: "Description", type: "text" },
      { value: "tags", label: "Tags", type: "text" }
    ]
  },
  {
    value: "activity",
    label: "Activity",
    actions: ["create", "update", "delete"],
    attributes: [
      { value: "type", label: "Activity Type", type: "select", options: ["call", "email", "meeting", "task", "note"] },
      { value: "status", label: "Status", type: "select", options: ["completed", "scheduled", "overdue", "cancelled"] },
      { value: "subject", label: "Subject", type: "text" },
      { value: "description", label: "Description", type: "text" },
      { value: "dueDate", label: "Due Date", type: "date" },
      { value: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"] },
      { value: "assignedTo", label: "Assigned To", type: "text" },
      { value: "contactId", label: "Related Contact", type: "text" },
      { value: "dealId", label: "Related Deal", type: "text" }
    ]
  },
  {
    value: "email",
    label: "Email",
    actions: ["sent", "opened", "clicked", "bounced", "replied"],
    attributes: [
      { value: "subject", label: "Subject", type: "text" },
      { value: "templateId", label: "Template", type: "text" },
      { value: "recipientEmail", label: "Recipient Email", type: "email" },
      { value: "openCount", label: "Open Count", type: "number" },
      { value: "clickCount", label: "Click Count", type: "number" },
      { value: "sentDate", label: "Sent Date", type: "date" },
      { value: "campaignId", label: "Campaign ID", type: "text" }
    ]
  },
  {
    value: "form",
    label: "Form",
    actions: ["submitted"],
    attributes: [
      { value: "formId", label: "Form ID", type: "text" },
      { value: "formName", label: "Form Name", type: "text" },
      { value: "submitterEmail", label: "Submitter Email", type: "email" },
      { value: "submissionDate", label: "Submission Date", type: "date" },
      { value: "source", label: "Source Page", type: "text" }
    ]
  },
  {
    value: "call",
    label: "Call",
    actions: ["created", "completed", "missed"],
    attributes: [
      { value: "duration", label: "Duration (minutes)", type: "number" },
      { value: "outcome", label: "Outcome", type: "select", options: ["successful", "busy", "no-answer", "voicemail"] },
      { value: "notes", label: "Call Notes", type: "text" },
      { value: "scheduledDate", label: "Scheduled Date", type: "date" },
      { value: "contactId", label: "Contact ID", type: "text" },
      { value: "assignedTo", label: "Assigned To", type: "text" }
    ]
  }
];

const triggerActions = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  sent: "Sent",
  opened: "Opened",
  clicked: "Clicked",
  bounced: "Bounced",
  replied: "Replied to",
  submitted: "Submitted",
  completed: "Completed",
  missed: "Missed"
};

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

  // Hooks
  const { module, loading: moduleLoading, error: moduleError } = useModule(moduleId);
  const { configuration: existingConfig, loading: configLoading, updateConfiguration, isUpdating } = useConfiguration(configId || undefined);
  const { createConfiguration, isCreating } = useModuleConfigurations(moduleId);

  // Initialize with empty configuration or load existing one
  const [configuration, setConfiguration] = useState<Omit<Configuration, 'id' | 'moduleId' | 'createdDate' | 'updatedDate'>>({
    name: "",
    description: "",
    trigger: {
      entityType: "",
      action: "",
      attributeFilter: undefined
    },
    conditions: [],
    actions: [],
    status: "draft"
  });

  // Load existing configuration when available
  React.useEffect(() => {
    if (existingConfig) {
      setConfiguration({
        name: existingConfig.name,
        description: existingConfig.description,
        trigger: existingConfig.trigger,
        conditions: existingConfig.conditions,
        actions: existingConfig.actions,
        status: existingConfig.status
      });
    }
  }, [existingConfig]);

  // View mode state
  const [viewMode, setViewMode] = useState<'form' | 'flow'>('form');

  // Email editor state
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailTemplateManagerOpen, setEmailTemplateManagerOpen] = useState(false);
  
  // Flow editor modal states
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  
  // Tags state
  const { tags: availableTags } = useTags();

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

  const handleVariableAssignmentsChange = (assignments: VariableAssignment[]) => {
    if (currentActionId) {
      updateAction(currentActionId, {
        parameters: {
          ...getActionById(currentActionId)?.parameters,
          variableAssignments: assignments
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

  const getCurrentVariableAssignments = () => {
    if (!currentActionId) return [];
    const action = getActionById(currentActionId);
    return action?.parameters?.variableAssignments || [];
  };

  const getEntityType = (entityValue: string) => {
    return entityTypes.find(entity => entity.value === entityValue);
  };

  const getAvailableActions = (entityValue: string) => {
    const entity = getEntityType(entityValue);
    return entity ? entity.actions : [];
  };

  const getEntityAttributes = (entityValue: string) => {
    const entity = getEntityType(entityValue);
    return entity ? entity.attributes : [];
  };

  const formatTriggerDisplay = (trigger: TriggerConfig) => {
    if (!trigger.entityType || !trigger.action) return "No trigger selected";
    
    const entity = getEntityType(trigger.entityType);
    const actionLabel = triggerActions[trigger.action as keyof typeof triggerActions];
    
    let display = `${entity?.label || trigger.entityType} ${actionLabel}`;
    
    if (trigger.attributeFilter && trigger.action === "update") {
      const attribute = entity?.attributes.find(attr => attr.value === trigger.attributeFilter);
      display += ` (${attribute?.label || trigger.attributeFilter})`;
    }
    
    return display;
  };

  const getAvailableTargets = (actionType: string): string[] => {
    const action = actionTypes.find(at => at.value === actionType);
    return action ? action.targets : [];
  };

  const handleSave = async (status: "draft" | "active") => {
    if (!moduleId) return;
    
    const configData: ConfigurationCreateData = {
      moduleId,
      name: configuration.name,
      description: configuration.description,
      trigger: configuration.trigger,
      conditions: configuration.conditions,
      actions: configuration.actions,
      status
    };

    try {
      if (configId && existingConfig) {
        // Update existing configuration
        await updateConfiguration(configData);
        alert("Configuration updated successfully!");
      } else {
        // Create new configuration
        await createConfiguration(configData);
        alert("Configuration created successfully!");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("Failed to save configuration. Please try again.");
    }
  };

  // Flow editor handlers
  const handleFlowConfigurationChange = (flowConfig: any) => {
    setConfiguration(prev => ({
      ...prev,
      trigger: flowConfig.trigger,
      conditions: flowConfig.conditions,
      actions: flowConfig.actions
    }));
  };

  const handleNodeEdit = (nodeType: 'trigger' | 'condition' | 'action', nodeId?: string) => {
    switch (nodeType) {
      case 'trigger':
        setTriggerModalOpen(true);
        break;
      case 'condition':
        setConditionModalOpen(true);
        break;
      case 'action':
        setEditingActionId(nodeId || null);
        setActionModalOpen(true);
        break;
    }
  };

  const handleTriggerSave = (trigger: TriggerConfig) => {
    setConfiguration(prev => ({
      ...prev,
      trigger
    }));
    setTriggerModalOpen(false);
  };

  const handleConditionsSave = (conditions: Condition[]) => {
    setConfiguration(prev => ({
      ...prev,
      conditions
    }));
    setConditionModalOpen(false);
  };

  const handleActionSave = (action: ActionConfig) => {
    if (editingActionId) {
      // Update existing action
      setConfiguration(prev => ({
        ...prev,
        actions: prev.actions.map(a => a.id === editingActionId ? action : a)
      }));
    } else {
      // Add new action
      setConfiguration(prev => ({
        ...prev,
        actions: [...prev.actions, action]
      }));
    }
    setActionModalOpen(false);
    setEditingActionId(null);
  };

  const getEditingAction = (): ActionConfig | undefined => {
    if (!editingActionId) return undefined;
    return configuration.actions.find(action => action.id === editingActionId);
  };

  // Loading states
  if (moduleLoading || configLoading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading configuration...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error states
  if (moduleError) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Module</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{moduleError}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Module not found
  if (!module) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Module Not Found</h1>
              <Link to={`/organizations/${orgId}/modules`} className="text-blue-600 hover:text-blue-500">
                Back to Modules
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
                {/* View Mode Toggle */}
                <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('form')}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'form'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4 mr-1.5" />
                    Form
                  </button>
                  <button
                    onClick={() => setViewMode('flow')}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'flow'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <ComputerDesktopIcon className="h-4 w-4 mr-1.5" />
                    Flow
                  </button>
                </div>

                <button
                  onClick={() => setEmailTemplateManagerOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Email Templates
                </button>
                <button
                  onClick={() => handleSave("draft")}
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {(isCreating || isUpdating) ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={() => handleSave("active")}
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {(isCreating || isUpdating) ? "Saving..." : "Save & Activate"}
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information - Always shown */}
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

          {/* Conditional Content Based on View Mode */}
          {viewMode === 'flow' ? (
            /* Interactive Flow Editor */
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 h-[600px]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Workflow Designer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build your automation visually by adding and connecting nodes
                </p>
              </div>
              <div className="h-[532px]">
                <InteractiveFlowEditor
                  configuration={{
                    trigger: configuration.trigger,
                    conditions: configuration.conditions,
                    actions: configuration.actions
                  }}
                  onConfigurationChange={handleFlowConfigurationChange}
                  onNodeEdit={handleNodeEdit}
                />
              </div>
            </div>
          ) : (
            /* Traditional Form View */
            <div className="space-y-6">

            {/* Trigger Selection */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Trigger</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose what event will start this automation</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Entity Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entity Type
                  </label>
                  <SimpleSelect
                    options={[
                      { value: "", label: "Select entity type..." },
                      ...entityTypes.map(entity => ({
                        value: entity.value,
                        label: entity.label
                      }))
                    ]}
                    value={configuration.trigger.entityType}
                    onChange={(value) => setConfiguration(prev => ({ 
                      ...prev, 
                      trigger: { 
                        entityType: value, 
                        action: "", 
                        attributeFilter: undefined 
                      } 
                    }))}
                  />
                </div>

                {/* Action Selection */}
                {configuration.trigger.entityType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Action
                    </label>
                    <SimpleSelect
                      options={[
                        { value: "", label: "Select action..." },
                        ...getAvailableActions(configuration.trigger.entityType).map(action => ({
                          value: action,
                          label: triggerActions[action as keyof typeof triggerActions]
                        }))
                      ]}
                      value={configuration.trigger.action}
                      onChange={(value) => setConfiguration(prev => ({ 
                        ...prev, 
                        trigger: { 
                          ...prev.trigger, 
                          action: value,
                          attributeFilter: value === "update" ? prev.trigger.attributeFilter : undefined
                        } 
                      }))}
                    />
                  </div>
                )}

                {/* Attribute Filter for Update Actions */}
                {configuration.trigger.entityType && configuration.trigger.action === "update" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specific Attribute (Optional)
                    </label>
                    <SimpleSelect
                      options={[
                        { value: "", label: "Any attribute (trigger on any update)" },
                        ...getEntityAttributes(configuration.trigger.entityType).map(attribute => ({
                          value: attribute.value,
                          label: attribute.label
                        }))
                      ]}
                      value={configuration.trigger.attributeFilter || ""}
                      onChange={(value) => setConfiguration(prev => ({ 
                        ...prev, 
                        trigger: { 
                          ...prev.trigger, 
                          attributeFilter: value || undefined
                        } 
                      }))}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Leave empty to trigger on any update, or select a specific attribute to only trigger when that attribute changes
                    </p>
                  </div>
                )}

                {/* Trigger Preview */}
                {configuration.trigger.entityType && configuration.trigger.action && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">T</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Trigger Preview
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {formatTriggerDisplay(configuration.trigger)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                            <SimpleSelect
                              options={[
                                { value: "AND", label: "AND" },
                                { value: "OR", label: "OR" }
                              ]}
                              value={condition.logicOperator || ""}
                              onChange={(value) => updateCondition(condition.id, { logicOperator: value as "AND" | "OR" })}
                              size="sm"
                              className="inline-flex"
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Field</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select field..." },
                                ...crmFields.map(field => ({
                                  value: field.value,
                                  label: field.label
                                }))
                              ]}
                              value={condition.field}
                              onChange={(value) => updateCondition(condition.id, { field: value, operator: "", value: "" })}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Operator</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select operator..." },
                                ...getAvailableOperators(condition.field).map(operator => ({
                                  value: operator.value,
                                  label: operator.label
                                }))
                              ]}
                              value={condition.operator}
                              onChange={(value) => updateCondition(condition.id, { operator: value })}
                              disabled={!condition.field}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                            {getFieldType(condition.field) === "select" ? (
                              <SimpleSelect
                                options={[
                                  { value: "", label: "Select value..." },
                                  ...getFieldOptions(condition.field).map(option => ({
                                    value: option,
                                    label: option
                                  }))
                                ]}
                                value={condition.value}
                                onChange={(value) => updateCondition(condition.id, { value })}
                                size="sm"
                              />
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
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select action type..." },
                                ...actionTypes.map(actionType => ({
                                  value: actionType.value,
                                  label: actionType.label
                                }))
                              ]}
                              value={action.type}
                              onChange={(value) => updateAction(action.id, { type: value, target: "" })}
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                            <SimpleSelect
                              options={[
                                { value: "", label: "Select target..." },
                                ...getAvailableTargets(action.type).map(target => ({
                                  value: target,
                                  label: target
                                }))
                              ]}
                              value={action.target}
                              onChange={(value) => updateAction(action.id, { target: value })}
                              disabled={!action.type}
                              size="sm"
                            />
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
                                                  {action.parameters?.variableAssignments && action.parameters.variableAssignments.length > 0 && (
                                                    <div className="mt-1">
                                                      <strong>Assignments:</strong> {action.parameters.variableAssignments.length}/{template.variables.length} configured
                                                    </div>
                                                  )}
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
                                  <SimpleSelect
                                    options={[
                                      { value: "", label: "Task priority..." },
                                      { value: "low", label: "Low" },
                                      { value: "medium", label: "Medium" },
                                      { value: "high", label: "High" },
                                      { value: "urgent", label: "Urgent" }
                                    ]}
                                    value={action.parameters?.priority || ""}
                                    onChange={(value) => updateAction(action.id, {
                                      parameters: { ...action.parameters, priority: value }
                                    })}
                                    size="sm"
                                  />
                                </>
                              )}
                              {action.type === "update_field" && (
                                <>
                                  <SimpleSelect
                                    options={[
                                      { value: "", label: "Field to update..." },
                                      ...crmFields.map(field => ({
                                        value: field.value,
                                        label: field.label
                                      }))
                                    ]}
                                    value={action.parameters?.fieldToUpdate || ""}
                                    onChange={(value) => updateAction(action.id, {
                                      parameters: { ...action.parameters, fieldToUpdate: value }
                                    })}
                                    size="sm"
                                  />
                                  <input
                                    type="text"
                                    placeholder="New value..."
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </>
                              )}
                              {action.type === "add_tag" && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select Tag to Add</label>
                                    <SimpleSelect
                                      options={[
                                        { value: "", label: "Select a tag..." },
                                        ...availableTags.map(tag => ({
                                          value: tag.id,
                                          label: tag.name
                                        }))
                                      ]}
                                      value={action.parameters?.tagId || ""}
                                      onChange={(value) => updateAction(action.id, {
                                        parameters: { ...action.parameters, tagId: value }
                                      })}
                                      size="sm"
                                    />
                                    {action.parameters?.tagId && (
                                      <div className="mt-2 flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Selected tag:</span>
                                        {(() => {
                                          const selectedTag = availableTags.find(t => t.id === action.parameters?.tagId);
                                          return selectedTag ? (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColorClass(selectedTag.color)}`}>
                                              {selectedTag.name}
                                            </span>
                                          ) : null;
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Entity to Add Tag To</label>
                                    <SimpleSelect
                                      options={[
                                        { value: "", label: "Select entity type..." },
                                        { value: "contact", label: "Contact" },
                                        { value: "deal", label: "Deal" },
                                        { value: "activity", label: "Activity" }
                                      ]}
                                      value={action.parameters?.entityType || ""}
                                      onChange={(value) => updateAction(action.id, {
                                        parameters: { ...action.parameters, entityType: value }
                                      })}
                                      size="sm"
                                    />
                                  </div>
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
          )}
        </div>
      </div>

      {/* Flow Editor Modals */}
      <TriggerConfigModal
        isOpen={triggerModalOpen}
        trigger={configuration.trigger}
        onSave={handleTriggerSave}
        onClose={() => setTriggerModalOpen(false)}
      />

      <ConditionConfigModal
        isOpen={conditionModalOpen}
        conditions={configuration.conditions}
        onSave={handleConditionsSave}
        onClose={() => setConditionModalOpen(false)}
      />

      <ActionConfigModal
        isOpen={actionModalOpen}
        action={getEditingAction()}
        entityType={configuration.trigger.entityType}
        onSave={handleActionSave}
        onClose={() => {
          setActionModalOpen(false);
          setEditingActionId(null);
        }}
      />

      {/* Enhanced Email Editor Modal */}
      <EnhancedEmailEditor
        isOpen={emailEditorOpen}
        selectedTemplate={getCurrentEmailTemplate()}
        variables={getCurrentEmailVariables()}
        variableAssignments={getCurrentVariableAssignments()}
        entityType={configuration.trigger.entityType || 'contact'}
        entityData={{}}
        onTemplateSelect={handleEmailTemplateSelect}
        onVariablesChange={handleEmailVariablesChange}
        onVariableAssignmentsChange={handleVariableAssignmentsChange}
        onNewTemplate={() => {
          setEmailEditorOpen(false);
          setEmailTemplateManagerOpen(true);
        }}
        onClose={() => {
          setEmailEditorOpen(false);
          setCurrentActionId(null);
        }}
        mode="advanced"
        isDarkMode={false} // You can integrate with your dark mode context here
      />

      {/* Email Template Manager Modal */}
      <EmailTemplateManager
        isOpen={emailTemplateManagerOpen}
        onClose={() => setEmailTemplateManagerOpen(false)}
        isDarkMode={false}
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