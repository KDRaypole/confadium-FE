import { db } from '~/lib/db';

export interface Form {
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

export const formsApi = {
  // Get all forms for an organization
  async getAll(orgId: string): Promise<Form[]> {
    try {
      // In a real app, this would fetch from a database
      // For now, returning mock data that matches the structure
      const mockForms: Form[] = [
        {
          id: "1",
          name: "Contact Form",
          description: "Basic contact information form",
          fields: 5,
          submissions: 142,
          status: "active",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-20",
          theme: {
            primaryColor: "#7c3aed",
            backgroundColor: "#ffffff"
          }
        },
        {
          id: "2", 
          name: "Lead Qualification",
          description: "Comprehensive lead qualification form",
          fields: 8,
          submissions: 89,
          status: "active",
          createdAt: "2024-01-10",
          updatedAt: "2024-01-18",
          theme: {
            primaryColor: "#059669",
            backgroundColor: "#f9fafb"
          }
        },
        {
          id: "3",
          name: "Event Registration",
          description: "Event registration and attendee information",
          fields: 12,
          submissions: 234,
          status: "draft",
          createdAt: "2024-01-08",
          updatedAt: "2024-01-16",
          theme: {
            primaryColor: "#dc2626",
            backgroundColor: "#ffffff"
          }
        },
        {
          id: "4",
          name: "Newsletter Signup",
          description: "Simple newsletter subscription form",
          fields: 3,
          submissions: 567,
          status: "active",
          createdAt: "2024-01-05",
          updatedAt: "2024-01-12",
          theme: {
            primaryColor: "#2563eb",
            backgroundColor: "#f3f4f6"
          }
        },
        {
          id: "5",
          name: "Product Demo Request",
          description: "Request form for product demonstrations",
          fields: 6,
          submissions: 45,
          status: "active",
          createdAt: "2024-01-20",
          updatedAt: "2024-01-22",
          theme: {
            primaryColor: "#7c3aed",
            backgroundColor: "#ffffff"
          }
        }
      ];

      return mockForms;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw new Error('Failed to fetch forms');
    }
  },

  // Get active forms only (for trigger selection)
  async getActiveForms(orgId: string): Promise<Form[]> {
    const allForms = await this.getAll(orgId);
    return allForms.filter(form => form.status === 'active');
  },

  // Get a single form by ID
  async getById(formId: string): Promise<Form | null> {
    const forms = await this.getAll(''); // In real app, would fetch by ID
    return forms.find(form => form.id === formId) || null;
  }
};