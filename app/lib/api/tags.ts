import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { TagAttributes } from './types';

export type Tag = Resource<TagAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/tags`;

export const tagsAPI = {
  async getTags(orgId: string, params?: QueryParams): Promise<CollectionDocument<TagAttributes>> {
    return api.get<CollectionDocument<TagAttributes>>(basePath(orgId), params);
  },

  async getTagById(id: string): Promise<ResourceDocument<TagAttributes>> {
    return api.get<ResourceDocument<TagAttributes>>(`/tags/${id}`);
  },

  async createTag(orgId: string, attrs: Partial<TagAttributes>): Promise<ResourceDocument<TagAttributes>> {
    return api.post<ResourceDocument<TagAttributes>>(basePath(orgId), buildResource('tag', attrs));
  },

  async updateTag(id: string, attrs: Partial<TagAttributes>): Promise<ResourceDocument<TagAttributes>> {
    return api.patch<ResourceDocument<TagAttributes>>(`/tags/${id}`, buildResource('tag', attrs, id));
  },

  async deleteTag(id: string): Promise<void> {
    return api.delete(`/tags/${id}`);
  },

  async searchTags(orgId: string, query: string): Promise<CollectionDocument<TagAttributes>> {
    return api.get<CollectionDocument<TagAttributes>>(basePath(orgId), { search: query });
  },

  async addTagging(entityType: string, entityId: string, tagId: string): Promise<void> {
    await api.post(`/${entityType}/${entityId}/taggings`, buildResource('tagging', { tag_id: tagId }));
  },

  async removeTagging(taggingId: string): Promise<void> {
    return api.delete(`/taggings/${taggingId}`);
  },
};
