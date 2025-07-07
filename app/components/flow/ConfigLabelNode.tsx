import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  CheckCircleIcon,
  PauseCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export interface ConfigLabelNodeData {
  label: string;
  status: string;
}

const ConfigLabelNode: React.FC<NodeProps<ConfigLabelNodeData>> = ({ data }) => {
  const { label, status } = data;

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <PauseCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'inactive':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-700';
      case 'draft':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <div className={`
      relative rounded-lg border-2 shadow-sm min-w-[200px] px-3 py-2
      ${getStatusColor()}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </span>
        </div>
        <span className={`
          text-xs px-2 py-1 rounded-full
          ${status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''}
          ${status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100' : ''}
          ${status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : ''}
        `}>
          {status}
        </span>
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

export default ConfigLabelNode;