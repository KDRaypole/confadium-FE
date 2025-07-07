import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

export interface StartNodeData {
  label: string;
}

const StartNode: React.FC<NodeProps<StartNodeData>> = ({ data }) => {
  return (
    <div className="relative bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center border-2 border-gray-600">
      <PlayCircleIcon className="h-8 w-8" />
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 border-gray-700"
      />
      
      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        Start
      </div>
    </div>
  );
};

export default StartNode;