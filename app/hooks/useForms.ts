import { useState, useEffect, useCallback } from 'react';
import { useParams } from '@remix-run/react';
import { formsApi, type Form, type SimpleForm, type FormCreateData, type FormUpdateData } from '~/lib/api/forms';

export const useForms = () => {
  const params = useParams();
  const orgId = params.orgId;
  const [forms, setForms] = useState<SimpleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await formsApi.getAll(orgId);
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const createForm = useCallback(async (data: FormCreateData): Promise<Form | null> => {
    if (!orgId) return null;

    try {
      setError(null);
      const newForm = await formsApi.create(orgId, data);
      await loadForms(); // Refresh the list
      return newForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      return null;
    }
  }, [orgId, loadForms]);

  const deleteForm = useCallback(async (formId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await formsApi.delete(formId);
      if (success) {
        await loadForms(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete form');
      return false;
    }
  }, [loadForms]);

  const duplicateForm = useCallback(async (formId: string): Promise<Form | null> => {
    try {
      setError(null);
      const duplicated = await formsApi.duplicate(formId);
      if (duplicated) {
        await loadForms(); // Refresh the list
      }
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate form');
      return null;
    }
  }, [loadForms]);

  return { 
    forms, 
    loading, 
    error, 
    refetch: loadForms,
    createForm,
    deleteForm,
    duplicateForm
  };
};

export const useActiveForms = () => {
  const params = useParams();
  const orgId = params.orgId;
  const [forms, setForms] = useState<SimpleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await formsApi.getActiveForms(orgId);
        setForms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forms');
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [orgId]);

  return { forms, loading, error };
};

export const useForm = (formId: string | null) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForm = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await formsApi.getById(formId);
      setForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form');
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const updateForm = useCallback(async (data: FormUpdateData): Promise<Form | null> => {
    if (!formId) return null;

    try {
      setError(null);
      const updatedForm = await formsApi.update(formId, data);
      if (updatedForm) {
        setForm(updatedForm);
      }
      return updatedForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update form');
      return null;
    }
  }, [formId]);

  return { form, loading, error, updateForm, refetch: loadForm };
};