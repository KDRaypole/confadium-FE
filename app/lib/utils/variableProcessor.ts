import type { VariableAssignment } from "~/components/email/VariableAssignmentEditor";

export interface EntityData {
  [key: string]: any;
}

/**
 * Apply conversions to a field value based on conversion type
 */
export const applyConversion = (
  value: any, 
  conversion: VariableAssignment['conversion']
): string => {
  if (!conversion || value == null) {
    return String(value || '');
  }

  const stringValue = String(value);

  switch (conversion.type) {
    case 'format_date':
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return stringValue;
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      } catch {
        return stringValue;
      }

    case 'format_currency':
      try {
        const number = parseFloat(String(value));
        if (isNaN(number)) return stringValue;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(number);
      } catch {
        return stringValue;
      }

    case 'format_number':
      try {
        const number = parseFloat(String(value));
        if (isNaN(number)) return stringValue;
        return new Intl.NumberFormat('en-US').format(number);
      } catch {
        return stringValue;
      }

    case 'capitalize':
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();

    case 'uppercase':
      return stringValue.toUpperCase();

    case 'lowercase':
      return stringValue.toLowerCase();

    default:
      return stringValue;
  }
};

/**
 * Get nested property value from object using dot notation
 */
export const getNestedValue = (obj: EntityData, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
};

/**
 * Process variable assignments and generate final variable values
 */
export const processVariableAssignments = (
  assignments: VariableAssignment[],
  entityData: EntityData
): Record<string, string> => {
  const result: Record<string, string> = {};

  assignments.forEach(assignment => {
    const { templateVariable, entityField, staticValue, conversion } = assignment;

    let value: any;

    if (staticValue !== undefined) {
      // Use static value
      value = staticValue;
    } else if (entityField) {
      // Get value from entity field
      value = getNestedValue(entityData, entityField);
    } else {
      // No assignment - use empty string
      value = '';
    }

    // Apply conversion if specified
    const finalValue = applyConversion(value, conversion);
    result[templateVariable] = finalValue;
  });

  return result;
};

/**
 * Validate that all required variables have assignments
 */
export const validateAssignments = (
  templateVariables: string[],
  assignments: VariableAssignment[]
): { isValid: boolean; missingVariables: string[] } => {
  const assignedVariables = new Set(assignments.map(a => a.templateVariable));
  const missingVariables = templateVariables.filter(v => !assignedVariables.has(v));

  return {
    isValid: missingVariables.length === 0,
    missingVariables
  };
};

/**
 * Generate auto-assignments based on name similarity between template variables and entity fields
 */
export const generateAutoAssignments = (
  templateVariables: string[],
  entityFields: Array<{ value: string; label: string; type: string }>
): VariableAssignment[] => {
  const assignments: VariableAssignment[] = [];

  templateVariables.forEach(variable => {
    // Try to find a matching entity field by name similarity
    const varName = variable.toLowerCase().replace(/_/g, "");
    
    // Score fields by similarity
    const fieldScores = entityFields.map(field => {
      const fieldName = field.value.toLowerCase().replace(/\./g, "");
      
      let score = 0;
      
      // Exact match (minus separators)
      if (fieldName === varName) score += 100;
      
      // One contains the other
      if (fieldName.includes(varName)) score += 50;
      if (varName.includes(fieldName)) score += 40;
      
      // Common patterns
      if (varName.includes("name") && fieldName.includes("name")) score += 30;
      if (varName.includes("email") && fieldName.includes("email")) score += 30;
      if (varName.includes("phone") && fieldName.includes("phone")) score += 30;
      if (varName.includes("company") && fieldName.includes("company")) score += 30;
      if (varName.includes("date") && fieldName.includes("date")) score += 20;
      if (varName.includes("value") && fieldName.includes("value")) score += 20;
      if (varName.includes("score") && fieldName.includes("score")) score += 20;
      
      return { field, score };
    });

    // Get the best matching field
    const bestMatch = fieldScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    if (bestMatch.score > 0) {
      assignments.push({
        templateVariable: variable,
        entityField: bestMatch.field.value,
        staticValue: undefined
      });
    } else {
      // No good match found - create assignment with first field as default
      assignments.push({
        templateVariable: variable,
        entityField: entityFields[0]?.value || "",
        staticValue: undefined
      });
    }
  });

  return assignments;
};

/**
 * Common entity field definitions for different entity types
 */
export const getEntityFieldsForType = (entityType: string) => {
  const fieldDefinitions = {
    contact: [
      { value: "name", label: "Contact Name", type: "text", description: "Full name of the contact" },
      { value: "email", label: "Email Address", type: "email", description: "Primary email address" },
      { value: "phone", label: "Phone Number", type: "text", description: "Primary phone number" },
      { value: "company", label: "Company", type: "text", description: "Company or organization name" },
      { value: "position", label: "Job Position", type: "text", description: "Job title or role" },
      { value: "status", label: "Lead Status", type: "select", description: "Current lead status", options: ["hot", "warm", "cold"] },
      { value: "lastContact", label: "Last Contact Date", type: "date", description: "Date of last interaction" },
      { value: "notes", label: "Notes", type: "text", description: "Additional notes about the contact" },
      { value: "address", label: "Address", type: "text", description: "Physical address" },
      { value: "createdAt", label: "Created Date", type: "date", description: "When the contact was created" },
      { value: "updatedAt", label: "Updated Date", type: "date", description: "When the contact was last updated" }
    ],
    deal: [
      { value: "name", label: "Deal Name", type: "text", description: "Name or title of the deal" },
      { value: "stage", label: "Deal Stage", type: "select", description: "Current stage in sales pipeline", options: ["prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"] },
      { value: "value", label: "Deal Value", type: "number", description: "Monetary value of the deal" },
      { value: "probability", label: "Probability", type: "number", description: "Probability of closing (0-100%)" },
      { value: "closeDate", label: "Close Date", type: "date", description: "Expected or actual close date" },
      { value: "assignedTo", label: "Assigned To", type: "text", description: "Sales rep or owner" },
      { value: "contactId", label: "Primary Contact", type: "text", description: "Main contact for this deal" },
      { value: "description", label: "Description", type: "text", description: "Deal description or notes" },
      { value: "createdAt", label: "Created Date", type: "date", description: "When the deal was created" },
      { value: "updatedAt", label: "Updated Date", type: "date", description: "When the deal was last updated" }
    ],
    activity: [
      { value: "type", label: "Activity Type", type: "select", description: "Type of activity", options: ["call", "email", "meeting", "task", "note"] },
      { value: "status", label: "Status", type: "select", description: "Current status", options: ["completed", "scheduled", "overdue", "cancelled"] },
      { value: "subject", label: "Subject", type: "text", description: "Activity subject or title" },
      { value: "description", label: "Description", type: "text", description: "Detailed description" },
      { value: "dueDate", label: "Due Date", type: "date", description: "When the activity is due" },
      { value: "priority", label: "Priority", type: "select", description: "Priority level", options: ["low", "medium", "high", "urgent"] },
      { value: "assignedTo", label: "Assigned To", type: "text", description: "Person responsible" },
      { value: "contactId", label: "Related Contact", type: "text", description: "Associated contact" },
      { value: "dealId", label: "Related Deal", type: "text", description: "Associated deal" },
      { value: "createdAt", label: "Created Date", type: "date", description: "When the activity was created" },
      { value: "updatedAt", label: "Updated Date", type: "date", description: "When the activity was last updated" }
    ]
  };

  return fieldDefinitions[entityType as keyof typeof fieldDefinitions] || [];
};