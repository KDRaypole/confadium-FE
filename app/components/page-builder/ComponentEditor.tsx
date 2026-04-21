import { usePageBuilder } from "./PageBuilderContext";
import type { PageComponentNode } from "~/lib/api/types";
import { useForms } from "~/hooks/useForms";
import { useProducts } from "~/hooks/useProducts";

export default function ComponentEditor() {
  const { selectedSelector, getComponent, manipulate, select, removeComponent, duplicateComponent } = usePageBuilder();

  if (!selectedSelector) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Select a component to edit its properties
      </div>
    );
  }

  const component = getComponent(selectedSelector);
  if (!component) return null;

  const handleDelete = () => {
    removeComponent(selectedSelector);
    select(null);
  };

  const handleDuplicate = () => {
    duplicateComponent(selectedSelector);
  };

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

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center gap-2">
        <button
          onClick={handleDuplicate}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Duplicate
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Delete
        </button>
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
    case 'Section':
      return <SectionEditor node={node} onChange={update} />;
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

function SectionEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, unknown>;
  const paddingX = (p.paddingX as number) ?? 32;
  const paddingY = (p.paddingY as number) ?? 24;
  const gridGapX = (p.gridGapX as number) ?? 8;
  const gridGapY = (p.gridGapY as number) ?? 8;

  return (
    <div className="space-y-3">
      <Field label="Background Color">
        <ColorInput value={(p.backgroundColor as string) || ''} onChange={(v) => onChange({ backgroundColor: v })} />
      </Field>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Padding</div>
      <Field label="Horizontal">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="120"
            step="4"
            value={paddingX}
            onChange={(e) => onChange({ paddingX: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{paddingX}px</span>
        </div>
      </Field>
      <Field label="Vertical">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="120"
            step="4"
            value={paddingY}
            onChange={(e) => onChange({ paddingY: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{paddingY}px</span>
        </div>
      </Field>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Grid Gap</div>
      <Field label="Column Gap">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={gridGapX}
            onChange={(e) => onChange({ gridGapX: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{gridGapX}px</span>
        </div>
      </Field>
      <Field label="Row Gap">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={gridGapY}
            onChange={(e) => onChange({ gridGapY: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{gridGapY}px</span>
        </div>
      </Field>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Size</div>
      <Field label="Min Rows (height)">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="4"
            max="40"
            value={parseInt(((p.rows as { lg: number })?.lg ?? 12).toString(), 10)}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange({ rows: { lg: val, sm: val } });
            }}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-6 text-right">
            {(p.rows as { lg: number })?.lg || 12}
          </span>
        </div>
      </Field>
    </div>
  );
}

function NavigationEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Logo Text">
        <TextInput value={p.logo || ''} onChange={(v) => onChange({ logo: v })} placeholder="Your Logo" />
      </Field>
      <Field label="Background Color">
        <ColorInput value={p.backgroundColor || ''} onChange={(v) => onChange({ backgroundColor: v })} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={p.textColor || ''} onChange={(v) => onChange({ textColor: v })} />
      </Field>
    </div>
  );
}

function FooterEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, string>;
  return (
    <div className="space-y-3">
      <Field label="Footer Text">
        <TextArea value={p.text || ''} onChange={(v) => onChange({ text: v })} />
      </Field>
      <Field label="Background Color">
        <ColorInput value={p.backgroundColor || ''} onChange={(v) => onChange({ backgroundColor: v })} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={p.textColor || ''} onChange={(v) => onChange({ textColor: v })} />
      </Field>
    </div>
  );
}

function FormEmbedEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as { formId?: string };
  const { forms, loading } = useForms();

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
        <option value="">{loading ? 'Loading forms...' : 'Choose a form...'}</option>
        {forms?.map(form => (
          <option key={form.id} value={form.id}>
            {form.attributes.name}
            {form.attributes.state?.action ? ` (${form.attributes.state.action})` : ''}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ProductEmbedEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as { productId?: string };
  const { products, loading } = useProducts();

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
        <option value="">{loading ? 'Loading products...' : 'Choose a product...'}</option>
        {products?.map(product => (
          <option key={product.id} value={product.id}>
            {product.attributes.name}
            {product.attributes.state?.action ? ` (${product.attributes.state.action})` : ''}
          </option>
        ))}
      </select>
    </Field>
  );
}
