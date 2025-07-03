import type { EmailTemplate } from "~/components/email/EmailTemplates";
import { emailTemplates as defaultTemplates } from "~/components/email/EmailTemplates";

export interface EmailTemplateCreateData {
  name: string;
  category: "welcome" | "follow_up" | "nurturing" | "promotion" | "notification" | "reminder";
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
  previewText: string;
}

export interface EmailTemplateUpdateData extends Partial<EmailTemplateCreateData> {}

class EmailTemplatesAPI {
  private storageKey = 'crm_email_templates_data';

  private getStoredTemplates(): EmailTemplate[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default templates if none exist
      this.initializeDefaultTemplates();
      return defaultTemplates;
    } catch (error) {
      console.error('Error reading email templates from localStorage:', error);
      return defaultTemplates;
    }
  }

  private setStoredTemplates(templates: EmailTemplate[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving email templates to localStorage:', error);
      throw new Error('Failed to save email templates');
    }
  }

  private initializeDefaultTemplates(): void {
    this.setStoredTemplates(defaultTemplates);
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.getStoredTemplates();
  }

  // Get templates by category
  async getTemplatesByCategory(category: EmailTemplate["category"]): Promise<EmailTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templates = this.getStoredTemplates();
    return templates.filter(template => template.category === category);
  }

  // Get a single template by ID
  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templates = this.getStoredTemplates();
    return templates.find(template => template.id === id) || null;
  }

  // Create a new template
  async createTemplate(data: EmailTemplateCreateData): Promise<EmailTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const templates = this.getStoredTemplates();
    const newTemplate: EmailTemplate = {
      ...data,
      id: this.generateId(),
    };
    
    templates.push(newTemplate);
    this.setStoredTemplates(templates);
    
    return newTemplate;
  }

  // Update an existing template
  async updateTemplate(id: string, updates: EmailTemplateUpdateData): Promise<EmailTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const templates = this.getStoredTemplates();
    const templateIndex = templates.findIndex(template => template.id === id);
    
    if (templateIndex === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    const updatedTemplate = {
      ...templates[templateIndex],
      ...updates,
    };
    
    templates[templateIndex] = updatedTemplate;
    this.setStoredTemplates(templates);
    
    return updatedTemplate;
  }

  // Delete a template
  async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const templates = this.getStoredTemplates();
    const filteredTemplates = templates.filter(template => template.id !== id);
    
    if (filteredTemplates.length === templates.length) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    this.setStoredTemplates(filteredTemplates);
  }

  // Duplicate a template
  async duplicateTemplate(id: string): Promise<EmailTemplate> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const originalTemplate = await this.getTemplateById(id);
    if (!originalTemplate) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    const duplicatedTemplate: EmailTemplate = {
      ...originalTemplate,
      id: this.generateId(),
      name: `${originalTemplate.name} (Copy)`,
    };
    
    const templates = this.getStoredTemplates();
    templates.push(duplicatedTemplate);
    this.setStoredTemplates(templates);
    
    return duplicatedTemplate;
  }

  // Search templates
  async searchTemplates(query: string): Promise<EmailTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!query.trim()) {
      return this.getStoredTemplates();
    }
    
    const templates = this.getStoredTemplates();
    const lowercaseQuery = query.toLowerCase();
    
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.subject.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get template statistics
  async getTemplateStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const templates = this.getStoredTemplates();
    const byCategory = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: templates.length,
      byCategory,
    };
  }

  // Reset to default templates
  async resetToDefaults(): Promise<EmailTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.setStoredTemplates(defaultTemplates);
    return defaultTemplates;
  }

  // Export templates
  async exportTemplates(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const templates = this.getStoredTemplates();
    return JSON.stringify(templates, null, 2);
  }

  // Import templates
  async importTemplates(jsonData: string): Promise<EmailTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      const importedTemplates = JSON.parse(jsonData) as EmailTemplate[];
      
      // Validate imported data
      if (!Array.isArray(importedTemplates)) {
        throw new Error('Invalid template data: expected an array');
      }
      
      // Ensure each template has required fields
      importedTemplates.forEach((template, index) => {
        if (!template.id || !template.name || !template.category) {
          throw new Error(`Invalid template at index ${index}: missing required fields`);
        }
      });
      
      this.setStoredTemplates(importedTemplates);
      return importedTemplates;
    } catch (error) {
      throw new Error(`Failed to import templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const emailTemplatesAPI = new EmailTemplatesAPI();
export type { EmailTemplate };