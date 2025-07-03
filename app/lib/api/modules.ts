import { type Tag } from "~/components/tags/TagsData";

// Types for Module and Configuration
export interface Module {
  id: string;
  name: string;
  description: string;
  category: "automation" | "integration" | "notification" | "workflow";
  status: "active" | "inactive" | "configured";
  icon: string;
  configurationsCount: number;
  lastModified: string;
  triggerTypes: string[];
  createdDate: string;
  updatedDate: string;
}

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: "AND" | "OR";
}

export interface Action {
  id: string;
  type: string;
  target: string;
  parameters: Record<string, any>;
}

export interface TriggerConfig {
  entityType: string;
  action: string;
  attributeFilter?: string;
}

export interface Configuration {
  id?: string;
  moduleId: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: Action[];
  status: "active" | "inactive" | "draft";
  createdDate: string;
  updatedDate: string;
}

export interface ModuleCreateData {
  name: string;
  description: string;
  category: "automation" | "integration" | "notification" | "workflow";
  icon: string;
  triggerTypes: string[];
}

export interface ModuleUpdateData extends Partial<ModuleCreateData> {
  id: string;
}

export interface ConfigurationCreateData {
  moduleId: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: Action[];
  status: "active" | "inactive" | "draft";
}

export interface ConfigurationUpdateData extends Partial<Omit<ConfigurationCreateData, 'moduleId'>> {
  id: string;
}

// Mock API for modules with session storage persistence
class ModulesAPI {
  private modulesStorageKey = 'crm_modules_data';
  private configurationsStorageKey = 'crm_configurations_data';

  // Initialize with default modules if none exist
  private getDefaultModules(): Module[] {
    return [
      {
        id: "1",
        name: "Lead Automation",
        description: "Automatically assign leads to sales reps based on territory and workload",
        category: "automation",
        status: "active",
        icon: "user-plus",
        configurationsCount: 3,
        lastModified: "2024-01-15",
        triggerTypes: ["New Lead Created", "Lead Score Changed", "Territory Assignment"],
        createdDate: "2024-01-01T10:00:00Z",
        updatedDate: "2024-01-15T10:00:00Z"
      },
      {
        id: "2", 
        name: "Email Workflows",
        description: "Send automated email sequences based on customer behavior and actions",
        category: "workflow",
        status: "active",
        icon: "envelope",
        configurationsCount: 7,
        lastModified: "2024-01-14",
        triggerTypes: ["Contact Created", "Deal Stage Changed", "Email Opened", "Link Clicked"],
        createdDate: "2024-01-01T11:00:00Z",
        updatedDate: "2024-01-14T11:00:00Z"
      },
      {
        id: "3",
        name: "Call Reminders",
        description: "Schedule automatic reminders for follow-up calls and meetings",
        category: "notification",
        status: "configured",
        icon: "phone",
        configurationsCount: 2,
        lastModified: "2024-01-13",
        triggerTypes: ["Call Scheduled", "Meeting Created", "Follow-up Due"],
        createdDate: "2024-01-01T12:00:00Z",
        updatedDate: "2024-01-13T12:00:00Z"
      },
      {
        id: "4",
        name: "Deal Notifications",
        description: "Get notified when deals move through pipeline stages or reach milestones",
        category: "notification",
        status: "active",
        icon: "bell",
        configurationsCount: 5,
        lastModified: "2024-01-12",
        triggerTypes: ["Deal Created", "Stage Changed", "Value Updated", "Close Date Approaching"],
        createdDate: "2024-01-01T13:00:00Z",
        updatedDate: "2024-01-12T13:00:00Z"
      },
      {
        id: "5",
        name: "Data Sync",
        description: "Synchronize contact and deal data with external CRM systems",
        category: "integration",
        status: "inactive",
        icon: "globe",
        configurationsCount: 1,
        lastModified: "2024-01-10",
        triggerTypes: ["Data Import", "Field Mapping", "Sync Schedule"],
        createdDate: "2024-01-01T14:00:00Z",
        updatedDate: "2024-01-10T14:00:00Z"
      },
      {
        id: "6",
        name: "Report Generation",
        description: "Automatically generate and distribute reports on schedule",
        category: "automation",
        status: "configured",
        icon: "chart",
        configurationsCount: 4,
        lastModified: "2024-01-11",
        triggerTypes: ["Schedule Trigger", "Data Threshold", "Monthly Report"],
        createdDate: "2024-01-01T15:00:00Z",
        updatedDate: "2024-01-11T15:00:00Z"
      },
      {
        id: "7",
        name: "Task Assignment",
        description: "Automatically create and assign tasks based on customer interactions",
        category: "workflow",
        status: "active",
        icon: "calendar",
        configurationsCount: 6,
        lastModified: "2024-01-09",
        triggerTypes: ["Email Received", "Meeting Completed", "Deal Won", "Support Ticket"],
        createdDate: "2024-01-01T16:00:00Z",
        updatedDate: "2024-01-09T16:00:00Z"
      },
      {
        id: "8",
        name: "Security Alerts",
        description: "Monitor and alert on security-related events and data access",
        category: "notification",
        status: "active",
        icon: "shield",
        configurationsCount: 3,
        lastModified: "2024-01-08",
        triggerTypes: ["Failed Login", "Data Export", "Permission Change"],
        createdDate: "2024-01-01T17:00:00Z",
        updatedDate: "2024-01-08T17:00:00Z"
      }
    ];
  }

