import { api, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { EventLogAttributes } from './types';

export type EventLog = Resource<EventLogAttributes>;

export const eventLogsAPI = {
  /**
   * Get event logs for a specific entity (contact, deal, activity)
   */
  async getForEntity(
    entityType: 'contacts' | 'deals' | 'activities',
    entityId: string,
    params?: QueryParams
  ): Promise<CollectionDocument<EventLogAttributes>> {
    return api.get<CollectionDocument<EventLogAttributes>>(
      `/${entityType}/${entityId}/event_logs`,
      { include: 'module_configuration,automation_module', ...params }
    );
  },

  /**
   * Get a single event log by ID
   */
  async getById(id: string): Promise<ResourceDocument<EventLogAttributes>> {
    return api.get<ResourceDocument<EventLogAttributes>>(
      `/event_logs/${id}`,
      { include: 'module_configuration,automation_module' }
    );
  },

  /**
   * Get related event logs from the same workflow execution
   */
  async getRelated(id: string): Promise<CollectionDocument<EventLogAttributes>> {
    return api.get<CollectionDocument<EventLogAttributes>>(`/event_logs/${id}/related`);
  },
};
