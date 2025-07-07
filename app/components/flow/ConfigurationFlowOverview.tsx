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
import ConfigLabelNode, { type ConfigLabelNodeData } from './ConfigLabelNode';

// Node type definitions
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  configLabel: ConfigLabelNode,
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
  allConfigurations?: Array<{
    id?: string;
    name: string;
    status: string;
    trigger: {
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
  }>;
  height?: string;
  showControls?: boolean;
  showBackground?: boolean;
  className?: string;
}

const ConfigurationFlowOverview: React.FC<ConfigurationFlowOverviewProps> = ({
  configuration,
  allConfigurations,
  height = '300px',
  showControls = false,
  showBackground = true,
  className = ''
}) => {
  const { isDarkMode } = useDarkMode();
  // Generate nodes from configuration(s)
  const nodes = useMemo((): Node[] => {
    const nodeList: Node[] = [];
    
    // If we have multiple configurations, show them all together
    if (allConfigurations && allConfigurations.length > 0) {
      let currentY = 100;
      const configSpacing = 300; // Vertical spacing between configurations
      const nodeSpacing = 280; // Horizontal spacing between nodes in same config
      
      allConfigurations.forEach((config, configIndex) => {
        let xPosition = 80;
        const yPosition = currentY;
        
        // Add config label node
        nodeList.push({
          id: `config-label-${configIndex}`,
          type: 'configLabel',
          position: { x: xPosition - 50, y: yPosition - 30 },
          data: {
            label: config.name,
            status: config.status,
          } as ConfigLabelNodeData,
          selectable: false,
        });
        
        // Trigger node
        nodeList.push({
          id: `trigger-${configIndex}`,
          type: 'trigger',
          position: { x: xPosition, y: yPosition },
          data: {
            label: 'Trigger',
            entityType: config.trigger.entityType,
            action: config.trigger.action,
            attributeFilter: config.trigger.attributeFilter,
            isValid: !!(config.trigger.entityType && config.trigger.action),
            onEdit: undefined,
            onDelete: undefined,
          } as TriggerNodeData,
        });
        xPosition += nodeSpacing;

        // Conditions node
        if (config.conditions.length > 0) {
          nodeList.push({
            id: `conditions-${configIndex}`,
            type: 'condition',
            position: { x: xPosition, y: yPosition },
            data: {
              label: 'Conditions',
              conditions: config.conditions,
              isValid: config.conditions.length > 0,
              onEdit: undefined,
              onDelete: undefined,
              onAddCondition: undefined,
            } as ConditionNodeData,
          });
          xPosition += nodeSpacing;
        }

        // Action nodes
        config.actions.forEach((action, actionIndex) => {
          const actionYOffset = config.actions.length > 1 
            ? (actionIndex - (config.actions.length - 1) / 2) * 120 
            : 0;
          
          nodeList.push({
            id: `action-${configIndex}-${action.id}`,
            type: 'action',
            position: { x: xPosition, y: yPosition + actionYOffset },
            data: {
              label: `Action ${actionIndex + 1}`,
              actionType: action.type,
              target: action.target,
              parameters: action.parameters,
              isValid: !!(action.type && action.target),
              onEdit: undefined,
              onDelete: undefined,
            } as ActionNodeData,
          });
        });
        
        currentY += configSpacing;
      });
    } else {
      // Single configuration display (original logic)
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
            onEdit: undefined,
            onDelete: undefined,
          } as TriggerNodeData,
        });
        xPosition += nodeSpacing;
      }

      // Conditions node
      if (configuration.conditions.length > 0) {
        nodeList.push({
          id: 'conditions',
          type: 'condition',
          position: { x: xPosition, y: yPosition },
          data: {
            label: 'Conditions',
            conditions: configuration.conditions,
            isValid: configuration.conditions.length > 0,
            onEdit: undefined,
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
            onEdit: undefined,
            onDelete: undefined,
          } as ActionNodeData,
        });
      });
    }

    return nodeList;
  }, [configuration, allConfigurations]);

  // Generate edges from configuration(s)
  const edges = useMemo((): Edge[] => {
    const edgeList: Edge[] = [];

    // If we have multiple configurations, create edges for each
    if (allConfigurations && allConfigurations.length > 0) {
      allConfigurations.forEach((config, configIndex) => {
        // Connect config label to trigger
        edgeList.push({
          id: `config-label-${configIndex}-trigger-${configIndex}`,
          source: `config-label-${configIndex}`,
          target: `trigger-${configIndex}`,
          ...defaultEdgeOptions,
          style: { strokeWidth: 2, stroke: '#94a3b8', strokeDasharray: '5,5' }, // Dashed style for label connections
        });

        let sourceId = `trigger-${configIndex}`;

        // Connect trigger to conditions
        if (config.conditions.length > 0) {
          edgeList.push({
            id: `${sourceId}-conditions-${configIndex}`,
            source: sourceId,
            target: `conditions-${configIndex}`,
            ...defaultEdgeOptions,
          });
          sourceId = `conditions-${configIndex}`;
        }

        // Connect to actions
        if (config.actions.length > 0) {
          config.actions.forEach((action, actionIndex) => {
            // Connect from previous node to first action
            if (actionIndex === 0) {
              edgeList.push({
                id: `${sourceId}-action-${configIndex}-${action.id}`,
                source: sourceId,
                target: `action-${configIndex}-${action.id}`,
                ...defaultEdgeOptions,
              });
            }

            // Connect actions in sequence
            if (config.actions.length > 1 && actionIndex < config.actions.length - 1) {
              edgeList.push({
                id: `action-${configIndex}-${action.id}-action-${configIndex}-${config.actions[actionIndex + 1].id}`,
                source: `action-${configIndex}-${action.id}`,
                target: `action-${configIndex}-${config.actions[actionIndex + 1].id}`,
                ...defaultEdgeOptions,
              });
            }
          });
        }
      });
    } else {
      // Single configuration logic (original)
      let sourceId: string | null = null;

      if (configuration.trigger) {
        sourceId = 'trigger';
      } else if (configuration.conditions.length > 0) {
        sourceId = 'conditions';
      } else if (configuration.actions.length > 0) {
        return edgeList;
      }

      // Connect trigger to conditions
      if (configuration.trigger && configuration.conditions.length > 0) {
        edgeList.push({
          id: `${sourceId}-conditions`,
          source: sourceId!,
          target: 'conditions',
          ...defaultEdgeOptions,
        });
        sourceId = 'conditions';
      }

      // Connect to actions
      if (configuration.actions.length > 0 && sourceId) {
        configuration.actions.forEach((action, index) => {
          if (index === 0) {
            edgeList.push({
              id: `${sourceId}-action-${action.id}`,
              source: sourceId!,
              target: `action-${action.id}`,
              ...defaultEdgeOptions,
            });
          }

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
    }

    return edgeList;
  }, [configuration, allConfigurations]);

  // Empty configuration fallback
  if ((!allConfigurations || allConfigurations.length === 0) && !configuration.trigger && configuration.conditions.length === 0 && configuration.actions.length === 0) {
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Configurations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No automation workflows have been created yet.
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