import { usePageBuilder } from "./PageBuilderContext";
import type { PageComponentNode } from "~/lib/api/types";
import { useActiveForms } from "~/hooks/useForms";
import { useProducts } from "~/hooks/useProducts";

export default function ComponentEditor() {
  const { selectedSelector, getComponent, manipulate, select } = usePageBuilder();

  if (!selectedSelector) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Select a component to edit its properties
      </div>
    );
  }

  const component = getComponent(selectedSelector);
  if (!component) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{component.type}</h3>
        <button onClick={() => select(null)} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Deselect
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {renderEditor(component, manipulate)}
      </div>
    </div>
  );
}

function renderEditor(
  node: PageComponentNode,
  manipulate: (selector: string, changes: Record<string, unknown>) => void
) {
  const update = (changes: Record<string, unknown>) => manipulate(node.selector, changes);

  switch (node.type) {
    case 'Text':
      return <TextEditor node={node} onChange={update} />;
    case 'Image':
      return <ImageEditor node={node} onChange={update} />;
    case 'ContentButton':
      return <ButtonEditor node={node} onChange={update} />;
    case 'ContentVideo':
      return <VideoEditor node={node} onChange={update} />;
    case 'IconItem':
      return <IconEditor node={node} onChange={update} />;
    case 'BoxItem':
      return <BoxEditor node={node} onChange={update} />;
    case 'Navigation':
      return <NavigationEditor node={node} onChange={update} />;
    case 'Footer':
      return <FooterEditor node={node} onChange={update} />;
    case 'FormEmbed':
      return <FormEmbedEditor node={node} onChange={update} />;
    case 'ProductEmbed':
      return <ProductEmbedEditor node={node} onChange={update} />;
    default:
      return <div className="text-sm text-gray-500">No editor for {node.type}</div>;
  }
}

// ── Shared field components ────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    />
  );
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center space-x-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-8 w-8 rounded border border-gray-300 cursor-pointer" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
    </div>
  );
}

// ── Type-specific editors ──────────────────────────────────

function TextEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Text Content">
        <TextArea value={p.verbiage || ''} onChange={(v) => onChange({ verbiage: v })} />
      </Field>
      <Field label="Style">
        <SelectInput value={p.tagType || 'paragraph_1'} onChange={(v) => onChange({ tagType: v })} options={[
          { value: 'heading_1', label: 'Heading 1' },
          { value: 'heading_2', label: 'Heading 2' },
          { value: 'heading_3', label: 'Heading 3' },
          { value: 'heading_4', label: 'Heading 4' },
          { value: 'paragraph_1', label: 'Body' },
          { value: 'paragraph_2', label: 'Small' },
          { value: 'paragraph_3', label: 'Caption' },
        ]} />
      </Field>
      <Field label="Alignment">
        <SelectInput value={p.textAlign || 'left'} onChange={(v) => onChange({ textAlign: v })} options={[
          { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
        ]} />
      </Field>
      <Field label="Color">
        <ColorInput value={p.color || ''} onChange={(v) => onChange({ color: v })} />
      </Field>
    </div>
  );
}

function ImageEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Image URL">
        <TextInput value={p.src || ''} onChange={(v) => onChange({ src: v })} placeholder="https://..." />
      </Field>
      <Field label="Alt Text">
        <TextInput value={p.alt || ''} onChange={(v) => onChange({ alt: v })} />
      </Field>
      <Field label="Fit">
        <SelectInput value={p.objectFit || 'cover'} onChange={(v) => onChange({ objectFit: v })} options={[
          { value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'fill', label: 'Fill' },
        ]} />
      </Field>
      <Field label="Radius">
        <SelectInput value={p.radiusType || 'none'} onChange={(v) => onChange({ radiusType: v })} options={[
          { value: 'none', label: 'None' }, { value: 'rounded', label: 'Rounded' }, { value: 'circle', label: 'Circle' },
        ]} />
      </Field>
    </div>
  );
}

function ButtonEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Button Text">
        <TextInput value={p.text || ''} onChange={(v) => onChange({ text: v })} />
      </Field>
      <Field label="Link URL">
        <TextInput value={p.link || ''} onChange={(v) => onChange({ link: v })} placeholder="https://..." />
      </Field>
      <Field label="Link Type">
        <SelectInput value={p.linkType || 'link'} onChange={(v) => onChange({ linkType: v })} options={[
          { value: 'link', label: 'URL' }, { value: 'anchor', label: 'Page Anchor' }, { value: 'phone', label: 'Phone' },
        ]} />
      </Field>
      <Field label="Style">
        <SelectInput value={p.buttonType || 'primary'} onChange={(v) => onChange({ buttonType: v })} options={[
          { value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Outline' },
        ]} />
      </Field>
    </div>
  );
}

function VideoEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <Field label="Video URL">
      <TextInput value={p.video || ''} onChange={(v) => onChange({ video: v })} placeholder="YouTube or Vimeo URL" />
    </Field>
  );
}

function IconEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Icon Name">
        <TextInput value={p.icon || ''} onChange={(v) => onChange({ icon: v })} placeholder="e.g., star, heart" />
      </Field>
      <Field label="Color">
        <ColorInput value={p.color || ''} onChange={(v) => onChange({ color: v })} />
      </Field>
    </div>
  );
}

function BoxEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Background Color">
        <ColorInput value={p.color || '#f3f4f6'} onChange={(v) => onChange({ color: v })} />
      </Field>
      <Field label="Corner Radius">
        <SelectInput value={p.radiusType || 'rounded'} onChange={(v) => onChange({ radiusType: v })} options={[
          { value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' },
        ]} />
      </Field>
    </div>
  );
}

function NavigationEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <Field label="Logo Text">
      <TextInput value={p.logo || ''} onChange={(v) => onChange({ logo: v })} placeholder="Your Logo" />
    </Field>
  );
}

function FooterEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <Field label="Footer Text">
      <TextArea value={p.text || ''} onChange={(v) => onChange({ text: v })} />
    </Field>
  );
}

function FormEmbedEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as { formId?: string };
  const { data: forms } = useActiveForms();

  return (
    <Field label="Select Form">
      <select
        value={p.formId || ''}
        onChange={(e) => {
          const form = forms?.find(f => f.id === e.target.value);
          onChange({ formId: e.target.value, formName: form?.attributes.name || '' });
        }}
        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">Choose a form...</option>
        {forms?.map(form => (
          <option key={form.id} value={form.id}>{form.attributes.name}</option>
        ))}
      </select>
    </Field>
  );
}

function ProductEmbedEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as { productId?: string };
  const { products } = useProducts();

  return (
    <Field label="Select Product">
      <select
        value={p.productId || ''}
        onChange={(e) => {
          const product = products?.find(pr => pr.id === e.target.value);
          onChange({ productId: e.target.value, productName: product?.attributes.name || '' });
        }}
        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">Choose a product...</option>
        {products?.map(product => (
          <option key={product.id} value={product.id}>{product.attributes.name}</option>
        ))}
      </select>
    </Field>
  );
}
