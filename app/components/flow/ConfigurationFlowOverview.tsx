import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  NodeTypes,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDarkMode } from '~/contexts/DarkModeContext';

import TriggerNode, { type TriggerNodeData } from './TriggerNode';
import ConditionNode, { type ConditionNodeData } from './ConditionNode';
import ActionNode, { type ActionNodeData } from './ActionNode';

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

interface ConfigurationFlowOverviewProps {
  configuration: FlowConfiguration;
  height?: string;
  showControls?: boolean;
  showBackground?: boolean;
  className?: string;
}

const ConfigurationFlowOverview: React.FC<ConfigurationFlowOverviewProps> = ({
  configuration,
  height = '300px',
  showControls = false,
  showBackground = true,
  className = ''
}) => {
  const { isDarkMode } = useDarkMode();
  // Generate nodes from configuration
  const nodes = useMemo((): Node[] => {
    const nodeList: Node[] = [];
    let xPosition = 80;
    const yPosition = 150;
    const nodeSpacing = 280;

    // Trigger node
    if (configuration.trigger) {
      nodeList.push({
        id: 'trigger',
        type: 'trigger',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Trigger',
          entityType: configuration.trigger.entityType,
          action: configuration.trigger.action,
          attributeFilter: configuration.trigger.attributeFilter,
          isValid: !!(configuration.trigger.entityType && configuration.trigger.action),
          onEdit: undefined, // No editing in overview
          onDelete: undefined,
        } as TriggerNodeData,
      });
      xPosition += nodeSpacing;
    }

    // Conditions node (if any conditions exist)
    if (configuration.conditions.length > 0) {
      nodeList.push({
        id: 'conditions',
        type: 'condition',
        position: { x: xPosition, y: yPosition },
        data: {
          label: 'Conditions',
          conditions: configuration.conditions,
          isValid: configuration.conditions.length > 0,
          onEdit: undefined, // No editing in overview
          onDelete: undefined,
          onAddCondition: undefined,
        } as ConditionNodeData,
      });
      xPosition += nodeSpacing;
    }

    // Action nodes
    configuration.actions.forEach((action, index) => {
      const actionYOffset = configuration.actions.length > 1 
        ? (index - (configuration.actions.length - 1) / 2) * 120 
        : 0;
      
      nodeList.push({
        id: `action-${action.id}`,
        type: 'action',
        position: { x: xPosition, y: yPosition + actionYOffset },
        data: {
          label: `Action ${index + 1}`,
          actionType: action.type,
          target: action.target,
          parameters: action.parameters,
          isValid: !!(action.type && action.target),
          onEdit: undefined, // No editing in overview
          onDelete: undefined,
        } as ActionNodeData,
      });
    });

    return nodeList;
  }, [configuration]);

  // Generate edges from configuration
  const edges = useMemo((): Edge[] => {
    const edgeList: Edge[] = [];
    let sourceId: string | null = null;

    // Set initial source based on what exists
    if (configuration.trigger) {
      sourceId = 'trigger';
    } else if (configuration.conditions.length > 0) {
      sourceId = 'conditions';
    } else if (configuration.actions.length > 0) {
      // If only actions exist, no edges needed
      return edgeList;
    }

    // Connect trigger to conditions (if both exist)
    if (configuration.trigger && configuration.conditions.length > 0) {
      edgeList.push({
        id: `${sourceId}-conditions`,
        source: sourceId!,
        target: 'conditions',
        ...defaultEdgeOptions,
      });
      sourceId = 'conditions';
    }

    // Connect to actions (only if there's a source to connect from)
    if (configuration.actions.length > 0 && sourceId) {
      configuration.actions.forEach((action, index) => {
        // Connect from previous node to first action, or between actions
        if (index === 0) {
          edgeList.push({
            id: `${sourceId}-action-${action.id}`,
            source: sourceId!,
            target: `action-${action.id}`,
            ...defaultEdgeOptions,
          });
        }

        // Connect actions in sequence (only if more than one action)
        if (configuration.actions.length > 1 && index < configuration.actions.length - 1) {
          edgeList.push({
            id: `action-${action.id}-action-${configuration.actions[index + 1].id}`,
            source: `action-${action.id}`,
            target: `action-${configuration.actions[index + 1].id}`,
            ...defaultEdgeOptions,
          });
        }
      });
    }

    return edgeList;
  }, [configuration]);

  // Empty configuration fallback
  if (!configuration.trigger && configuration.conditions.length === 0 && configuration.actions.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Workflow</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This configuration has no workflow components defined.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        className={isDarkMode ? 'dark' : ''}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.8, maxZoom: 1.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        panOnScroll={true}
        selectNodesOnDrag={false}
        minZoom={0.5}
        maxZoom={2}
      >
        {showBackground && (
          <Background 
            color={isDarkMode ? "#374151" : "#e5e7eb"} 
            gap={20} 
            size={1}
            variant="dots"
          />
        )}

        {showControls && (
          <Controls 
            position="bottom-left" 
            className={isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        )}
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const ConfigurationFlowOverviewWrapper: React.FC<ConfigurationFlowOverviewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ConfigurationFlowOverview {...props} />
    </ReactFlowProvider>
  );
};

export default ConfigurationFlowOverviewWrapper;