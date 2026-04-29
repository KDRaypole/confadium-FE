import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useParams, useSearchParams } from '@remix-run/react';
import { useOrgNodes, useOrgNodeLevels, buildTree, type OrgNode, type OrgNodeTree } from '~/hooks/useOrgNodes';
import type { OrgNodeLevelAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';

interface NodeContextValue {
  /** Currently active node ID from URL, or null for org-level */
  activeNodeId: string | null;
  /** The active node object */
  activeNode: OrgNode | null;
  /** Ancestor chain from root to active node */
  ancestorChain: OrgNode[];
  /** Direct children of the active node */
  childNodes: OrgNode[];
  /** The next level definition (for children of active node) */
  childLevel: Resource<OrgNodeLevelAttributes> | null;
  /** The active node's level definition */
  activeLevel: Resource<OrgNodeLevelAttributes> | null;
  /** Level definitions for this org */
  levels: Resource<OrgNodeLevelAttributes>[];
  /** Flat list of all nodes */
  nodes: OrgNode[];
  /** Nested tree structure */
  tree: OrgNodeTree[];
  /** Whether nodes/levels are loading */
  loading: boolean;
  /** Whether the org has any level definitions configured */
  hasStructure: boolean;
  /** Build a path scoped to the current node context */
  buildNodePath: (subpath: string) => string;
  /** Get the back navigation target */
  backPath: string;
  /** Label for the back button */
  backLabel: string;
}

const NodeContext = createContext<NodeContextValue | undefined>(undefined);

interface NodeProviderProps {
  children: ReactNode;
}

export function NodeProvider({ children }: NodeProviderProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const orgId = params.orgId || '';
  // Node ID comes from URL path param (node-specific pages) or query param (CRM pages)
  const nodeId = params.nodeId || searchParams.get('node') || null;

  const { nodes, loading: nodesLoading } = useOrgNodes();
  const { levels, loading: levelsLoading } = useOrgNodeLevels();

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  const activeNode = useMemo(
    () => (nodeId ? nodes.find(n => n.id === nodeId) || null : null),
    [nodes, nodeId]
  );

  const ancestorChain = useMemo(() => {
    if (!activeNode) return [];
    const ids = activeNode.attributes.path.split('/').filter(Boolean);
    return ids
      .map(id => nodes.find(n => n.id === id))
      .filter((n): n is OrgNode => !!n)
      .sort((a, b) => a.attributes.depth - b.attributes.depth);
  }, [activeNode, nodes]);

  const childNodes = useMemo(() => {
    if (!nodeId) {
      // At org level, children are root nodes (depth 0)
      return nodes
        .filter(n => n.attributes.depth === 0)
        .sort((a, b) => a.attributes.position - b.attributes.position);
    }
    return nodes
      .filter(n => {
        const pathParts = n.attributes.path.split('/').filter(Boolean);
        return pathParts[pathParts.length - 2] === nodeId && n.id !== nodeId;
      })
      .sort((a, b) => a.attributes.position - b.attributes.position);
  }, [nodes, nodeId]);

  const activeLevel = useMemo(() => {
    if (!activeNode) return null;
    return levels.find(l => l.attributes.depth === activeNode.attributes.depth) || null;
  }, [activeNode, levels]);

  const childLevel = useMemo(() => {
    const childDepth = activeNode ? activeNode.attributes.depth + 1 : 0;
    return levels.find(l => l.attributes.depth === childDepth) || null;
  }, [activeNode, levels]);

  const buildNodePath = (subpath: string) => {
    if (nodeId) {
      return `/organizations/${orgId}/nodes/${nodeId}/${subpath}`;
    }
    return `/organizations/${orgId}/${subpath}`;
  };

  const backPath = useMemo(() => {
    if (!activeNode) return `/organizations`;
    // Go to parent node, or org level if this is a root node
    const parentId = ancestorChain.length > 1
      ? ancestorChain[ancestorChain.length - 2]?.id
      : null;
    if (parentId) {
      return `/organizations/${orgId}/nodes/${parentId}`;
    }
    return `/organizations/${orgId}`;
  }, [activeNode, ancestorChain, orgId]);

  const backLabel = useMemo(() => {
    if (!activeNode) return 'Organizations';
    if (ancestorChain.length > 1) {
      return ancestorChain[ancestorChain.length - 2]?.attributes.name || 'Back';
    }
    return orgId;
  }, [activeNode, ancestorChain, orgId]);

  const value: NodeContextValue = {
    activeNodeId: nodeId,
    activeNode,
    ancestorChain,
    childNodes,
    childLevel,
    activeLevel,
    levels,
    nodes,
    tree,
    loading: nodesLoading || levelsLoading,
    hasStructure: levels.length > 0,
    buildNodePath,
    backPath,
    backLabel,
  };

  return <NodeContext.Provider value={value}>{children}</NodeContext.Provider>;
}

export function useNodeContext() {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error('useNodeContext must be used within a NodeProvider');
  }
  return context;
}

/**
 * Safe version that returns null when outside a NodeProvider.
 */
export function useOptionalNodeContext() {
  return useContext(NodeContext) ?? null;
}
