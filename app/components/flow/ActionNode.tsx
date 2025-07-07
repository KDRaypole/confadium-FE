import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  PlayIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PlusIcon,
  TagIcon,
  BellIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export interface ActionNodeData {
  label: string;
  actionType?: string;
  target?: string;
  parameters?: Record<string, any>;
  isValid?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ActionNode: React.FC<NodeProps<ActionNodeData>> = ({ data, selected }) => {
  const { label, actionType, target, parameters = {}, isValid = true, onEdit, onDelete } = data;

  const getActionIcon = () => {
    switch (actionType) {
      case 'send_email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'create_task':
        return <ClipboardDocumentCheckIcon className="h-4 w-4" />;
      case 'add_tag':
      case 'remove_tag':
        return <TagIcon className="h-4 w-4" />;
      case 'send_notification':
        return <BellIcon className="h-4 w-4" />;
      default:
        return <PlayIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'send_email':
        return 'from-green-500 to-green-600';
      case 'create_task':
        return 'from-purple-500 to-purple-600';
      case 'add_tag':
        return 'from-indigo-500 to-indigo-600';
      case 'remove_tag':
        return 'from-red-500 to-red-600';
      case 'send_notification':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDisplayText = () => {
    if (!actionType) return 'Configure Action';
    
    let text = actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (target) {
      text += ` → ${target}`;
    }
    return text;
  };

  const getParameterSummary = () => {
    if (actionType === 'send_email' && parameters.emailTemplate) {
      const assignmentCount = parameters.variableAssignments?.length || 0;
      return `Template selected${assignmentCount > 0 ? `, ${assignmentCount} variables` : ''}`;
    }
    if (actionType === 'create_task' && parameters.title) {
      return `"${parameters.title}"`;
    }
    if (actionType === 'add_tag' && parameters.tagName) {
      return `Tag: ${parameters.tagName}`;
    }
    return null;
  };

  const hasValidConfiguration = () => {
    if (!actionType || !target) return false;
    
    switch (actionType) {
      case 'send_email':
        return !!parameters.emailTemplate;
      case 'create_task':
        return !!parameters.title;
      case 'add_tag':
      case 'remove_tag':
        return !!parameters.tagId;
      default:
        return true;
    }
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
        {getParameterSummary() && (
          <div className="text-xs text-white text-opacity-80 mt-1">
            {getParameterSummary()}
          </div>
        )}
        {(!isValid || !isConfigurationValid) && (
          <div className="text-xs text-yellow-200 mt-1">
            {!actionType || !target ? 'Type and target required' : 'Configuration incomplete'}
          </div>
        )}
      </div>

      {/* Add another action handle (optional) */}
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