  // Get default configurations for modules
  private getDefaultConfigurations(): Configuration[] {
    return [
      {
        id: "config-1",
        moduleId: "1",
        name: "High-Value Lead Assignment",
        description: "Assign leads with high estimated value to senior sales reps",
        trigger: {
          entityType: "contact",
          action: "create"
        },
        conditions: [
          {
            id: "cond-1",
            field: "contact.value",
            operator: "greater_than",
            value: "10000"
          }
        ],
        actions: [
          {
            id: "act-1",
            type: "assign_lead",
            target: "Senior Sales Rep",
            parameters: {
              assignmentLogic: "round_robin",
              criteria: "high_value"
            }
          }
        ],
        status: "active",
        createdDate: "2024-01-01T10:00:00Z",
        updatedDate: "2024-01-15T10:00:00Z"
      },
      {
        id: "config-2",
        moduleId: "2",
        name: "Welcome Email Sequence",
        description: "Send welcome email to new contacts",
        trigger: {
          entityType: "contact",
          action: "create"
        },
        conditions: [],
        actions: [
          {
            id: "act-2",
            type: "send_email",
            target: "Contact",
            parameters: {
              templateId: "welcome_template",
              delay: 0
            }
          }
        ],
        status: "active",
        createdDate: "2024-01-01T11:00:00Z",
        updatedDate: "2024-01-14T11:00:00Z"
      }
    ];
  }

  // Load modules from session storage or return defaults
  private loadModules(): Module[] {
    if (typeof window === 'undefined') {
      return this.getDefaultModules();
    }

    try {
      const stored = sessionStorage.getItem(this.modulesStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : this.getDefaultModules();
      }
    } catch (error) {
      console.warn('Failed to load modules from session storage:', error);
    }

    const defaultModules = this.getDefaultModules();
    this.saveModules(defaultModules);
    return defaultModules;
  }

  // Load configurations from session storage or return defaults
  private loadConfigurations(): Configuration[] {
    if (typeof window === 'undefined') {
      return this.getDefaultConfigurations();
    }

    try {
      const stored = sessionStorage.getItem(this.configurationsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : this.getDefaultConfigurations();
      }
    } catch (error) {
      console.warn('Failed to load configurations from session storage:', error);
    }

    const defaultConfigurations = this.getDefaultConfigurations();
    this.saveConfigurations(defaultConfigurations);
    return defaultConfigurations;
  }

  // Save modules to session storage
  private saveModules(modules: Module[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(this.modulesStorageKey, JSON.stringify(modules));
    } catch (error) {
      console.warn('Failed to save modules to session storage:', error);
    }
  }

  // Save configurations to session storage
  private saveConfigurations(configurations: Configuration[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(this.configurationsStorageKey, JSON.stringify(configurations));
    } catch (error) {
      console.warn('Failed to save configurations to session storage:', error);
    }
  }

  // Generate a unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate API delay
  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Update configuration count for a module
  private updateModuleConfigCount(moduleId: string): void {
    const modules = this.loadModules();
    const configurations = this.loadConfigurations();
    const configCount = configurations.filter(config => config.moduleId === moduleId).length;
    
    const moduleIndex = modules.findIndex(module => module.id === moduleId);
    if (moduleIndex !== -1) {
      modules[moduleIndex].configurationsCount = configCount;
      modules[moduleIndex].updatedDate = new Date().toISOString();
      this.saveModules(modules);
    }
  }

  // MODULE METHODS

  // Get all modules
  async getAllModules(): Promise<Module[]> {
    await this.delay();
    return this.loadModules();
  }

  // Get module by ID
  async getModuleById(id: string): Promise<Module | null> {
    await this.delay();
    const modules = this.loadModules();
    return modules.find(module => module.id === id) || null;
  }

