import { useOptionalNodeContext } from '~/contexts/NodeContext';

/**
 * Returns filter params that include the active node ID from context (URL-driven).
 * Merge these into your API query params to automatically scope by the active node.
 */
export function useNodeFilter(): Record<string, string> {
  const ctx = useOptionalNodeContext();
  if (!ctx?.activeNodeId) return {};

  return { org_node_id: ctx.activeNodeId };
}

/**
 * Returns the active node ID for use in query cache keys.
 * This ensures queries are invalidated when navigating between nodes.
 */
export function useNodeCacheKey(): string | null {
  const ctx = useOptionalNodeContext();
  return ctx?.activeNodeId ?? null;
}

/**
 * Returns { org_node_id } to merge into create/update attrs so new records
 * are automatically assigned to the active node.
 */
export function useNodeAttrs(): Record<string, string> {
  const ctx = useOptionalNodeContext();
  if (!ctx?.activeNodeId) return {};

  return { org_node_id: ctx.activeNodeId };
}
