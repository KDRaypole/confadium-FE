import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { orgNodeLevelsAPI, orgNodesAPI, type OrgNodeLevel, type OrgNode } from '~/lib/api/orgNodes';
import type { OrgNodeLevelAttributes, OrgNodeAttributes } from '~/lib/api/types';

export type { OrgNodeLevel, OrgNode };

export const ORG_NODES_QUERY_KEYS = {
  all: ['org-nodes'] as const,
  levels: (orgId: string) => [...ORG_NODES_QUERY_KEYS.all, 'levels', orgId] as const,
  nodes: (orgId: string) => [...ORG_NODES_QUERY_KEYS.all, 'nodes', orgId] as const,
  detail: (id: string) => [...ORG_NODES_QUERY_KEYS.all, 'detail', id] as const,
};

// ── Levels ─────────────────────────────────────────────────

export const useOrgNodeLevels = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ORG_NODES_QUERY_KEYS.levels(orgId),
    queryFn: () => orgNodeLevelsAPI.getLevels(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ORG_NODES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<OrgNodeLevelAttributes>) => orgNodeLevelsAPI.createLevel(orgId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<OrgNodeLevelAttributes> }) =>
      orgNodeLevelsAPI.updateLevel(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgNodeLevelsAPI.deleteLevel(id),
    onSuccess: invalidate,
  });

  return {
    levels: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createLevel: createMutation.mutateAsync,
    updateLevel: updateMutation.mutateAsync,
    deleteLevel: deleteMutation.mutateAsync,
  };
};

// ── Nodes ──────────────────────────────────────────────────

export const useOrgNodes = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ORG_NODES_QUERY_KEYS.nodes(orgId),
    queryFn: () => orgNodesAPI.getNodes(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ORG_NODES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<OrgNodeAttributes>) => orgNodesAPI.createNode(orgId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<OrgNodeAttributes> }) =>
      orgNodesAPI.updateNode(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orgNodesAPI.deleteNode(id),
    onSuccess: invalidate,
  });

  return {
    nodes: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createNode: createMutation.mutateAsync,
    updateNode: updateMutation.mutateAsync,
    deleteNode: deleteMutation.mutateAsync,
  };
};

// ── Tree helpers ───────────────────────────────────────────

export interface OrgNodeTree extends OrgNode {
  children: OrgNodeTree[];
}

export function buildTree(nodes: OrgNode[]): OrgNodeTree[] {
  const map = new Map<string, OrgNodeTree>();
  const roots: OrgNodeTree[] = [];

  // Create tree nodes
  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  // Wire parent-child relationships
  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    const parentId = node.attributes.path.split('/').slice(-2, -1)[0];

    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  // Sort children by position
  const sortChildren = (nodes: OrgNodeTree[]) => {
    nodes.sort((a, b) => a.attributes.position - b.attributes.position);
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}
