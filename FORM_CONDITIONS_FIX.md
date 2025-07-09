# Fix for Form Fields Not Appearing in Conditions

## Problem
When users select a form.submitted trigger, the form fields are not appearing as available condition options in the ConditionConfigModal.

## Root Cause
The ConditionConfigModal has been properly modified to accept and use trigger information to load form fields dynamically, but the parent component is not passing the trigger information to the modal.

## Solution
The parent component that manages the ConditionConfigModal needs to pass the current trigger configuration.

### Required Change
Wherever ConditionConfigModal is used, it needs to receive the trigger prop:

```tsx
<ConditionConfigModal
  isOpen={conditionModalOpen}
  conditions={configuration.conditions}
  trigger={configuration.trigger}  // <- This line is missing!
  onSave={handleConditionsSave}
  onClose={() => setConditionModalOpen(false)}
/>
```

### How It Works
1. User selects Form as entity type in trigger configuration
2. User selects "Submitted" as action
3. User selects specific form (e.g., "Contact Form")
4. When user opens ConditionConfigModal, it receives the trigger prop
5. Modal detects `trigger.entityType === 'form'` and `trigger.formId`
6. Modal calls `formsApi.getById(trigger.formId)` to load form details
7. Form fields are added to condition options with format `form.fields.{fieldId}`

### Example Result
After the fix, users will see condition options like:
- **CRM Fields**: Contact Name, Contact Email, Deal Stage, etc.
- **Form Fields**: Full Name (Form Field), Email Address (Form Field), etc.

### Implementation Details
The ConditionConfigModal already has this functionality implemented:

1. **Form Field Loading** (lines 108-131):
```tsx
useEffect(() => {
  const loadFormFields = async () => {
    if (trigger?.entityType === 'form' && trigger.formId) {
      setLoadingFormFields(true);
      try {
        const form = await formsApi.getById(trigger.formId);
        if (form) {
          setFormFields(form.fields);
        }
      } catch (error) {
        console.error('Error loading form fields:', error);
        setFormFields([]);
      } finally {
        setLoadingFormFields(false);
      }
    } else {
      setFormFields([]);
    }
  };

  if (isOpen) {
    loadFormFields();
  }
}, [trigger, isOpen]);
```

2. **Form Field Integration** (lines 161-174):
```tsx
const getFormFieldOptions = () => {
  if (!formFields.length) return [];
  
  return formFields.map(field => ({
    value: `form.fields.${field.id}`,
    label: `${field.label} (Form Field)`,
    type: mapFormFieldTypeToConditionType(field.type),
    options: field.options || [],
    formField: field
  }));
};

const crmFields = [...getBaseCrmFields(), ...getFormFieldOptions()];
```

3. **Type Mapping** (lines 138-158):
```tsx
const mapFormFieldTypeToConditionType = (formFieldType: string): string => {
  switch (formFieldType) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
    case 'textarea':
      return 'text';
    case 'number':
      return 'number';
    case 'date':
      return 'date';
    case 'select':
    case 'radio':
      return 'select';
    case 'checkbox':
      return 'checkbox';
    default:
      return 'text';
  }
};
```

## Testing
After applying the fix:
1. Create a new module configuration
2. Set trigger to Form > Submitted > [Select a form]
3. Add a condition
4. Form fields should appear in the field dropdown with "(Form Field)" suffix
5. Select a form field and appropriate operators should be available
6. Save and verify the condition works correctly