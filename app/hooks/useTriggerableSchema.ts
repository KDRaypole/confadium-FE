import { useQuery } from '@tanstack/react-query';
import { modulesAPI } from '~/lib/api/modules';
import type { TriggerableSchema, TriggerableModel, TriggerableModelTrigger, TriggerableConditionField, TriggerableActionPreset } from '~/lib/api/types';

export const TRIGGERABLE_QUERY_KEYS = {
  schema: ['triggerable', 'schema'] as const,
};

export const useTriggerableSchema = () => {
  const query = useQuery({
    queryKey: TRIGGERABLE_QUERY_KEYS.schema,
    queryFn: () => modulesAPI.getTriggerableSchema(),
    staleTime: 5 * 60 * 1000,
  });

  const schema = query.data;

  const getModel = (modelName: string): TriggerableModel | undefined => {
    return schema?.models.find(m => m.model.toLowerCase() === modelName.toLowerCase());
  };

  const getTrigger = (modelName: string, event: string): TriggerableModelTrigger | undefined => {
    const model = getModel(modelName);
    return model?.triggers.find(t => t.event === event);
  };

  const getConditionFields = (modelName: string, event: string): TriggerableConditionField[] => {
    return getTrigger(modelName, event)?.conditions || [];
  };

  const getActions = (modelName: string, event: string): TriggerableActionPreset[] => {
    return getTrigger(modelName, event)?.actions || [];
  };

  return {
    schema,
    loading: query.isLoading,
    error: query.error?.message || null,
    getModel,
    getTrigger,
    getConditionFields,
    getActions,
  };
};
