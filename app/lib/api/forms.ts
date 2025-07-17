import { db } from '~/lib/db';
import { generateFormUrl } from '~/lib/jwt';

// TypeScript declaration for global forms store
declare global {
  var __mockFormsStore: Form[] | undefined;
}

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
  conditionalActions?: ConditionalAction[];
}

// Conditional logic interfaces
export interface FormFieldCondition {
  id: string;
  fieldId: string; // The field this condition checks
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'not_empty';
  value: string;
}

export interface ConditionalAction {
  id: string;
  triggerValue: string; // The answer value that triggers this action
  type: 'remove_options' | 'add_options' | 'enable_options' | 'hide_question' | 'show_question' | 'end_form';
  targetFieldId?: string; // Optional for end_form actions
  options?: string[]; // For option-based actions
  endMessage?: string; // For end_form actions
  endTitle?: string; // Title for end form message
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
  headerImage?: string;
  headerImageHeight?: number;
  headerImageFit?: 'cover' | 'contain' | 'fill';
  headerImageOpacity?: number;
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
  // Multi-stage form settings
  enableMultiStage: boolean;
  nextButtonText: string;
  previousButtonText: string;
  showStepIndicator: boolean;
  allowStepNavigation: boolean;
  // Security settings
  obfuscateFormId: boolean;
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
// Using localStorage in browser, globalThis on server
const getFormsStore = (): Form[] => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('__mockFormsStore');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading forms from localStorage:', error);
    }
  }
  
  // Fallback to globalThis for server-side
  if (!globalThis.__mockFormsStore) {
    globalThis.__mockFormsStore = [];
  }
  return globalThis.__mockFormsStore;
};

const setFormsStore = (forms: Form[]): void => {
  // Store in localStorage if in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('__mockFormsStore', JSON.stringify(forms));
    } catch (error) {
      console.error('Error saving forms to localStorage:', error);
    }
  }
  
  // Also store in globalThis for server-side compatibility
  globalThis.__mockFormsStore = forms;
};

// Get next available ID
const getNextFormId = (): string => {
  const mockFormsStore = getFormsStore();
  const maxId = mockFormsStore.reduce((max, form) => {
    const numericId = parseInt(form.id);
    return isNaN(numericId) ? max : Math.max(max, numericId);
  }, 0);
  return (maxId + 1).toString();
};

const defaultTheme: FormTheme = {
  primaryColor: "#7c3aed",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  spacing: 16,
  headerImage: undefined,
  headerImageHeight: 200,
  headerImageFit: 'cover',
  headerImageOpacity: 1
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
  autoSaveDraft: false,
  // Multi-stage form settings
  enableMultiStage: false,
  nextButtonText: "Next",
  previousButtonText: "Previous",
  showStepIndicator: true,
  allowStepNavigation: false,
  // Security settings
  obfuscateFormId: false
};

// Sync data between globalThis and localStorage
const syncFormsData = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    // If localStorage is empty but globalThis has data, sync it
    const stored = localStorage.getItem('__mockFormsStore');
    if (!stored && globalThis.__mockFormsStore && globalThis.__mockFormsStore.length > 0) {
      localStorage.setItem('__mockFormsStore', JSON.stringify(globalThis.__mockFormsStore));
    }
    // If globalThis is empty but localStorage has data, sync it
    else if (stored && (!globalThis.__mockFormsStore || globalThis.__mockFormsStore.length === 0)) {
      try {
        globalThis.__mockFormsStore = JSON.parse(stored);
      } catch (error) {
        console.error('Error syncing forms data:', error);
      }
    }
  }
};