  // Create a new module
  async createModule(moduleData: ModuleCreateData): Promise<Module> {
    await this.delay();
    
    const newModule: Module = {
      ...moduleData,
      id: this.generateId(),
      configurationsCount: 0,
      lastModified: new Date().toISOString().split('T')[0],
      status: "inactive",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const modules = this.loadModules();
    modules.push(newModule);
    this.saveModules(modules);

    return newModule;
  }

  // Update an existing module
  async updateModule(id: string, updates: Partial<ModuleCreateData>): Promise<Module | null> {
    await this.delay();
    
    const modules = this.loadModules();
    const moduleIndex = modules.findIndex(module => module.id === id);
    
    if (moduleIndex === -1) {
      return null;
    }

    const updatedModule = {
      ...modules[moduleIndex],
      ...updates,
      lastModified: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString()
    };

    modules[moduleIndex] = updatedModule;
    this.saveModules(modules);

    return updatedModule;
  }

  // Delete a module
  async deleteModule(id: string): Promise<boolean> {
    await this.delay();
    
    const modules = this.loadModules();
    const initialLength = modules.length;
    const filteredModules = modules.filter(module => module.id !== id);
    
    if (filteredModules.length === initialLength) {
      return false; // Module not found
    }

    // Also delete all configurations for this module
    const configurations = this.loadConfigurations();
    const filteredConfigurations = configurations.filter(config => config.moduleId !== id);
    this.saveConfigurations(filteredConfigurations);

    this.saveModules(filteredModules);
    return true;
  }

  // CONFIGURATION METHODS

  // Get all configurations for a module
  async getModuleConfigurations(moduleId: string): Promise<Configuration[]> {
    await this.delay();
    const configurations = this.loadConfigurations();
    return configurations.filter(config => config.moduleId === moduleId);
  }

  // Get configuration by ID
  async getConfigurationById(id: string): Promise<Configuration | null> {
    await this.delay();
    const configurations = this.loadConfigurations();
    return configurations.find(config => config.id === id) || null;
  }

  // Create a new configuration
  async createConfiguration(configData: ConfigurationCreateData): Promise<Configuration> {
    await this.delay();
    
    const newConfiguration: Configuration = {
      ...configData,
      id: this.generateId(),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const configurations = this.loadConfigurations();
    configurations.push(newConfiguration);
    this.saveConfigurations(configurations);

    // Update module configuration count
    this.updateModuleConfigCount(configData.moduleId);

    return newConfiguration;
  }

  // Update an existing configuration
  async updateConfiguration(id: string, updates: Partial<ConfigurationCreateData>): Promise<Configuration | null> {
    await this.delay();
    
    const configurations = this.loadConfigurations();
    const configIndex = configurations.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return null;
    }

    const updatedConfiguration = {
      ...configurations[configIndex],
      ...updates,
      updatedDate: new Date().toISOString()
    };

    configurations[configIndex] = updatedConfiguration;
    this.saveConfigurations(configurations);

    return updatedConfiguration;
  }

  // Delete a configuration
  async deleteConfiguration(id: string): Promise<boolean> {
    await this.delay();
    
    const configurations = this.loadConfigurations();
    const configToDelete = configurations.find(config => config.id === id);
    
    if (!configToDelete) {
      return false;
    }

    const filteredConfigurations = configurations.filter(config => config.id !== id);
    this.saveConfigurations(filteredConfigurations);

    // Update module configuration count
    this.updateModuleConfigCount(configToDelete.moduleId);

    return true;
  }

  // Get modules by category
  async getModulesByCategory(category: string): Promise<Module[]> {
    await this.delay();
    const modules = this.loadModules();
    return modules.filter(module => module.category === category);
  }

  // Search modules by name or description
  async searchModules(query: string): Promise<Module[]> {
    await this.delay();
    
    const modules = this.loadModules();
    const lowerQuery = query.toLowerCase();
    
    return modules.filter(module => 
      module.name.toLowerCase().includes(lowerQuery) ||
      module.description.toLowerCase().includes(lowerQuery) ||
      module.triggerTypes.some(trigger => trigger.toLowerCase().includes(lowerQuery))
    );
  }

  // Clear all modules and configurations (for testing purposes)
  async clearAllData(): Promise<void> {
    await this.delay();
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.modulesStorageKey);
      sessionStorage.removeItem(this.configurationsStorageKey);
    }
  }

  // Reset to default data
  async resetToDefaults(): Promise<{ modules: Module[], configurations: Configuration[] }> {
    await this.delay();
    
    const defaultModules = this.getDefaultModules();
    const defaultConfigurations = this.getDefaultConfigurations();
    
    this.saveModules(defaultModules);
    this.saveConfigurations(defaultConfigurations);
    
    return { modules: defaultModules, configurations: defaultConfigurations };
  }
}

// Export a singleton instance
export const modulesAPI = new ModulesAPI();

// Export types for use in components
export type { Module, Configuration, Condition, Action, TriggerConfig };
export type { ModuleCreateData, ModuleUpdateData, ConfigurationCreateData, ConfigurationUpdateData };