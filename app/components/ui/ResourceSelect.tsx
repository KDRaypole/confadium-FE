import { useQuery } from '@tanstack/react-query';
import SimpleSelect from './SimpleSelect';
import { useTags } from '~/hooks/useTags';
import { useContacts } from '~/hooks/useContacts';
import { useEmailTemplates } from '~/hooks/useEmailTemplates';
import { formsApi } from '~/lib/api/forms';

interface ResourceSelectProps {
  resource: string;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  formId?: string;
}

export default function ResourceSelect({ resource, value, onChange, size = 'sm', formId }: ResourceSelectProps) {
  switch (resource) {
    case 'tag':
      return <TagSelect value={value} onChange={onChange} size={size} />;
    case 'contact':
      return <ContactSelect value={value} onChange={onChange} size={size} />;
    case 'email_template':
      return <EmailTemplateSelect value={value} onChange={onChange} size={size} />;
    case 'form_field':
      return <FormFieldSelect value={value} onChange={onChange} size={size} formId={formId} />;
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${resource} ID...`}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-sm"
        />
      );
  }
}

function TagSelect({ value, onChange, size }: { value: string; onChange: (v: string) => void; size: 'sm' | 'md' | 'lg' }) {
  const { tags, loading } = useTags();
  return (
    <SimpleSelect
      options={[
        { value: "", label: loading ? "Loading tags..." : "Select a tag..." },
        ...tags.map(tag => ({
          value: tag.id,
          label: tag.attributes?.name || tag.id
        }))
      ]}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
}

function ContactSelect({ value, onChange, size }: { value: string; onChange: (v: string) => void; size: 'sm' | 'md' | 'lg' }) {
  const { contacts, loading } = useContacts();
  return (
    <SimpleSelect
      options={[
        { value: "", label: loading ? "Loading contacts..." : "Select a contact..." },
        ...contacts.map(c => ({
          value: c.id,
          label: `${c.attributes?.first_name || ''} ${c.attributes?.last_name || ''}`.trim() || c.attributes?.email || c.id
        }))
      ]}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
}

function EmailTemplateSelect({ value, onChange, size }: { value: string; onChange: (v: string) => void; size: 'sm' | 'md' | 'lg' }) {
  const { templates, loading } = useEmailTemplates();
  return (
    <SimpleSelect
      options={[
        { value: "", label: loading ? "Loading templates..." : "Select an email template..." },
        ...templates.map(t => ({
          value: t.id,
          label: t.attributes?.name || t.id
        }))
      ]}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
}

function FormFieldSelect({ value, onChange, size, formId }: { value: string; onChange: (v: string) => void; size: 'sm' | 'md' | 'lg'; formId?: string }) {
  const query = useQuery({
    queryKey: ['form-fields', formId],
    queryFn: () => formsApi.getFields(formId!),
    select: (data) => data.data,
    enabled: !!formId,
  });

  const fields = query.data || [];
  const loading = query.isLoading;

  if (!formId) {
    return (
      <SimpleSelect
        options={[{ value: "", label: "Select a form in the trigger first" }]}
        value=""
        onChange={onChange}
        size={size}
        disabled
      />
    );
  }

  return (
    <SimpleSelect
      options={[
        { value: "", label: loading ? "Loading fields..." : "Select a form field..." },
        ...fields.map(f => ({
          value: f.attributes?.label || f.id,
          label: f.attributes?.label || f.id
        }))
      ]}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
}
