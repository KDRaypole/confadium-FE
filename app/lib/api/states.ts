import { api } from './client';

/**
 * Generic state transition API.
 * Uses the polymorphic state endpoint: PUT /:entity/:entity_id/state/:state_id
 *
 * @param entityType — plural entity name matching the route constraint (e.g., 'pages', 'forms', 'products', 'websites')
 * @param entityId — UUID of the entity
 * @param stateId — target state name (e.g., 'published', 'draft', 'archived', 'active')
 */
export async function transitionState(entityType: string, entityId: string, stateId: string): Promise<void> {
  await api.put(`/${entityType}/${entityId}/state/${stateId}`, {});
}
