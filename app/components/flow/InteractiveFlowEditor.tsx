import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDarkMode } from '~/contexts/DarkModeContext';

import TriggerNode, { type TriggerNodeData } from './TriggerNode';
import ConditionNode, { type ConditionNodeData } from './ConditionNode';
import ActionNode, { type ActionNodeData } from './ActionNode';

import {
  PlusIcon,
  BoltIcon,
  FunnelIcon,
  PlayIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Node type definitions
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

// Default edge style
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#64748b' },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#64748b',
    width: 20,
    height: 20,
  },
};

interface FlowConfiguration {
  trigger?: {
    entityType: string;
    action: string;
    attributeFilter?: string;
  };
  conditions: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
    logicOperator?: 'AND' | 'OR';
  }>;
  actions: Array<{
    id: string;
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
}

interface InteractiveFlowEditorProps {
  configuration: FlowConfiguration;
  onConfigurationChange: (config: FlowConfiguration) => void;
  onNodeEdit: (nodeType: 'trigger' | 'condition' | 'action', nodeId?: string) => void;
}

const InteractiveFlowEditor: React.FC<InteractiveFlowEditorProps> = ({
  configuration,
  onConfigurationChange,
  onNodeEdit
}) => {
  const { isDarkMode } = useDarkMode();
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Generate initial nodes and edges from configuration
  const generateNodesFromConfig = useCallback((): Node[] => {
    const nodes: Node[] = [];
    let xPosition = 120;
    const yPosition = 200;
    const nodeSpacing = 300;

    // Trigger node (always present, not deletable)
    nodes.push({
      id: 'trigger',
      type: 'trigger',
      position: { x: xPosition, y: yPosition },
      data: {
        label: 'Trigger',
        entityType: configuration.trigger?.entityType || '',
        action: configuration.trigger?.action || '',
        attributeFilter: configuration.trigger?.attributeFilter,
        isValid: !!(configuration.trigger?.entityType && configuration.trigger?.action),
        onEdit: () => onNodeEdit('trigger'),
        onDelete: undefined, // No delete function to prevent removal
      } as TriggerNodeData,
      deletable: false,
    });
    xPosition += nodeSpacing;

    // Conditions node (if any conditions exist)
    if (configuration.conditions.length > 0) {
      nodes.push({
        id: 'conditions',
        type: 'condition',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Conditions',
          conditions: configuration.conditions,
          isValid: configuration.conditions.length > 0,
          onEdit: () => onNodeEdit('condition'),
          onDelete: () => handleDeleteConditions(),
          onAddCondition: () => onNodeEdit('condition'),
        } as ConditionNodeData,
      });
      xPosition += nodeSpacing;
    }

    // Action nodes
    configuration.actions.forEach((action, index) => {
      const actionYOffset = configuration.actions.length > 1 
        ? (index - (configuration.actions.length - 1) / 2) * 120 
        : 0;
      
      nodes.push({
        id: `action-${action.id}`,
        type: 'action',
        position: { x: xPosition, y: yPosition + actionYOffset },
        data: {
          label: `Action ${index + 1}`,
          actionType: action.type,
          target: action.target,
          parameters: action.parameters,
          isValid: !!(action.type && action.target),
          onEdit: () => onNodeEdit('action', action.id),
          onDelete: () => handleDeleteAction(action.id),
        } as ActionNodeData,
      });
    });

    return nodes;
  }, [configuration, onNodeEdit]);

  const generateEdgesFromConfig = useCallback((): Edge[] => {
    const edges: Edge[] = [];
    let sourceId = 'trigger'; // Always start from trigger since it's always present

    // Connect trigger to conditions (if any)
    if (configuration.conditions.length > 0) {
      edges.push({
        id: `${sourceId}-conditions`,
        source: sourceId,
        target: 'conditions',
        ...defaultEdgeOptions,
      });
      sourceId = 'conditions';
    }

    // Connect to actions
    if (configuration.actions.length > 0) {
      configuration.actions.forEach((action, index) => {
        edges.push({
          id: `${sourceId}-action-${action.id}`,
          source: sourceId,
          target: `action-${action.id}`,
          ...defaultEdgeOptions,
        });

        // Connect actions in sequence (only if more than one action)
        if (configuration.actions.length > 1 && index < configuration.actions.length - 1) {
          edges.push({
            id: `action-${action.id}-action-${configuration.actions[index + 1].id}`,
            source: `action-${action.id}`,
            target: `action-${configuration.actions[index + 1].id}`,
            ...defaultEdgeOptions,
          });
        }
      });
    }

    return edges;
  }, [configuration]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodesFromConfig());
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdgesFromConfig());

  // Update nodes and edges when configuration changes
  React.useEffect(() => {
    setNodes(generateNodesFromConfig());
    setEdges(generateEdgesFromConfig());
  }, [generateNodesFromConfig, generateEdgesFromConfig, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Trigger deletion is not allowed, so this function is removed

  const handleDeleteConditions = () => {
    onConfigurationChange({
      ...configuration,
      conditions: [],
    });
  };

  const handleDeleteAction = (actionId: string) => {
    onConfigurationChange({
      ...configuration,
      actions: configuration.actions.filter(action => action.id !== actionId),
    });
  };

  const addNewNode = (nodeType: 'trigger' | 'condition' | 'action') => {
    // Prevent adding trigger nodes since there's always exactly one
    if (nodeType === 'trigger') {
      return;
    }
    onNodeEdit(nodeType);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setSelectedNodeType(nodeType);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as Element).closest('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || type === 'trigger') return; // Prevent dropping trigger nodes

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      setDragPosition(position);
      addNewNode(type as 'trigger' | 'condition' | 'action');
      setSelectedNodeType(null);
    },
    [addNewNode]
  );

  const clearFlow = () => {
    onConfigurationChange({
      trigger: { entityType: '', action: '', attributeFilter: undefined }, // Reset trigger but keep it
      conditions: [],
      actions: [],
    });
  };

  const exportFlow = () => {
    const flowData = {
      nodes: nodes,
      edges: edges,
      configuration: configuration,
    };
    
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow-configuration.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        className={isDarkMode ? 'dark' : ''}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
      >
        {/* Background */}
        <Background 
          color={isDarkMode ? "#374151" : "#e5e7eb"} 
          gap={20} 
          size={1}
          variant="dots" as const
        />

        {/* Controls */}
        <Controls 
          position="bottom-left" 
          className={isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
        />

        {/* Mini Map */}
        <MiniMap 
          position="bottom-right"
          className={isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
          maskColor={isDarkMode ? 'rgba(55, 65, 81, 0.7)' : 'rgba(229, 231, 235, 0.7)'}
        />

        {/* Node Palette */}
        <Panel position="top-left" className="space-y-2">
          <div className={`
            p-4 rounded-lg shadow-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
          `}>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Add Components
            </h3>
            <div className="space-y-2">
              {/* Trigger is always present and cannot be added manually */}

              <button
                onClick={() => addNewNode('condition')}
                onDragStart={(event) => onDragStart(event, 'condition')}
                draggable
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 rounded border transition-colors
                  ${isDarkMode 
                    ? 'border-yellow-600 bg-yellow-900 text-yellow-100 hover:bg-yellow-800' 
                    : 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                  }
                `}
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm">Condition</span>
              </button>

              <button
                onClick={() => addNewNode('action')}
                onDragStart={(event) => onDragStart(event, 'action')}
                draggable
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 rounded border transition-colors
                  ${isDarkMode 
                    ? 'border-green-600 bg-green-900 text-green-100 hover:bg-green-800' 
                    : 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'
                  }
                `}
              >
                <PlayIcon className="h-4 w-4" />
                <span className="text-sm">Action</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* Flow Controls */}
        <Panel position="top-right" className="space-y-2">
          <div className={`
            p-4 rounded-lg shadow-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
          `}>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Flow Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={exportFlow}
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 rounded border transition-colors
                  ${isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600' 
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </button>

              <button
                onClick={clearFlow}
                className={`
                  w-full flex items-center space-x-2 px-3 py-2 rounded border transition-colors
                  ${isDarkMode 
                    ? 'border-red-600 bg-red-900 text-red-100 hover:bg-red-800' 
                    : 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                  }
                `}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="text-sm">Clear</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* Flow Statistics */}
        <Panel position="bottom-center">
          <div className={`
            px-4 py-2 rounded-lg shadow-lg border flex items-center space-x-4
            ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-700'}
          `}>
            <span className="text-sm">
              <strong>1</strong> trigger
            </span>
            <span className="text-sm">
              <strong>{configuration.conditions.length}</strong> conditions
            </span>
            <span className="text-sm">
              <strong>{configuration.actions.length}</strong> actions
            </span>
            <span className="text-sm">
              <strong>{edges.length}</strong> connections
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const InteractiveFlowEditorWrapper: React.FC<InteractiveFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InteractiveFlowEditor {...props} />
    </ReactFlowProvider>
  );
};

export default InteractiveFlowEditorWrapper;