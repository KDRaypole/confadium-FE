import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  FunnelIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export interface ConditionNodeData {
  label: string;
  conditions?: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
    logicOperator?: 'AND' | 'OR';
  }>;
  isValid?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddCondition?: () => void;
}

const ConditionNode: React.FC<NodeProps<ConditionNodeData>> = ({ data, selected }) => {
  const { label, conditions = [], isValid = true, onEdit, onDelete, onAddCondition } = data;

  const getDisplayText = () => {
    if (conditions.length === 0) return 'Add Conditions';
    if (conditions.length === 1) {
      const condition = conditions[0];
      return `${condition.field} ${condition.operator} ${condition.value}`;
    }
    return `${conditions.length} conditions`;
  };

  const hasValidConditions = conditions.length > 0 && conditions.every(c => c.field && c.operator);

  return (
    <div className={`
      relative bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg min-w-[240px] max-w-[300px] border-2
      ${selected ? 'border-yellow-300' : 'border-transparent'}
      ${!isValid || !hasValidConditions ? 'border-red-400 border-dashed' : ''}
    `}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 border-yellow-500"
      />

      {/* Node Header */}
      <div className="px-4 py-2 border-b border-yellow-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Conditions</span>
          </div>
          <div className="flex items-center space-x-1">
            {(!isValid || !hasValidConditions) && (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-200" />
            )}
            {onAddCondition && (
              <button
                onClick={onAddCondition}
                className="p-1 hover:bg-yellow-700 rounded"
                title="Add condition"
              >
                <PlusIcon className="h-3 w-3" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-yellow-700 rounded"
                title="Edit conditions"
              >
                <PencilIcon className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-600 rounded"
                title="Delete conditions"
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
        {conditions.length > 1 && (
          <div className="text-xs text-yellow-100 mt-2 space-y-1">
            {conditions.map((condition, index) => (
              <div key={condition.id || index} className="flex items-center">
                {index > 0 && (
                  <span className="text-yellow-200 font-medium mr-1">
                    {condition.logicOperator || 'AND'}
                  </span>
                )}
                <span className="truncate">
                  {condition.field} {condition.operator} {condition.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {(!isValid || !hasValidConditions) && (
          <div className="text-xs text-yellow-200 mt-1">
            {conditions.length === 0 ? 'No conditions defined' : 'Configuration incomplete'}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-yellow-500"
      />
    </div>
  );
};

export default ConditionNode;