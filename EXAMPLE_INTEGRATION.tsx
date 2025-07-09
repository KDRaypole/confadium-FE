// Example of how to properly integrate the ConditionConfigModal and ActionConfigModal
// with trigger information to enable form field conditions

import React, { useState } from 'react';
import ConditionConfigModal, { type Condition } from '~/components/flow/modals/ConditionConfigModal';
import ActionConfigModal, { type ActionConfig } from '~/components/flow/modals/ActionConfigModal';
import TriggerConfigModal, { type TriggerConfig } from '~/components/flow/modals/TriggerConfigModal';

interface Configuration {
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: ActionConfig[];
}

const ModuleConfigurationExample: React.FC = () => {
  // Modal states
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // Configuration state
  const [configuration, setConfiguration] = useState<Configuration>({
    trigger: { entityType: '', action: '' },
    conditions: [],
    actions: []
  });

  // Handlers
  const handleTriggerSave = (trigger: TriggerConfig) => {
    setConfiguration(prev => ({ ...prev, trigger }));
  };

  const handleConditionsSave = (conditions: Condition[]) => {
    setConfiguration(prev => ({ ...prev, conditions }));
  };

  const handleActionSave = (action: ActionConfig) => {
    setConfiguration(prev => ({
      ...prev,
      actions: [...prev.actions, action]
    }));
  };

  return (
    <div>
      {/* Trigger Configuration Button */}
      <button onClick={() => setTriggerModalOpen(true)}>
        Configure Trigger
      </button>

      {/* Conditions Configuration Button */}
      <button onClick={() => setConditionModalOpen(true)}>
        Configure Conditions
      </button>

      {/* Actions Configuration Button */}
      <button onClick={() => setActionModalOpen(true)}>
        Configure Actions
      </button>

      {/* Trigger Modal */}
      <TriggerConfigModal
        isOpen={triggerModalOpen}
        trigger={configuration.trigger}
        onSave={handleTriggerSave}
        onClose={() => setTriggerModalOpen(false)}
      />

      {/* Condition Modal - IMPORTANT: Pass trigger prop! */}
      <ConditionConfigModal
        isOpen={conditionModalOpen}
        conditions={configuration.conditions}
        trigger={configuration.trigger}  // <- This is crucial for form field loading
        onSave={handleConditionsSave}
        onClose={() => setConditionModalOpen(false)}
      />

      {/* Action Modal - IMPORTANT: Pass trigger prop! */}
      <ActionConfigModal
        isOpen={actionModalOpen}
        entityType={configuration.trigger.entityType}
        trigger={configuration.trigger}  // <- This is crucial for form field mapping
        onSave={handleActionSave}
        onClose={() => setActionModalOpen(false)}
      />
    </div>
  );
};

export default ModuleConfigurationExample;

/*
EXPLANATION:

1. The key fix is passing the `trigger` prop to both ConditionConfigModal and ActionConfigModal
2. When trigger.entityType === 'form' and trigger.formId is set, the modals will:
   - Load the form fields via formsApi.getById(trigger.formId)
   - Add form fields as condition options with format "form.fields.{fieldId}"
   - Show field mapping interface for entity creation actions

3. User Flow:
   a. User configures trigger (Form > Submitted > Select Form)
   b. User opens conditions modal -> sees form fields as options
   c. User can create conditions like "Email Address (Form Field) contains '@company.com'"
   d. User opens actions modal -> can create entities with field mapping

4. Form fields will appear with labels like:
   - "Full Name (Form Field)"
   - "Email Address (Form Field)" 
   - "Company Name (Form Field)"
   etc.

The ConditionConfigModal and ActionConfigModal already have all the necessary functionality
implemented - they just need to receive the trigger information!
*/