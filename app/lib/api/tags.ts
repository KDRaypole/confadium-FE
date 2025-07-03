import { type Tag } from "~/components/tags/TagsData";

// Mock API for tags with session storage persistence
class TagsAPI {
  private storageKey = 'crm_tags_data';

  // Initialize with default tags if none exist
  private getDefaultTags(): Tag[] {
    return [
      {
        id: "enterprise",
        name: "Enterprise",
        color: "blue",
        priority: "high",
        level: 5,
        description: "Large enterprise clients with significant revenue potential",
        category: "Customer Type",
        createdDate: "2024-01-01",
        usageCount: 45
      },
      {
        id: "high-priority",
        name: "High Priority",
        color: "red",
        priority: "critical",
        level: 5,
        description: "Requires immediate attention",
        category: "Priority",
        createdDate: "2024-01-01",
        usageCount: 32
      },
      {
        id: "decision-maker",
        name: "Decision Maker",
        color: "purple",
        priority: "high",
        level: 4,
        description: "Has authority to make purchasing decisions",
        category: "Role",
        createdDate: "2024-01-01",
        usageCount: 28
      },
      {
        id: "warm-lead",
        name: "Warm Lead",
        color: "yellow",
        priority: "medium",
        level: 3,
        description: "Showed interest but needs nurturing",
        category: "Status",
        createdDate: "2024-01-01",
        usageCount: 67
      },
      {
        id: "technical",
        name: "Technical",
        color: "green",
        priority: "medium",
        level: 3,
        description: "Technical contact or decision maker",
        category: "Role",
        createdDate: "2024-01-01",
        usageCount: 23
      },
      {
        id: "budget-approved",
        name: "Budget Approved",
        color: "emerald",
        priority: "high",
        level: 4,
        description: "Budget has been approved for purchase",
        category: "Status",
        createdDate: "2024-01-01",
        usageCount: 15
      },
      {
        id: "startup",
        name: "Startup",
        color: "orange",
        priority: "medium",
        level: 2,
        description: "Early stage startup company",
        category: "Customer Type",
        createdDate: "2024-01-01",
        usageCount: 34
      },
      {
        id: "website",
        name: "Website",
        color: "indigo",
        priority: "low",
        level: 2,
        description: "Lead source from website",
        category: "Source",
        createdDate: "2024-01-01",
        usageCount: 89
      },
      {
        id: "referral",
        name: "Referral",
        color: "pink",
        priority: "medium",
        level: 3,
        description: "Referred by existing client",
        category: "Source",
        createdDate: "2024-01-01",
        usageCount: 12
      },
      {
        id: "technology",
        name: "Technology",
        color: "cyan",
        priority: "low",
        level: 2,
        description: "Technology industry",
        category: "Industry",
        createdDate: "2024-01-01",
        usageCount: 56
      },
      {
        id: "price-sensitive",
        name: "Price Sensitive",
        color: "amber",
        priority: "medium",
        level: 3,
        description: "Very concerned about pricing",
        category: "Characteristics",
        createdDate: "2024-01-01",
        usageCount: 41
      },
      {
        id: "large-company",
        name: "Large Company",
        color: "violet",
        priority: "high",
        level: 4,
        description: "Large company with 500+ employees",
        category: "Size",
        createdDate: "2024-01-01",
        usageCount: 29
      }
    ];
  }

  // Load tags from session storage or return defaults
  private loadTags(): Tag[] {
    if (typeof window === 'undefined') {
      return this.getDefaultTags();
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : this.getDefaultTags();
      }
    } catch (error) {
      console.warn('Failed to load tags from session storage:', error);
    }

    const defaultTags = this.getDefaultTags();
    this.saveTags(defaultTags);
    return defaultTags;
  }

  // Save tags to session storage
  private saveTags(tags: Tag[]): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(tags));
    } catch (error) {
      console.warn('Failed to save tags to session storage:', error);
    }
  }

  // Generate a unique ID for new tags
  private generateId(): string {
    return `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate API delay
  private delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all tags
  async getAllTags(): Promise<Tag[]> {
    await this.delay();
    return this.loadTags();
  }

  // Get tag by ID
  async getTagById(id: string): Promise<Tag | null> {
    await this.delay();
    const tags = this.loadTags();
    return tags.find(tag => tag.id === id) || null;
  }

  // Create a new tag
  async createTag(tagData: Omit<Tag, 'id' | 'createdDate' | 'usageCount'>): Promise<Tag> {
    await this.delay();
    
    const newTag: Tag = {
      ...tagData,
      id: this.generateId(),
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    const tags = this.loadTags();
    tags.push(newTag);
    this.saveTags(tags);

    return newTag;
  }

  // Update an existing tag
  async updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdDate'>>): Promise<Tag | null> {
    await this.delay();
    
    const tags = this.loadTags();
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      return null;
    }

    const updatedTag = {
      ...tags[tagIndex],
      ...updates
    };

    tags[tagIndex] = updatedTag;
    this.saveTags(tags);

    return updatedTag;
  }

  // Delete a tag
  async deleteTag(id: string): Promise<boolean> {
    await this.delay();
    
    const tags = this.loadTags();
    const initialLength = tags.length;
    const filteredTags = tags.filter(tag => tag.id !== id);
    
    if (filteredTags.length === initialLength) {
      return false; // Tag not found
    }

    this.saveTags(filteredTags);
    return true;
  }

  // Increment usage count for a tag
  async incrementUsage(id: string): Promise<void> {
    await this.delay();
    
    const tags = this.loadTags();
    const tagIndex = tags.findIndex(tag => tag.id === id);
    
    if (tagIndex !== -1) {
      tags[tagIndex].usageCount += 1;
      this.saveTags(tags);
    }
  }

  // Get tags by category
  async getTagsByCategory(): Promise<Record<string, Tag[]>> {
    await this.delay();
    
    const tags = this.loadTags();
    const categorized: Record<string, Tag[]> = {};
    
    tags.forEach(tag => {
      const category = tag.category || 'Other';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(tag);
    });

    return categorized;
  }

  // Search tags by name or description
  async searchTags(query: string): Promise<Tag[]> {
    await this.delay();
    
    const tags = this.loadTags();
    const lowerQuery = query.toLowerCase();
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery) ||
      (tag.description && tag.description.toLowerCase().includes(lowerQuery))
    );
  }

  // Get most used tags
  async getMostUsedTags(limit: number = 10): Promise<Tag[]> {
    await this.delay();
    
    const tags = this.loadTags();
    return tags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Clear all tags (for testing purposes)
  async clearAllTags(): Promise<void> {
    await this.delay();
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.storageKey);
    }
  }

  // Reset to default tags
  async resetToDefaults(): Promise<Tag[]> {
    await this.delay();
    
    const defaultTags = this.getDefaultTags();
    this.saveTags(defaultTags);
    return defaultTags;
  }
}

// Export a singleton instance
export const tagsAPI = new TagsAPI();

// Export types for use in components
export type { Tag };
export type TagCreateData = Omit<Tag, 'id' | 'createdDate' | 'usageCount'>;
export type TagUpdateData = Partial<Omit<Tag, 'id' | 'createdDate'>>;