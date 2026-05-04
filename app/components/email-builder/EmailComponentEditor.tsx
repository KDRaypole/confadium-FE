import { useEmailBuilder } from "./EmailBuilderContext";
import type { EmailComponentNode } from "~/lib/api/types";

export default function EmailComponentEditor() {
  const { selectedId, getComponent, manipulate, select, removeComponent, duplicateComponent } = useEmailBuilder();

  if (!selectedId) {
    return <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Select a component to edit</div>;
  }

  const comp = getComponent(selectedId);
  if (!comp) return null;

  const update = (changes: Record<string, unknown>) => manipulate(selectedId, changes);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{LABELS[comp.type] || comp.type}</h3>
        <button onClick={() => select(null)} className="text-xs text-gray-500 hover:text-gray-700">Deselect</button>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {renderEditor(comp, update)}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex gap-2">
        <button onClick={() => duplicateComponent(selectedId)} className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50">Duplicate</button>
        <button onClick={() => { removeComponent(selectedId); select(null); }} className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>
      </div>
    </div>
  );
}

const LABELS: Record<string, string> = {
  EmailHeader: 'Header', EmailText: 'Text', EmailImage: 'Image', EmailButton: 'Button',
  EmailDivider: 'Divider', EmailSpacer: 'Spacer', EmailColumns: 'Columns',
  EmailSocial: 'Social Links', EmailFooter: 'Footer', EmailHtml: 'HTML Block',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>{children}</div>;
}
function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />;
}
function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />;
}
function Color({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div className="flex items-center space-x-2"><input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-7 w-7 rounded border cursor-pointer" /><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

function renderEditor(comp: EmailComponentNode, update: (c: Record<string, unknown>) => void) {
  const p = comp.props as Record<string, any>;

  switch (comp.type) {
    case 'EmailHeader':
      return <div className="space-y-3">
        <Field label="Logo Image URL"><Input value={p.logoUrl || ''} onChange={(v) => update({ logoUrl: v })} placeholder="https://..." /></Field>
        <Field label="Logo Alt Text / Fallback"><Input value={p.logoAlt || ''} onChange={(v) => update({ logoAlt: v })} /></Field>
        <Field label="Logo Width (px)"><Input value={p.logoWidth || '150'} onChange={(v) => update({ logoWidth: v })} type="number" /></Field>
        <Field label="Background Color"><Color value={p.backgroundColor || ''} onChange={(v) => update({ backgroundColor: v })} /></Field>
      </div>;

    case 'EmailText':
      return <div className="space-y-3">
        <Field label="Content">
          <TextArea value={p.content || ''} onChange={(v) => update({ content: v })} rows={4} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supports HTML tags like &lt;br&gt;, &lt;strong&gt;, &lt;a&gt;</p>
        </Field>
        <Field label="Type"><Select value={p.textType || 'body'} onChange={(v) => update({ textType: v })} options={[{ value: 'heading', label: 'Heading' }, { value: 'body', label: 'Body' }]} /></Field>
        <Field label="Alignment"><Select value={p.align || 'left'} onChange={(v) => update({ align: v })} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
        <Field label="Color Override"><Color value={p.color || ''} onChange={(v) => update({ color: v })} /></Field>
      </div>;

    case 'EmailImage':
      return <div className="space-y-3">
        <Field label="Image URL"><Input value={p.src || ''} onChange={(v) => update({ src: v })} placeholder="https://..." /></Field>
        <Field label="Alt Text"><Input value={p.alt || ''} onChange={(v) => update({ alt: v })} /></Field>
        <Field label="Width (px)"><Input value={p.width || '600'} onChange={(v) => update({ width: v })} type="number" /></Field>
        <Field label="Link URL (optional)"><Input value={p.linkUrl || ''} onChange={(v) => update({ linkUrl: v })} placeholder="https://..." /></Field>
      </div>;

    case 'EmailButton':
      return <div className="space-y-3">
        <Field label="Button Text"><Input value={p.text || ''} onChange={(v) => update({ text: v })} /></Field>
        <Field label="URL"><Input value={p.url || ''} onChange={(v) => update({ url: v })} placeholder="https://..." /></Field>
        <Field label="Background Color"><Color value={p.bgColor || ''} onChange={(v) => update({ bgColor: v })} /></Field>
        <Field label="Text Color"><Color value={p.textColor || '#ffffff'} onChange={(v) => update({ textColor: v })} /></Field>
        <Field label="Border Radius (px)"><Input value={p.borderRadius || '6'} onChange={(v) => update({ borderRadius: v })} type="number" /></Field>
        <Field label="Width (px)"><Input value={p.width || '200'} onChange={(v) => update({ width: v })} type="number" /></Field>
      </div>;

    case 'EmailDivider':
      return <div className="space-y-3">
        <Field label="Color"><Color value={p.color || '#e5e7eb'} onChange={(v) => update({ color: v })} /></Field>
        <Field label="Thickness (px)"><Input value={p.thickness || '1'} onChange={(v) => update({ thickness: v })} type="number" /></Field>
      </div>;

    case 'EmailSpacer':
      return <Field label="Height (px)">
        <div className="flex items-center space-x-2">
          <input type="range" min="4" max="80" step="4" value={parseInt(p.height || '24', 10)} onChange={(e) => update({ height: e.target.value })} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{p.height || 24}px</span>
        </div>
      </Field>;

    case 'EmailColumns': {
      const cols = p.columns || 2;
      const content = p.columnContent || [];
      return <div className="space-y-3">
        <Field label="Number of Columns"><Select value={String(cols)} onChange={(v) => {
          const n = parseInt(v, 10);
          const updated = Array.from({ length: n }).map((_, i) => content[i] || { content: `Column ${i + 1}` });
          update({ columns: n, columnContent: updated });
        }} options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }]} /></Field>
        <p className="text-xs text-gray-500 dark:text-gray-400">HTML is supported in column content</p>
        {Array.from({ length: cols }).map((_, i) => (
          <Field key={i} label={`Column ${i + 1}`}>
            <TextArea value={content[i]?.content || ''} onChange={(v) => {
              const updated = [...content];
              updated[i] = { content: v };
              update({ columnContent: updated });
            }} rows={3} />
          </Field>
        ))}
      </div>;
    }

    case 'EmailSocial': {
      const networks = p.networks || [];
      return <div className="space-y-3">
        {networks.map((n: any, i: number) => (
          <div key={i} className="flex gap-1">
            <Input value={n.name} onChange={(v) => { const u = [...networks]; u[i] = { ...u[i], name: v }; update({ networks: u }); }} placeholder="Name" />
            <Input value={n.url} onChange={(v) => { const u = [...networks]; u[i] = { ...u[i], url: v }; update({ networks: u }); }} placeholder="URL" />
            <button onClick={() => update({ networks: networks.filter((_: any, j: number) => j !== i) })} className="text-red-500 text-xs px-1">&times;</button>
          </div>
        ))}
        <button onClick={() => update({ networks: [...networks, { name: '', url: 'https://' }] })} className="text-xs text-purple-600 hover:text-purple-700">+ Add network</button>
      </div>;
    }

    case 'EmailFooter':
      return <div className="space-y-3">
        <Field label="Footer Text"><TextArea value={p.text || ''} onChange={(v) => update({ text: v })} rows={2} /></Field>
        <Field label="Unsubscribe URL"><Input value={p.unsubscribeUrl || ''} onChange={(v) => update({ unsubscribeUrl: v })} placeholder="{{unsubscribe_url}}" /></Field>
        <Field label="Company Address"><Input value={p.companyAddress || ''} onChange={(v) => update({ companyAddress: v })} /></Field>
      </div>;

    case 'EmailHtml':
      return <Field label="HTML Content"><TextArea value={p.html || ''} onChange={(v) => update({ html: v })} rows={6} /></Field>;

    default:
      return <p className="text-sm text-gray-500">No editor for {comp.type}</p>;
  }
}
