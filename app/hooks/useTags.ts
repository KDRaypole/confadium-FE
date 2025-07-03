import { useState, useEffect, useCallback } from 'react';
import { tagsAPI, type Tag, type TagCreateData, type TagUpdateData } from '~/lib/api/tags';

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTag: (data: TagCreateData) => Promise<Tag | null>;
  updateTag: (id: string, data: TagUpdateData) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  getTagById: (id: string) => Tag | null;
  incrementUsage: (id: string) => Promise<void>;
  searchTags: (query: string) => Promise<Tag[]>;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await tagsAPI.getAllTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refetch();
  }, [refetch]);

  const createTag = useCallback(async (data: TagCreateData): Promise<Tag | null> => {
    try {
      setError(null);
      const newTag = await tagsAPI.createTag(data);
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err) {
      console.error('Failed to create tag:', err);
      setError('Failed to create tag');
      return null;
    }
  }, []);

  const updateTag = useCallback(async (id: string, data: TagUpdateData): Promise<Tag | null> => {
    try {
      setError(null);
      const updatedTag = await tagsAPI.updateTag(id, data);
      if (updatedTag) {
        setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
        return updatedTag;
      }
      return null;
    } catch (err) {
      console.error('Failed to update tag:', err);
      setError('Failed to update tag');
      return null;
    }
  }, []);

  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await tagsAPI.deleteTag(id);
      if (success) {
        setTags(prev => prev.filter(tag => tag.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Failed to delete tag:', err);
      setError('Failed to delete tag');
      return false;
    }
  }, []);

  const getTagById = useCallback((id: string): Tag | null => {
    return tags.find(tag => tag.id === id) || null;
  }, [tags]);

  const incrementUsage = useCallback(async (id: string): Promise<void> => {
    try {
      await tagsAPI.incrementUsage(id);
      setTags(prev => prev.map(tag => 
        tag.id === id ? { ...tag, usageCount: tag.usageCount + 1 } : tag
      ));
    } catch (err) {
      console.error('Failed to increment tag usage:', err);
    }
  }, []);

  const searchTags = useCallback(async (query: string): Promise<Tag[]> => {
    try {
      return await tagsAPI.searchTags(query);
    } catch (err) {
      console.error('Failed to search tags:', err);
      return [];
    }
  }, []);

  return {
    tags,
    loading,
    error,
    refetch,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    incrementUsage,
    searchTags
  };
}

// Hook for single tag operations
export function useTag(id: string | undefined) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTag(null);
      setLoading(false);
      return;
    }

    const fetchTag = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTag = await tagsAPI.getTagById(id);
        setTag(fetchedTag);
      } catch (err) {
        console.error('Failed to fetch tag:', err);
        setError('Failed to load tag');
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id]);

  const updateTag = useCallback(async (data: TagUpdateData): Promise<Tag | null> => {
    if (!id) return null;

    try {
      setError(null);
      const updatedTag = await tagsAPI.updateTag(id, data);
      if (updatedTag) {
        setTag(updatedTag);
      }
      return updatedTag;
    } catch (err) {
      console.error('Failed to update tag:', err);
      setError('Failed to update tag');
      return null;
    }
  }, [id]);

  return {
    tag,
    loading,
    error,
    updateTag
  };
}