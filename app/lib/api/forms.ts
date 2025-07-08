import { db } from '~/lib/db';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'url' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  description?: string;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontSize: number;
  fontFamily: string;
  spacing: number;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  notificationEmail: string;
  redirectUrl?: string;
  storeSubmissions: boolean;
  requireAuth: boolean;
  enableCaptcha: boolean;
  submissionLimit?: number;
  submissionLimitPeriod: 'hour' | 'day' | 'week' | 'month';
  startDate?: string;
  endDate?: string;
  closedMessage: string;
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  autoSaveDraft: boolean;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  settings: FormSettings;
  status: 'active' | 'draft' | 'archived';
  submissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormCreateData {
  name: string;
  description: string;
  fields: FormField[];
  theme: FormTheme;
  settings: FormSettings;
  status?: 'active' | 'draft';
}

export interface FormUpdateData extends Partial<FormCreateData> {
  id: string;
}

// Simple form interface for lists/triggers (backwards compatibility)
export interface SimpleForm {
  id: string;
  name: string;
  description: string;
  fields: number;
  submissions: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
  };
}

// Mock data store (in real app, this would be database calls)
let mockFormsStore: Form[] = [];

const defaultTheme: FormTheme = {
  primaryColor: "#7c3aed",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  spacing: 16
};

const defaultSettings: FormSettings = {
  submitButtonText: "Submit",
  successMessage: "Thank you for your submission!",
  errorMessage: "Sorry, there was an error submitting your form. Please try again.",
  notificationEmail: "",
  storeSubmissions: true,
  requireAuth: false,
  enableCaptcha: false,
  submissionLimitPeriod: 'day',
  closedMessage: "This form is currently closed for submissions.",
  allowMultipleSubmissions: true,
  showProgressBar: false,
  autoSaveDraft: false
};

// Initialize mock data
const initializeMockData = () => {
  if (mockFormsStore.length === 0) {
    mockFormsStore = [
      {
        id: "1",
        name: "Contact Form",
        description: "Basic contact information form",
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true
          },
          {
            id: "field_2",
            type: "email",
            label: "Email Address",
            placeholder: "you@example.com",
            required: true
          },
          {
            id: "field_3",
            type: "phone",
            label: "Phone Number",
            placeholder: "+1 (555) 123-4567",
            required: false
          },
          {
            id: "field_4",
            type: "select",
            label: "How did you hear about us?",
            required: false,
            options: ["Google", "Social Media", "Friend", "Advertisement", "Other"]
          },
          {
            id: "field_5",
            type: "textarea",
            label: "Message",
            placeholder: "Tell us how we can help...",
            required: false
          }
        ],
        theme: { ...defaultTheme },
        settings: { ...defaultSettings, notificationEmail: "contact@company.com" },
        submissions: 142,
        status: "active",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20"
      },
      {
        id: "2",
        name: "Lead Qualification",
        description: "Comprehensive lead qualification form",
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "Company Name",
            required: true
          },
          {
            id: "field_2",
            type: "email",
            label: "Work Email",
            required: true
          },
          {
            id: "field_3",
            type: "select",
            label: "Company Size",
            required: true,
            options: ["1-10", "11-50", "51-200", "201-1000", "1000+"]
          },
          {
            id: "field_4",
            type: "select",
            label: "Budget Range",
            required: true,
            options: ["Under $10k", "$10k-$50k", "$50k-$100k", "$100k+"]
          },
          {
            id: "field_5",
            type: "radio",
            label: "Timeline",
            required: true,
            options: ["Immediate", "Next 3 months", "Next 6 months", "Next year"]
          }
        ],
        theme: { ...defaultTheme, primaryColor: "#059669", backgroundColor: "#f9fafb" },
        settings: { ...defaultSettings, notificationEmail: "sales@company.com" },
        submissions: 89,
        status: "active",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-18"
      },
      {
        id: "3",
        name: "Event Registration",
        description: "Event registration and attendee information",
        fields: [],
        theme: { ...defaultTheme, primaryColor: "#dc2626" },
        settings: { ...defaultSettings },
        submissions: 234,
        status: "draft",
        createdAt: "2024-01-08",
        updatedAt: "2024-01-16"
      }
    ];
  }
};

export const formsApi = {
  // Get all forms for an organization (returns simplified forms for lists)
  async getAll(orgId: string): Promise<SimpleForm[]> {
    try {
      initializeMockData();
      return mockFormsStore.map(form => ({
        id: form.id,
        name: form.name,
        description: form.description,
        fields: form.fields.length,
        submissions: form.submissions,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        theme: {
          primaryColor: form.theme.primaryColor,
          backgroundColor: form.theme.backgroundColor
        }
      }));
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw new Error('Failed to fetch forms');
    }
  },

  // Get active forms only (for trigger selection)
  async getActiveForms(orgId: string): Promise<SimpleForm[]> {
    const allForms = await this.getAll(orgId);
    return allForms.filter(form => form.status === 'active');
  },

  // Get a single form by ID (returns full form data)
  async getById(formId: string): Promise<Form | null> {
    try {
      initializeMockData();
      return mockFormsStore.find(form => form.id === formId) || null;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw new Error('Failed to fetch form');
    }
  },

  // Create a new form
  async create(orgId: string, data: FormCreateData): Promise<Form> {
    try {
      initializeMockData();
      const newForm: Form = {
        id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        status: data.status || 'draft',
        submissions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockFormsStore.push(newForm);
      return newForm;
    } catch (error) {
      console.error('Error creating form:', error);
      throw new Error('Failed to create form');
    }
  },

  // Update an existing form
  async update(formId: string, data: FormUpdateData): Promise<Form | null> {
    try {
      initializeMockData();
      const formIndex = mockFormsStore.findIndex(form => form.id === formId);
      
      if (formIndex === -1) {
        return null;
      }

      const updatedForm: Form = {
        ...mockFormsStore[formIndex],
        ...data,
        id: formId,
        updatedAt: new Date().toISOString()
      };

      mockFormsStore[formIndex] = updatedForm;
      return updatedForm;
    } catch (error) {
      console.error('Error updating form:', error);
      throw new Error('Failed to update form');
    }
  },

  // Delete a form
  async delete(formId: string): Promise<boolean> {
    try {
      initializeMockData();
      const formIndex = mockFormsStore.findIndex(form => form.id === formId);
      
      if (formIndex === -1) {
        return false;
      }

      mockFormsStore.splice(formIndex, 1);
      return true;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw new Error('Failed to delete form');
    }
  },

  // Duplicate a form
  async duplicate(formId: string): Promise<Form | null> {
    try {
      const originalForm = await this.getById(formId);
      if (!originalForm) {
        return null;
      }

      const duplicatedForm: FormCreateData = {
        name: `${originalForm.name} (Copy)`,
        description: originalForm.description,
        fields: originalForm.fields.map(field => ({
          ...field,
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })),
        theme: { ...originalForm.theme },
        settings: { ...originalForm.settings },
        status: 'draft'
      };

      return this.create('', duplicatedForm);
    } catch (error) {
      console.error('Error duplicating form:', error);
      throw new Error('Failed to duplicate form');
    }
  }
};