// Initialize mock data
const initializeMockData = () => {
  syncFormsData(); // Sync data first
  const mockFormsStore = getFormsStore();
  if (mockFormsStore.length === 0) {
    const initialForms: Form[] = [
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
        settings: { 
          ...defaultSettings, 
          notificationEmail: "contact@company.com",
          enableMultiStage: false,
          nextButtonText: "Next",
          previousButtonText: "Previous", 
          showStepIndicator: true,
          allowStepNavigation: false,
          obfuscateFormId: false
        },
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
        settings: { 
          ...defaultSettings, 
          notificationEmail: "sales@company.com",
          enableMultiStage: false,
          nextButtonText: "Next",
          previousButtonText: "Previous",
          showStepIndicator: true,
          allowStepNavigation: false,
          obfuscateFormId: false
        },
        submissions: 89,
        status: "active",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-18"
      },
      {
        id: "3",
        name: "Event Registration",
        description: "Event registration and attendee information",
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "What's your full name?",
            placeholder: "Enter your full name",
            required: true
          },
          {
            id: "field_2",
            type: "email",
            label: "What's your email address?",
            placeholder: "you@example.com",
            required: true
          },
          {
            id: "field_3",
            type: "select",
            label: "Which session interests you most?",
            required: true,
            options: ["Morning Workshop", "Afternoon Keynote", "Evening Networking", "All Sessions"]
          },
          {
            id: "field_4",
            type: "radio",
            label: "What's your experience level?",
            required: true,
            options: ["Beginner", "Intermediate", "Advanced", "Expert"]
          },
          {
            id: "field_5",
            type: "textarea",
            label: "Any special requirements or questions?",
            placeholder: "Let us know if you have any dietary restrictions, accessibility needs, or questions...",
            required: false
          }
        ],
        theme: { ...defaultTheme, primaryColor: "#dc2626" },
        settings: { 
          ...defaultSettings,
          enableMultiStage: true,
          nextButtonText: "Continue",
          previousButtonText: "Go Back",
          showStepIndicator: true,
          allowStepNavigation: true,
          notificationEmail: "events@company.com",
          obfuscateFormId: false
        },
        submissions: 234,
        status: "active",
        createdAt: "2024-01-08",
        updatedAt: "2024-01-16"
      },
      {
        id: "4",
        name: "Advanced Features Demo",
        description: "Demo form showcasing all advanced features",
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "Your Name",
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
            type: "select",
            label: "How did you hear about us?",
            required: false,
            options: ["Search Engine", "Social Media", "Referral", "Advertisement"]
          }
        ],
        theme: { ...defaultTheme, primaryColor: "#059669" },
        settings: { 
          ...defaultSettings,
          enableMultiStage: true,
          showProgressBar: true,
          autoSaveDraft: true,
          showStepIndicator: true,
          allowStepNavigation: true,
          nextButtonText: "Continue",
          previousButtonText: "Back",
          submitButtonText: "Complete Survey",
          successMessage: "Thank you! Your response has been recorded successfully.",
          redirectUrl: "https://example.com/thank-you",
          notificationEmail: "demo@example.com",
          obfuscateFormId: false
        },
        submissions: 12,
        status: "active",
        createdAt: "2024-01-05",
        updatedAt: "2024-01-20"
      },
      {
        id: "5",
        name: "Secure Feedback Form",
        description: "Confidential feedback form with encrypted sharing",
        fields: [
          {
            id: "field_1",
            type: "text",
            label: "Your Name (Optional)",
            placeholder: "Enter your name",
            required: false
          },
          {
            id: "field_2",
            type: "email",
            label: "Email Address",
            placeholder: "your@email.com",
            required: true
          },
          {
            id: "field_3",
            type: "select",
            label: "Feedback Category",
            required: true,
            options: ["General", "Bug Report", "Feature Request", "Complaint", "Compliment"]
          },
          {
            id: "field_4",
            type: "textarea",
            label: "Your Feedback",
            placeholder: "Please share your detailed feedback...",
            required: true
          }
        ],
        theme: { ...defaultTheme, primaryColor: "#1f2937", backgroundColor: "#f9fafb" },
        settings: { 
          ...defaultSettings,
          enableCaptcha: true,
          notificationEmail: "feedback@company.com",
          obfuscateFormId: true // This form uses JWT obfuscation
        },
        submissions: 45,
        status: "active",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20"
      }
    ];
    setFormsStore(initialForms);
  }
};

