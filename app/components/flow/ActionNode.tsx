import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  PlayIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  TagIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useTags } from '~/hooks/useTags';

export interface ActionNodeData {
  label: string;
  actionType?: string;
  target?: string;
  parameters?: Record<string, any>;
  isValid?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Extract the resolved value from a param (handles both { source, value } objects and plain strings) */
function paramValue(param: any): string {
  if (!param) return '';
  if (typeof param === 'object' && param.value !== undefined) return param.value;
  if (typeof param === 'string') return param;
  return '';
}

const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({ data, selected }) => {
  const { label, actionType, target, parameters = {}, isValid = true, onEdit, onDelete } = data;
  const { tags } = useTags();

  const getTag = () => {
    const tagId = paramValue(parameters.tag_id) || paramValue(parameters.tagId);
    if (!tagId) return null;
    return tags.find(t => t.id === tagId) || null;
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'send_email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'create_task':
      case 'create_activity':
        return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
      case 'add_tag':
      case 'remove_tag':
        return <TagIcon className="h-4 w-4" />;
      case 'send_notification':
        return <BellIcon className="h-4 w-4" />;
      case 'create_contact_from_submission':
        return <UserPlusIcon className="h-4 w-4" />;
      default:
        return <PlayIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'send_email':
        return 'from-green-500 to-green-600';
      case 'create_task':
      case 'create_activity':
        return 'from-purple-500 to-purple-600';
      case 'add_tag':
        return 'from-indigo-500 to-indigo-600';
      case 'remove_tag':
        return 'from-red-500 to-red-600';
      case 'send_notification':
        return 'from-orange-500 to-orange-600';
      case 'create_contact_from_submission':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDisplayText = () => {
    if (!actionType) return 'Configure Action';
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getParameterSummary = () => {
    const parts: string[] = [];

    // Tag is rendered as a badge separately — skip here

    // Check for mapped fields (source: "field" params)
    const fieldMappings = Object.entries(parameters).filter(([_, v]) =>
      typeof v === 'object' && v?.source === 'field' && v?.value
    );
    if (fieldMappings.length > 0) {
      parts.push(`${fieldMappings.length} field${fieldMappings.length > 1 ? 's' : ''} mapped`);
    }

    // Check for static values set
    const staticValues = Object.entries(parameters).filter(([key, v]) =>
      typeof v === 'object' && v?.source === 'static' && v?.value && !['tagId', 'tag_id', 'tagName'].includes(key)
    );
    if (staticValues.length > 0 && fieldMappings.length === 0) {
      parts.push(`${staticValues.length} param${staticValues.length > 1 ? 's' : ''} set`);
    }

    // Check for email template (legacy or new format)
    const emailTemplate = paramValue(parameters.emailTemplate);
    if (emailTemplate) {
      parts.push('Template selected');
    }

    // Check for kind (e.g., create_activity)
    const kind = paramValue(parameters.kind);
    if (kind) {
      parts.push(`Kind: ${kind}`);
    }

    return parts.length > 0 ? parts.join(' · ') : null;
  };

  const hasValidConfiguration = () => {
    if (!actionType) return false;
    // For DSL-driven actions, having an action type is sufficient
    // The param validation happens in the modal
    return true;
  };

  const isConfigurationValid = hasValidConfiguration();

  return (
    <div className={`
      relative bg-gradient-to-r ${getActionColor()} text-white rounded-lg shadow-lg min-w-[200px] border-2
      ${selected ? 'border-green-300' : 'border-transparent'}
      ${!isValid || !isConfigurationValid ? 'border-red-400 border-dashed' : ''}
    `}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-green-500"
      />

      {/* Node Header */}
      <div className="px-4 py-2 border-b border-opacity-30 border-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getActionIcon()}
            <span className="text-sm font-medium">Action</span>
          </div>
          <div className="flex items-center space-x-1">
            {(!isValid || !isConfigurationValid) && (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-200" />
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Edit action"
              >
                <PencilIcon className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-600 rounded"
                title="Delete action"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium">
          {getDisplayText()}
        </div>
        {target && (
          <div className="text-xs text-white text-opacity-80 mt-0.5">
            Target: {target}
          </div>
        )}
        {(() => {
          const tag = getTag();
          if (!tag) return null;
          const color = tag.attributes?.color || '#6b7280';
          return (
            <div className="mt-1.5 flex items-center space-x-1.5">
              <TagIcon className="h-3 w-3 text-white text-opacity-70" />
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: color, color: '#fff' }}
              >
                {tag.attributes?.name || 'Tag'}
              </span>
            </div>
          );
        })()}
        {getParameterSummary() && (
          <div className="text-xs text-white text-opacity-80 mt-1">
            {getParameterSummary()}
          </div>
        )}
        {!isValid && !actionType && (
          <div className="text-xs text-yellow-200 mt-1">
            Click to configure
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-green-500"
        style={{ bottom: 10, top: 'auto' }}
      />
    </div>
  );
};

export default ActionNode;
