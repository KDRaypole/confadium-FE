import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { OrgNodeLevelAttributes, OrgNodeAttributes } from './types';

export type OrgNodeLevel = Resource<OrgNodeLevelAttributes>;
export type OrgNode = Resource<OrgNodeAttributes>;

// ── Level Definitions ──────────────────────────────────────

const levelsBasePath = (orgId: string) => `/organizations/${orgId}/org_node_levels`;

export const orgNodeLevelsAPI = {
  async getLevels(orgId: string, params?: QueryParams): Promise<CollectionDocument<OrgNodeLevelAttributes>> {
    return api.get<CollectionDocument<OrgNodeLevelAttributes>>(levelsBasePath(orgId), params);
  },

  async getLevelById(id: string): Promise<ResourceDocument<OrgNodeLevelAttributes>> {
    return api.get<ResourceDocument<OrgNodeLevelAttributes>>(`/org_node_levels/${id}`);
  },

  async createLevel(orgId: string, attrs: Partial<OrgNodeLevelAttributes>): Promise<ResourceDocument<OrgNodeLevelAttributes>> {
    return api.post<ResourceDocument<OrgNodeLevelAttributes>>(levelsBasePath(orgId), buildResource('org_node_level', attrs));
  },

  async updateLevel(id: string, attrs: Partial<OrgNodeLevelAttributes>): Promise<ResourceDocument<OrgNodeLevelAttributes>> {
    return api.patch<ResourceDocument<OrgNodeLevelAttributes>>(`/org_node_levels/${id}`, buildResource('org_node_level', attrs, id));
  },

  async deleteLevel(id: string): Promise<void> {
    return api.delete(`/org_node_levels/${id}`);
  },
};

// ── Org Nodes ──────────────────────────────────────────────

const nodesBasePath = (orgId: string) => `/organizations/${orgId}/org_nodes`;

export const orgNodesAPI = {
  async getNodes(orgId: string, params?: QueryParams): Promise<CollectionDocument<OrgNodeAttributes>> {
    return api.get<CollectionDocument<OrgNodeAttributes>>(nodesBasePath(orgId), params);
  },

  async getNodeById(id: string): Promise<ResourceDocument<OrgNodeAttributes>> {
    return api.get<ResourceDocument<OrgNodeAttributes>>(`/org_nodes/${id}`);
  },

  async createNode(orgId: string, attrs: Partial<OrgNodeAttributes>): Promise<ResourceDocument<OrgNodeAttributes>> {
    return api.post<ResourceDocument<OrgNodeAttributes>>(nodesBasePath(orgId), buildResource('org_node', attrs));
  },

  async updateNode(id: string, attrs: Partial<OrgNodeAttributes>): Promise<ResourceDocument<OrgNodeAttributes>> {
    return api.patch<ResourceDocument<OrgNodeAttributes>>(`/org_nodes/${id}`, buildResource('org_node', attrs, id));
  },

  async deleteNode(id: string): Promise<void> {
    return api.delete(`/org_nodes/${id}`);
  },
};
