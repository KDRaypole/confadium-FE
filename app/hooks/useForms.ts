import { useState, useEffect } from 'react';
import { useParams } from '@remix-run/react';
import { formsApi, type Form } from '~/lib/api/forms';

export const useForms = () => {
  const params = useParams();
  const orgId = params.orgId;
  const [forms, setForms] = useState<Form[]>([]);
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
        const data = await formsApi.getAll(orgId);
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

  return { forms, loading, error, refetch: () => {} };
};

export const useActiveForms = () => {
  const params = useParams();
  const orgId = params.orgId;
  const [forms, setForms] = useState<Form[]>([]);
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

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    const loadForm = async () => {
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
    };

    loadForm();
  }, [formId]);

  return { form, loading, error };
};