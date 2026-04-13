import { FormField, ConditionalAction } from './api/forms';

export interface FormState {
  values: Record<string, any>;
  hiddenFields: Set<string>;
  modifiedOptions: Record<string, string[]>; // fieldId -> current options
  formEnded: boolean;
  endMessage?: string;
  endTitle?: string;
}

export interface ConditionalResult {
  visibleFields: FormField[];
  modifiedFields: FormField[];
  formEnded: boolean;
  endMessage?: string;
  endTitle?: string;
}

/**
 * Evaluates all conditional actions based on current form values
 */
export function evaluateConditionalLogic(
  fields: FormField[],
  formValues: Record<string, any>
): ConditionalResult {
  const state: FormState = {
    values: formValues,
    hiddenFields: new Set(),
    modifiedOptions: {},
    formEnded: false
  };

  // Initialize modified options with original field options
  fields.forEach(field => {
    if (Array.isArray(field.options)) {
      state.modifiedOptions[field.id] = [...field.options];
    }
  });

  // Process all conditional actions
  for (const field of fields) {
    if (field.conditionalActions && formValues[field.id] !== undefined) {
      const fieldValue = formValues[field.id];
      
      for (const action of field.conditionalActions) {
        if (shouldTriggerAction(action, fieldValue)) {
          applyConditionalAction(action, state, fields);
          
          // If form ended, stop processing
          if (state.formEnded) {
            break;
          }
        }
      }
      
      if (state.formEnded) break;
    }
  }

  // Create modified fields with updated options and visibility
  const modifiedFields = fields.map(field => {
    const isHidden = state.hiddenFields.has(field.id);
    const hasModifiedOptions = state.modifiedOptions[field.id];
    
    if (isHidden || hasModifiedOptions) {
      return {
        ...field,
        options: hasModifiedOptions || (Array.isArray(field.options) ? field.options : []),
        // Mark hidden fields (they won't be rendered but structure is preserved)
        _hidden: isHidden
      } as FormField & { _hidden?: boolean };
    }
    
    return field;
  });

  // Filter visible fields
  const visibleFields = modifiedFields.filter(field => 
    !(field as any)._hidden
  );

  return {
    visibleFields,
    modifiedFields,
    formEnded: state.formEnded,
    endMessage: state.endMessage,
    endTitle: state.endTitle
  };
}

/**
 * Checks if an action should be triggered based on the field value
 */
function shouldTriggerAction(action: ConditionalAction, fieldValue: any): boolean {
  const triggerValue = action.triggerValue;
  
  // Handle different field types
  if (Array.isArray(fieldValue)) {
    // For multi-select fields (checkboxes)
    return fieldValue.includes(triggerValue);
  }
  
  if (typeof fieldValue === 'boolean') {
    // For checkbox fields
    return fieldValue.toString() === triggerValue;
  }
  
  // For most field types, direct comparison
  return String(fieldValue) === String(triggerValue);
}

/**
 * Applies a conditional action to the form state
 */
function applyConditionalAction(
  action: ConditionalAction,
  state: FormState,
  fields: FormField[]
): void {
  switch (action.type) {
    case 'hide_question':
      if (action.targetFieldId) {
        state.hiddenFields.add(action.targetFieldId);
      }
      break;
      
    case 'show_question':
      if (action.targetFieldId) {
        state.hiddenFields.delete(action.targetFieldId);
      }
      break;
      
    case 'remove_options':
      if (action.targetFieldId && action.options) {
        const currentOptions = state.modifiedOptions[action.targetFieldId] || [];
        state.modifiedOptions[action.targetFieldId] = currentOptions.filter(
          option => !action.options!.includes(option)
        );
      }
      break;
      
    case 'add_options':
      if (action.targetFieldId && action.options) {
        const currentOptions = state.modifiedOptions[action.targetFieldId] || [];
        const newOptions = [...currentOptions];
        
        action.options.forEach(option => {
          if (!newOptions.includes(option)) {
            newOptions.push(option);
          }
        });
        
        state.modifiedOptions[action.targetFieldId] = newOptions;
      }
      break;
      
    case 'enable_options':
      if (action.targetFieldId && action.options) {
        // Find the original field to get base options
        const originalField = fields.find(f => f.id === action.targetFieldId);
        if (originalField?.options) {
          // Reset to original options and add the enabled ones
          const baseOptions = [...originalField.options];
          const enabledOptions = action.options.filter(option => 
            !baseOptions.includes(option)
          );
          state.modifiedOptions[action.targetFieldId] = [...baseOptions, ...enabledOptions];
        }
      }
      break;
      
    case 'end_form':
      state.formEnded = true;
      state.endMessage = action.endMessage || 'The questionnaire has ended.';
      state.endTitle = action.endTitle || 'Form Complete';
      break;
  }
}

/**
 * Gets the next field in a conditional form
 */
export function getNextConditionalField(
  currentFieldId: string,
  fields: FormField[],
  formValues: Record<string, any>
): FormField | null {
  const result = evaluateConditionalLogic(fields, formValues);
  
  if (result.formEnded) {
    return null;
  }
  
  const currentIndex = result.visibleFields.findIndex(f => f.id === currentFieldId);
  if (currentIndex >= 0 && currentIndex < result.visibleFields.length - 1) {
    return result.visibleFields[currentIndex + 1];
  }
  
  return null;
}

/**
 * Gets the previous field in a conditional form
 */
export function getPreviousConditionalField(
  currentFieldId: string,
  fields: FormField[],
  formValues: Record<string, any>
): FormField | null {
  const result = evaluateConditionalLogic(fields, formValues);
  const currentIndex = result.visibleFields.findIndex(f => f.id === currentFieldId);
  
  if (currentIndex > 0) {
    return result.visibleFields[currentIndex - 1];
  }
  
  return null;
}

/**
 * Checks if the form should end after the current field
 */
export function shouldEndForm(
  fields: FormField[],
  formValues: Record<string, any>
): { shouldEnd: boolean; endMessage?: string; endTitle?: string } {
  const result = evaluateConditionalLogic(fields, formValues);
  
  return {
    shouldEnd: result.formEnded,
    endMessage: result.endMessage,
    endTitle: result.endTitle
  };
}