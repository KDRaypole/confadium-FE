import SimpleSelect from './SimpleSelect';
import { useTags } from '~/hooks/useTags';
import { useContacts } from '~/hooks/useContacts';
import { useEmailTemplates } from '~/hooks/useEmailTemplates';

interface ResourceSelectProps {
  resource: string;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ResourceSelect({ resource, value, onChange, size = 'sm' }: ResourceSelectProps) {
  switch (resource) {
    case 'tag':
      return <TagSelect value={value} onChange={onChange} size={size} />;
    case 'contact':
      return <ContactSelect value={value} onChange={onChange} size={size} />;
    case 'email_template':
      return <EmailTemplateSelect value={value} onChange={onChange} size={size} />;
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${resource} ID...`}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
