import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  BoltIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface TriggerNodeData {
  label: string;
  entityType?: string;
  action?: string;
  attributeFilter?: string;
  isValid?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TriggerNode: React.FC<NodeProps<TriggerNodeData>> = ({ data, selected }) => {
  const { label, entityType, action, attributeFilter, isValid = true, onEdit, onDelete } = data;

  const getDisplayText = () => {
    if (!entityType || !action) return 'Configure Trigger';
    
    let text = `${entityType} ${action}`;
    if (attributeFilter && action === 'update') {
      text += ` (${attributeFilter})`;
    }
    return text;
  };

  return (
    <div className={`
      relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg min-w-[200px] border-2
      ${selected ? 'border-blue-300' : 'border-transparent'}
      ${!isValid ? 'border-red-400 border-dashed' : ''}
    `}>
      {/* Node Header */}
      <div className="px-4 py-2 border-b border-blue-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BoltIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Trigger</span>
          </div>
          <div className="flex items-center space-x-1">
            {!isValid && (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-300" />
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-blue-700 rounded"
                title="Edit trigger"
              >
                <PencilIcon className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-600 rounded"
                title="Delete trigger"
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
        {!isValid && (
          <div className="text-xs text-yellow-200 mt-1">
            Configuration required
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-blue-500"
      />
    </div>
  );
};

export default TriggerNode;