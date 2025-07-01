import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  PlayIcon,
  StopIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action";
  name: string;
  description: string;
  x?: number;
  y?: number;
  data: any;
}

interface WorkflowLink {
  id: string;
  source: string;
  target: string;
  type: "success" | "failure" | "default";
}

interface Configuration {
  id: string;
  name: string;
  trigger: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    logicOperator?: "AND" | "OR";
  }>;
  actions: Array<{
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
  status: "active" | "inactive" | "draft";
}

interface WorkflowGraphProps {
  configurations: Configuration[];
  onConfigurationChange: (changes: any) => void;
  isDarkMode?: boolean;
}

export default function WorkflowGraph({ 
  configurations, 
  onConfigurationChange, 
  isDarkMode = false 
}: WorkflowGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [links, setLinks] = useState<WorkflowLink[]>([]);

  // Convert configurations to graph nodes and links
  const convertConfigurationsToGraph = useCallback(() => {
    const graphNodes: WorkflowNode[] = [];
    const graphLinks: WorkflowLink[] = [];

    configurations.forEach((config, configIndex) => {
      const baseY = configIndex * 200 + 100;
      
      // Create trigger node
      const triggerId = `trigger-${config.id}`;
      graphNodes.push({
        id: triggerId,
        type: "trigger",
        name: config.trigger || "New Trigger",
        description: `Starts when: ${config.trigger}`,
        x: 100,
        y: baseY,
        data: { configId: config.id, trigger: config.trigger }
      });

      let lastNodeId = triggerId;
      let currentX = 300;

      // Create condition nodes
      config.conditions.forEach((condition, index) => {
        const conditionId = `condition-${config.id}-${index}`;
        graphNodes.push({
          id: conditionId,
          type: "condition",
          name: `${condition.field} ${condition.operator}`,
          description: `${condition.field} ${condition.operator} ${condition.value}`,
          x: currentX,
          y: baseY,
          data: { configId: config.id, condition, index }
        });

        // Link from previous node to this condition
        graphLinks.push({
          id: `link-${lastNodeId}-${conditionId}`,
          source: lastNodeId,
          target: conditionId,
          type: index > 0 && condition.logicOperator === "OR" ? "failure" : "success"
        });

        lastNodeId = conditionId;
        currentX += 200;
      });

      // Create action nodes
      config.actions.forEach((action, index) => {
        const actionId = `action-${config.id}-${index}`;
        graphNodes.push({
          id: actionId,
          type: "action",
          name: action.type.replace(/_/g, " "),
          description: `${action.type} → ${action.target}`,
          x: currentX,
          y: baseY + (index * 60) - ((config.actions.length - 1) * 30),
          data: { configId: config.id, action, index }
        });

        // Link from last condition/trigger to this action
        graphLinks.push({
          id: `link-${lastNodeId}-${actionId}`,
          source: lastNodeId,
          target: actionId,
          type: "success"
        });
      });
    });

    setNodes(graphNodes);
    setLinks(graphLinks);
  }, [configurations]);

  // Initialize graph when configurations change
  useEffect(() => {
    convertConfigurationsToGraph();
  }, [convertConfigurationsToGraph]);

  // D3 visualization setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    svg.selectAll("*").remove();

    // Set up SVG dimensions
    svg.attr("width", width).attr("height", height);

    // Create main group for zooming and panning
    const g = svg.append("g").attr("class", "main-group");

    // Define arrow markers
    const defs = svg.append("defs");
    
    // Success arrow (green)
    defs.append("marker")
      .attr("id", "arrow-success")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("class", "fill-green-500");

    // Failure arrow (orange)
    defs.append("marker")
      .attr("id", "arrow-failure")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("class", "fill-orange-500");

    // Create links
    const linkSelection = g.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("class", (d: WorkflowLink) => `link link-${d.type}`)
      .attr("stroke", (d: WorkflowLink) => {
        switch (d.type) {
          case "success": return "#10B981"; // green
          case "failure": return "#F59E0B"; // orange
          default: return isDarkMode ? "#6B7280" : "#9CA3AF"; // gray
        }
      })
      .attr("stroke-width", 2)
      .attr("marker-end", (d: WorkflowLink) => `url(#arrow-${d.type})`)
      .attr("x1", (d: WorkflowLink) => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return (sourceNode?.x || 0) + 80; // Node width offset
      })
      .attr("y1", (d: WorkflowLink) => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return (sourceNode?.y || 0) + 20; // Node height center
      })
      .attr("x2", (d: WorkflowLink) => {
        const targetNode = nodes.find(n => n.id === d.target);
        return (targetNode?.x || 0) - 10; // Small gap before target
      })
      .attr("y2", (d: WorkflowLink) => {
        const targetNode = nodes.find(n => n.id === d.target);
        return (targetNode?.y || 0) + 20; // Node height center
      });

    // Create node groups
    const nodeSelection = g.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: WorkflowNode) => `translate(${d.x},${d.y})`);

    // Add rectangles for nodes
    nodeSelection.append("rect")
      .attr("width", 160)
      .attr("height", 40)
      .attr("rx", 8)
      .attr("fill", (d: WorkflowNode) => {
        const baseColor = {
          trigger: isDarkMode ? "#1E40AF" : "#3B82F6", // blue
          condition: isDarkMode ? "#7C2D12" : "#F59E0B", // orange/amber
          action: isDarkMode ? "#065F46" : "#10B981"  // green
        }[d.type];
        return baseColor;
      })
      .attr("stroke", (d: WorkflowNode) => {
        return selectedNode?.id === d.id ? "#EF4444" : "transparent";
      })
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Add node labels
    nodeSelection.append("text")
      .attr("x", 80)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d: WorkflowNode) => d.name.length > 18 ? d.name.substring(0, 15) + "..." : d.name);

    // Add node descriptions
    nodeSelection.append("text")
      .attr("x", 80)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "10px")
      .text((d: WorkflowNode) => {
        const desc = d.description.length > 20 ? d.description.substring(0, 17) + "..." : d.description;
        return desc;
      });

    // Add click handlers for nodes
    nodeSelection.on("click", function(event: any, d: WorkflowNode) {
      event.stopPropagation();
      setSelectedNode(d);
      
      // Update stroke for selection
      nodeSelection.select("rect")
        .attr("stroke", (node: WorkflowNode) => node.id === d.id ? "#EF4444" : "transparent");
    });

    // Add double-click handler for editing
    nodeSelection.on("dblclick", function(event: any, d: WorkflowNode) {
      event.stopPropagation();
      setSelectedNode(d);
      setIsEditMode(true);
    });

    // Set up zoom and pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", function(event) {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Clear selection when clicking on empty space
    svg.on("click", function() {
      setSelectedNode(null);
      nodeSelection.select("rect").attr("stroke", "transparent");
    });

    // Auto-fit view to content
    if (nodes.length > 0) {
      const bounds = {
        left: Math.min(...nodes.map(n => n.x || 0)) - 50,
        right: Math.max(...nodes.map(n => (n.x || 0) + 160)) + 50,
        top: Math.min(...nodes.map(n => n.y || 0)) - 50,
        bottom: Math.max(...nodes.map(n => (n.y || 0) + 40)) + 50
      };

      const dx = bounds.right - bounds.left;
      const dy = bounds.bottom - bounds.top;
      const x = (bounds.left + bounds.right) / 2;
      const y = (bounds.top + bounds.bottom) / 2;
      const scale = Math.min(width / dx, height / dy) * 0.8;
      
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-x, -y)
      );
    }

  }, [nodes, links, selectedNode, isDarkMode]);

  const handleNodeEdit = (nodeData: any) => {
    // Generate change event for parent component
    const change = {
      type: "node_updated",
      nodeId: selectedNode?.id,
      nodeType: selectedNode?.type,
      data: nodeData,
      timestamp: new Date().toISOString()
    };
    onConfigurationChange(change);
    setIsEditMode(false);
  };

  const handleAddNode = (type: "trigger" | "condition" | "action") => {
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      name: `New ${type}`,
      description: `Configure this ${type}`,
      x: 400,
      y: 100,
      data: {}
    };
    
    setNodes(prev => [...prev, newNode]);
    
    const change = {
      type: "node_added",
      node: newNode,
      timestamp: new Date().toISOString()
    };
    onConfigurationChange(change);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
    setLinks(prev => prev.filter(l => l.source !== selectedNode.id && l.target !== selectedNode.id));
    
    const change = {
      type: "node_deleted",
      nodeId: selectedNode.id,
      timestamp: new Date().toISOString()
    };
    onConfigurationChange(change);
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-1">
          <button
            onClick={() => handleAddNode("trigger")}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
            title="Add Trigger"
          >
            <PlayIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAddNode("condition")}
            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 rounded"
            title="Add Condition"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAddNode("action")}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
            title="Add Action"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        
        {selectedNode && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-1">
            <button
              onClick={() => setIsEditMode(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Edit Node"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteNode}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
              title="Delete Node"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Trigger</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Condition</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main SVG Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <StopIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Workflow</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create configurations to see the workflow visualization
            </p>
          </div>
        </div>
      )}

      {/* Selected Node Info */}
      {selectedNode && !isEditMode && (
        <div className="absolute bottom-2 left-2 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {selectedNode.name}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {selectedNode.description}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Type: {selectedNode.type} | ID: {selectedNode.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {isEditMode && selectedNode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Edit {selectedNode.type}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedNode.name}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue={selectedNode.description}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleNodeEdit({})}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}