export const formsApi = {
  // Get all forms for an organization (returns simplified forms for lists)
  async getAll(orgId: string): Promise<SimpleForm[]> {
    try {
      initializeMockData();
      const mockFormsStore = getFormsStore();
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
      const mockFormsStore = getFormsStore();
      return mockFormsStore.find(form => form.id === formId) || null;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw new Error('Failed to fetch form');
    }
  },

  // Get a form for public access (only returns active forms)
  async getPublicForm(formId: string): Promise<Form | null> {
    try {
      initializeMockData();
      const mockFormsStore = getFormsStore();
      console.log('getPublicForm - total forms in store:', mockFormsStore.length);
      console.log('getPublicForm - looking for formId:', formId);
      console.log('getPublicForm - available form IDs:', mockFormsStore.map(f => f.id));
      
      const form = mockFormsStore.find(form => form.id === formId);
      console.log('getPublicForm - found form:', !!form, 'status:', form?.status);
      
      // Only return active forms for public access
      if (form && form.status === 'active') {
        return form;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching public form:', error);
      throw new Error('Failed to fetch form');
    }
  },

  // Submit a form (for public submissions)
  async submitForm(formId: string, data: Record<string, any>, recaptchaToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      initializeMockData();
      const mockFormsStore = getFormsStore();
      const form = mockFormsStore.find(f => f.id === formId);
      
      if (!form) {
        return { success: false, message: 'Form not found' };
      }

      if (form.status !== 'active') {
        return { success: false, message: 'Form is not available for submissions' };
      }

      // Check submission limits
      if (form.settings.submissionLimit && form.submissions >= form.settings.submissionLimit) {
        return { 
          success: false, 
          message: 'This form has reached its submission limit and is no longer accepting responses.' 
        };
      }

      // Check availability window
      const now = new Date();
      const startDate = form.settings.startDate ? new Date(form.settings.startDate) : null;
      const endDate = form.settings.endDate ? new Date(form.settings.endDate) : null;

      if ((startDate && now < startDate) || (endDate && now > endDate)) {
        return { 
          success: false, 
          message: form.settings.closedMessage || 'This form is currently closed for submissions.' 
        };
      }

      // Check authentication requirement
      if (form.settings.requireAuth) {
        return { 
          success: false, 
          message: 'This form requires authentication to submit.' 
        };
      }

      // Check reCAPTCHA if enabled
      if (form.settings.enableCaptcha && !recaptchaToken) {
        return { 
          success: false, 
          message: 'Please complete the reCAPTCHA verification before submitting.' 
        };
      }

      // In a real app, you would validate the reCAPTCHA token with Google's API
      if (form.settings.enableCaptcha && recaptchaToken) {
        // Mock reCAPTCHA validation - in production, this would call Google's API
        if (!recaptchaToken.startsWith('mock_recaptcha_token_')) {
          return { 
            success: false, 
            message: 'Invalid reCAPTCHA token. Please try again.' 
          };
        }
      }

      // In a real app, this would save to database
      // For now, just increment the submission count
      form.submissions += 1;
      form.updatedAt = new Date().toISOString();
      
      // Persist the changes
      setFormsStore(mockFormsStore);

      console.log('Form submission:', { formId, data });
      
      return { 
        success: true, 
        message: form.settings.successMessage || 'Thank you for your submission!' 
      };
    } catch (error) {
      console.error('Error submitting form:', error);
      return { 
        success: false, 
        message: 'An error occurred while submitting the form. Please try again.' 
      };
    }
  },

  // Create a new form
  async create(orgId: string, data: FormCreateData): Promise<Form> {
    try {
      initializeMockData();
      const mockFormsStore = getFormsStore();
      const newForm: Form = {
        id: getNextFormId(),
        ...data,
        status: data.status || 'draft',
        submissions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockFormsStore.push(newForm);
      setFormsStore(mockFormsStore);
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
      const mockFormsStore = getFormsStore();
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
      setFormsStore(mockFormsStore);
      
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
      const mockFormsStore = getFormsStore();
      const formIndex = mockFormsStore.findIndex(form => form.id === formId);
      
      if (formIndex === -1) {
        return false;
      }

      mockFormsStore.splice(formIndex, 1);
      setFormsStore(mockFormsStore);
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
        fields: originalForm.fields.map((field, index) => ({
          ...field,
          id: `field_${index + 1}`
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
  },

  // Reset forms data (for testing)
  async resetData(): Promise<void> {
    setFormsStore([]);
    initializeMockData();
  },

  // Force sync data between storage mechanisms
  syncData(): void {
    syncFormsData();
  },

  // Get current store state for debugging
  getStoreState(): { localStorage: any; globalThis: any } {
    const localData = typeof window !== 'undefined' && window.localStorage 
      ? localStorage.getItem('__mockFormsStore') 
      : null;
    
    return {
      localStorage: localData ? JSON.parse(localData) : null,
      globalThis: globalThis.__mockFormsStore || null
    };
  },

  // Get shareable URL for a form
  getShareableUrl(formId: string): string {
    try {
      const form = this.getFormsStore().find(f => f.id === formId);
      if (!form) {
        throw new Error('Form not found');
      }
      
      return generateFormUrl(formId, form.settings.obfuscateFormId);
    } catch (error) {
      console.error('Error generating shareable URL:', error);
      // Fallback to direct URL
      return generateFormUrl(formId, false);
    }
  }
};