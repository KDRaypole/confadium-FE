import { useState } from "react";
import { usePageBuilder } from "./PageBuilderContext";
import type { PageComponentNode, BackgroundConfig, BackgroundGradient, BackgroundLayer, BackgroundImage, BackgroundOverlay } from "~/lib/api/types";
import { useForms } from "~/hooks/useForms";
import { useProducts } from "~/hooks/useProducts";
import { useWebsitePages } from "~/hooks/useWebsites";
import { usePages } from "~/hooks/usePages";
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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
    case 'Carousel':
      return <CarouselEditor node={node} onChange={update} />;
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
      <Field label="Link (optional)">
        <SelectInput value={p.linkType || 'none'} onChange={(v) => onChange({ linkType: v })} options={[
          { value: 'none', label: 'No Link' },
          { value: 'link', label: 'External URL' },
          { value: 'page', label: 'Website Page' },
        ]} />
      </Field>
      {p.linkType === 'link' && (
        <Field label="URL">
          <TextInput value={p.link || ''} onChange={(v) => onChange({ link: v })} placeholder="https://..." />
        </Field>
      )}
      {p.linkType === 'page' && (
        <PageLinkPicker
          value={p.link || ''}
          pageId={p.linkedPageId || ''}
          onChange={(pageId, slug) => onChange({ linkedPageId: pageId, link: slug })}
        />
      )}
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
      <Field label="Link Type">
        <SelectInput value={p.linkType || 'link'} onChange={(v) => onChange({ linkType: v })} options={[
          { value: 'link', label: 'External URL' },
          { value: 'page', label: 'Website Page' },
          { value: 'anchor', label: 'Page Anchor' },
          { value: 'phone', label: 'Phone' },
        ]} />
      </Field>
      {p.linkType === 'page' ? (
        <PageLinkPicker
          value={p.link || ''}
          pageId={p.linkedPageId || ''}
          onChange={(pageId, slug) => onChange({ linkedPageId: pageId, link: slug })}
        />
      ) : (
        <Field label={p.linkType === 'phone' ? 'Phone Number' : p.linkType === 'anchor' ? 'Anchor ID' : 'URL'}>
          <TextInput value={p.link || ''} onChange={(v) => onChange({ link: v })} placeholder={p.linkType === 'phone' ? '+1234567890' : p.linkType === 'anchor' ? '#section-name' : 'https://...'} />
        </Field>
      )}
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
  const { device } = usePageBuilder();
  const bp = device === 'mobile' ? 'sm' : 'lg';

  // Layout props are now per-breakpoint: { lg: value, sm: value }
  const getVal = (key: string, fallback: number) => {
    const stored = p[key] as { lg?: number; sm?: number } | number | undefined;
    if (typeof stored === 'number') return stored; // Legacy: single number
    if (stored && typeof stored === 'object') return stored[bp] ?? fallback;
    return fallback;
  };

  const setVal = (key: string, value: number) => {
    const stored = p[key] as { lg?: number; sm?: number } | number | undefined;
    const current = typeof stored === 'object' && stored ? stored : { lg: getVal(key, value), sm: getVal(key, value) };
    onChange({ [key]: { ...current, [bp]: value } });
  };

  const paddingX = getVal('paddingX', 32);
  const paddingY = getVal('paddingY', 24);
  const gridGapX = getVal('gridGapX', 8);
  const gridGapY = getVal('gridGapY', 8);
  const rowCount = getVal('rows', 12);

  const deviceLabel = bp === 'lg' ? 'Desktop' : 'Mobile';

  // Background configuration
  const background = (p.background as BackgroundConfig) || {};

  const updateBackground = (updates: Partial<BackgroundConfig>) => {
    onChange({ background: { ...background, ...updates } });
  };

  return (
    <div className="space-y-3">
      {/* Simple background color - backward compatible */}
      <Field label="Background Color">
        <ColorInput
          value={background.color || (p.backgroundColor as string) || ''}
          onChange={(v) => {
            updateBackground({ color: v });
            // Also update legacy field for backward compatibility
            onChange({ backgroundColor: v, background: { ...background, color: v } });
          }}
        />
      </Field>

      {/* Advanced Background Settings */}
      <BackgroundConfigEditor background={background} onChange={updateBackground} />

      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-center text-gray-500 dark:text-gray-400">
        Editing layout for <span className="font-medium text-gray-700 dark:text-gray-200">{deviceLabel}</span>
      </div>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Padding</div>
      <Field label="Horizontal">
        <div className="flex items-center space-x-2">
          <input type="range" min="0" max="120" step="4" value={paddingX} onChange={(e) => setVal('paddingX', parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{paddingX}px</span>
        </div>
      </Field>
      <Field label="Vertical">
        <div className="flex items-center space-x-2">
          <input type="range" min="0" max="120" step="4" value={paddingY} onChange={(e) => setVal('paddingY', parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{paddingY}px</span>
        </div>
      </Field>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Grid Gap</div>
      <Field label="Column Gap">
        <div className="flex items-center space-x-2">
          <input type="range" min="0" max="32" step="2" value={gridGapX} onChange={(e) => setVal('gridGapX', parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{gridGapX}px</span>
        </div>
      </Field>
      <Field label="Row Gap">
        <div className="flex items-center space-x-2">
          <input type="range" min="0" max="32" step="2" value={gridGapY} onChange={(e) => setVal('gridGapY', parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{gridGapY}px</span>
        </div>
      </Field>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Size</div>
      <Field label="Min Rows (height)">
        <div className="flex items-center space-x-2">
          <input type="range" min="4" max="40" value={rowCount} onChange={(e) => setVal('rows', parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-xs text-gray-500 tabular-nums w-6 text-right">{rowCount}</span>
        </div>
      </Field>
    </div>
  );
}

// ── Advanced Background Configuration Editor ────────────────

function BackgroundConfigEditor({ background, onChange }: {
  background: BackgroundConfig;
  onChange: (updates: Partial<BackgroundConfig>) => void;
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Background Image Section */}
      <CollapsibleSection
        title="Background Image"
        isExpanded={expandedSections.image}
        onToggle={() => toggleSection('image')}
        hasContent={!!background.image?.url}
      >
        <BackgroundImageEditor
          image={background.image}
          onChange={(image) => onChange({ image })}
        />
      </CollapsibleSection>

      {/* Gradient Section */}
      <CollapsibleSection
        title="Gradient"
        isExpanded={expandedSections.gradient}
        onToggle={() => toggleSection('gradient')}
        hasContent={!!background.gradient}
      >
        <GradientEditor
          gradient={background.gradient}
          onChange={(gradient) => onChange({ gradient })}
        />
      </CollapsibleSection>

      {/* Overlay Section */}
      <CollapsibleSection
        title="Overlay"
        isExpanded={expandedSections.overlay}
        onToggle={() => toggleSection('overlay')}
        hasContent={!!background.overlay}
      >
        <OverlayEditor
          overlay={background.overlay}
          onChange={(overlay) => onChange({ overlay })}
        />
      </CollapsibleSection>

      {/* Custom Layers Section (SVG/HTML) */}
      <CollapsibleSection
        title="Custom Layers (SVG/HTML)"
        isExpanded={expandedSections.layers}
        onToggle={() => toggleSection('layers')}
        hasContent={(background.layers?.length || 0) > 0}
      >
        <BackgroundLayersEditor
          layers={background.layers || []}
          onChange={(layers) => onChange({ layers })}
        />
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({ title, isExpanded, onToggle, hasContent, children }: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  hasContent: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {title}
          {hasContent && <span className="w-2 h-2 rounded-full bg-purple-500" />}
        </span>
        {isExpanded ? (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function BackgroundImageEditor({ image, onChange }: {
  image?: BackgroundImage;
  onChange: (image: BackgroundImage | undefined) => void;
}) {
  const current = image || { url: '', size: 'cover', position: 'center', repeat: 'no-repeat' };

  const update = (updates: Partial<BackgroundImage>) => {
    const updated = { ...current, ...updates };
    onChange(updated.url ? updated : undefined);
  };

  return (
    <div className="space-y-2">
      <Field label="Image URL">
        <TextInput
          value={current.url}
          onChange={(v) => update({ url: v })}
          placeholder="https://example.com/image.jpg"
        />
      </Field>
      <Field label="Size">
        <SelectInput
          value={current.size || 'cover'}
          onChange={(v) => update({ size: v as BackgroundImage['size'] })}
          options={[
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'auto', label: 'Auto' },
            { value: '100% 100%', label: 'Stretch' },
          ]}
        />
      </Field>
      <Field label="Position">
        <SelectInput
          value={current.position || 'center'}
          onChange={(v) => update({ position: v })}
          options={[
            { value: 'center', label: 'Center' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'top left', label: 'Top Left' },
            { value: 'top right', label: 'Top Right' },
            { value: 'bottom left', label: 'Bottom Left' },
            { value: 'bottom right', label: 'Bottom Right' },
          ]}
        />
      </Field>
      <Field label="Repeat">
        <SelectInput
          value={current.repeat || 'no-repeat'}
          onChange={(v) => update({ repeat: v as BackgroundImage['repeat'] })}
          options={[
            { value: 'no-repeat', label: 'No Repeat' },
            { value: 'repeat', label: 'Repeat' },
            { value: 'repeat-x', label: 'Repeat Horizontally' },
            { value: 'repeat-y', label: 'Repeat Vertically' },
          ]}
        />
      </Field>
      <Field label="Attachment">
        <SelectInput
          value={current.attachment || 'scroll'}
          onChange={(v) => update({ attachment: v as BackgroundImage['attachment'] })}
          options={[
            { value: 'scroll', label: 'Scroll' },
            { value: 'fixed', label: 'Fixed (Parallax)' },
            { value: 'local', label: 'Local' },
          ]}
        />
      </Field>
      {image?.url && (
        <button
          onClick={() => onChange(undefined)}
          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Remove Image
        </button>
      )}
    </div>
  );
}

function GradientEditor({ gradient, onChange }: {
  gradient?: BackgroundGradient;
  onChange: (gradient: BackgroundGradient | undefined) => void;
}) {
  const current = gradient || {
    type: 'linear' as const,
    angle: 180,
    stops: [
      { color: '#6366f1', position: 0 },
      { color: '#8b5cf6', position: 100 },
    ],
  };

  const update = (updates: Partial<BackgroundGradient>) => {
    onChange({ ...current, ...updates });
  };

  const updateStop = (index: number, updates: Partial<{ color: string; position: number }>) => {
    const stops = [...current.stops];
    stops[index] = { ...stops[index], ...updates };
    update({ stops });
  };

  const addStop = () => {
    const stops = [...current.stops, { color: '#ffffff', position: 50 }];
    update({ stops });
  };

  const removeStop = (index: number) => {
    if (current.stops.length <= 2) return;
    const stops = current.stops.filter((_, i) => i !== index);
    update({ stops });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => onChange(gradient ? undefined : current)}
          className={`flex-1 text-xs py-1.5 rounded ${gradient ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
        >
          {gradient ? 'Enabled' : 'Enable Gradient'}
        </button>
      </div>

      {gradient && (
        <>
          <Field label="Type">
            <SelectInput
              value={current.type}
              onChange={(v) => update({ type: v as BackgroundGradient['type'] })}
              options={[
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
                { value: 'conic', label: 'Conic' },
              ]}
            />
          </Field>

          {(current.type === 'linear' || current.type === 'conic') && (
            <Field label="Angle">
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={current.angle || 180}
                  onChange={(e) => update({ angle: parseInt(e.target.value, 10) })}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{current.angle}°</span>
              </div>
            </Field>
          )}

          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color Stops</div>
          {current.stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) => updateStop(i, { position: parseInt(e.target.value, 10) })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{stop.position}%</span>
              {current.stops.length > 2 && (
                <button onClick={() => removeStop(i)} className="text-red-500 hover:text-red-700">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStop}
            className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
          >
            <PlusIcon className="w-3 h-3" /> Add Stop
          </button>

          {/* Gradient Preview */}
          <div
            className="h-8 rounded border border-gray-300 dark:border-gray-600"
            style={{
              background: current.type === 'linear'
                ? `linear-gradient(${current.angle}deg, ${current.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                : current.type === 'radial'
                  ? `radial-gradient(circle, ${current.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                  : `conic-gradient(from ${current.angle}deg, ${current.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
            }}
          />
        </>
      )}
    </div>
  );
}

function OverlayEditor({ overlay, onChange }: {
  overlay?: BackgroundOverlay;
  onChange: (overlay: BackgroundOverlay | undefined) => void;
}) {
  const current = overlay || { color: '#000000', opacity: 0.5, blendMode: 'normal' as const };

  const update = (updates: Partial<BackgroundOverlay>) => {
    onChange({ ...current, ...updates });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => onChange(overlay ? undefined : current)}
          className={`flex-1 text-xs py-1.5 rounded ${overlay ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
        >
          {overlay ? 'Enabled' : 'Enable Overlay'}
        </button>
      </div>

      {overlay && (
        <>
          <Field label="Color">
            <ColorInput value={current.color} onChange={(v) => update({ color: v })} />
          </Field>
          <Field label="Opacity">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(current.opacity * 100)}
                onChange={(e) => update({ opacity: parseInt(e.target.value, 10) / 100 })}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{Math.round(current.opacity * 100)}%</span>
            </div>
          </Field>
          <Field label="Blend Mode">
            <SelectInput
              value={current.blendMode || 'normal'}
              onChange={(v) => update({ blendMode: v as BackgroundOverlay['blendMode'] })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'multiply', label: 'Multiply' },
                { value: 'screen', label: 'Screen' },
                { value: 'overlay', label: 'Overlay' },
                { value: 'darken', label: 'Darken' },
                { value: 'lighten', label: 'Lighten' },
              ]}
            />
          </Field>
        </>
      )}
    </div>
  );
}

function BackgroundLayersEditor({ layers, onChange }: {
  layers: BackgroundLayer[];
  onChange: (layers: BackgroundLayer[]) => void;
}) {
  const addLayer = (type: 'svg' | 'html') => {
    const newLayer: BackgroundLayer = {
      id: `layer-${Date.now()}`,
      type,
      content: type === 'svg'
        ? '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <!-- Your SVG content -->\n</svg>'
        : '<div style="width: 100%; height: 100%;">\n  <!-- Your HTML content -->\n</div>',
      position: 'absolute',
      zIndex: 0,
      opacity: 1,
    };
    onChange([...layers, newLayer]);
  };

  const updateLayer = (id: string, updates: Partial<BackgroundLayer>) => {
    onChange(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
    onChange(layers.filter(l => l.id !== id));
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
    onChange(newLayers);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => addLayer('svg')}
          className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1"
        >
          <PlusIcon className="w-3 h-3" /> Add SVG
        </button>
        <button
          onClick={() => addLayer('html')}
          className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1"
        >
          <PlusIcon className="w-3 h-3" /> Add HTML
        </button>
      </div>

      {layers.map((layer, index) => (
        <div key={layer.id} className="border border-gray-200 dark:border-gray-700 rounded p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {layer.type.toUpperCase()} Layer {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveLayer(layer.id, 'up')}
                disabled={index === 0}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveLayer(layer.id, 'down')}
                disabled={index === layers.length - 1}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => removeLayer(layer.id)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Field label="Content">
            <textarea
              value={layer.content}
              onChange={(e) => updateLayer(layer.id, { content: e.target.value })}
              className="w-full h-24 text-xs font-mono p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder={layer.type === 'svg' ? 'Paste SVG code here...' : 'Paste HTML code here...'}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Z-Index">
              <input
                type="number"
                value={layer.zIndex ?? 0}
                onChange={(e) => updateLayer(layer.id, { zIndex: parseInt(e.target.value, 10) })}
                className="w-full text-xs p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </Field>
            <Field label="Opacity">
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((layer.opacity ?? 1) * 100)}
                  onChange={(e) => updateLayer(layer.id, { opacity: parseInt(e.target.value, 10) / 100 })}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-8">{Math.round((layer.opacity ?? 1) * 100)}%</span>
              </div>
            </Field>
          </div>
        </div>
      ))}

      {layers.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          No custom layers. Add SVG or HTML for decorative backgrounds.
        </p>
      )}
    </div>
  );
}

function NavigationEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, unknown>;
  const { websiteId, pageId } = usePageBuilder();
  const { pages: websitePages } = useWebsitePages(websiteId || '');
  const { pages: orgPages } = usePages();
  const pages = websiteId ? websitePages : orgPages;
  const links = (p.links as { text: string; href: string; pageId?: string }[]) || [];
  const useAutoLinks = (p.autoLinksFromWebsite as boolean) ?? true;

  const handleAutoPopulate = () => {
    const autoLinks = pages
      .filter(pg => pg.id !== pageId)
      .map(pg => ({ text: pg.attributes.name, href: `/${pg.attributes.slug}`, pageId: pg.id }));
    onChange({ links: autoLinks, autoLinksFromWebsite: true });
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ links: updated, autoLinksFromWebsite: false });
  };

  const addLink = () => {
    onChange({ links: [...links, { text: 'New Link', href: '#' }], autoLinksFromWebsite: false });
  };

  const removeLink = (index: number) => {
    onChange({ links: links.filter((_, i) => i !== index), autoLinksFromWebsite: false });
  };

  return (
    <div className="space-y-3">
      <Field label="Logo Text">
        <TextInput value={(p.logo as string) || ''} onChange={(v) => onChange({ logo: v })} placeholder="Your Logo" />
      </Field>
      <Field label="Background Color">
        <ColorInput value={(p.backgroundColor as string) || ''} onChange={(v) => onChange({ backgroundColor: v })} />
      </Field>
      <Field label="Text Color">
        <ColorInput value={(p.textColor as string) || ''} onChange={(v) => onChange({ textColor: v })} />
      </Field>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Navigation Links</span>
          {pages.length > 0 && (
            <button onClick={handleAutoPopulate} className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400">
              Auto from pages
            </button>
          )}
        </div>

        <div className="space-y-2">
          {links.map((link, i) => {
            const linkType = link.pageId !== undefined ? 'page' : 'custom';
            return (
              <div key={i} className="space-y-1.5 border border-gray-200 dark:border-gray-600 rounded p-2">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => updateLink(i, 'text', e.target.value)}
                    placeholder="Label"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button onClick={() => removeLink(i)} className="text-red-500 hover:text-red-700 text-xs px-1">&times;</button>
                </div>

                {/* Link type toggle */}
                <div className="flex gap-1">
                  {pages.length > 0 && (
                    <button
                      onClick={() => {
                        const updated = [...links];
                        if (linkType === 'page') {
                          updated[i] = { ...updated[i], pageId: undefined, href: '#' };
                        } else {
                          updated[i] = { ...updated[i], pageId: '', href: '' };
                        }
                        onChange({ links: updated, autoLinksFromWebsite: false });
                      }}
                      className={`px-2 py-0.5 text-xs rounded ${linkType === 'page' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                    >
                      Page
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const updated = [...links];
                      updated[i] = { ...updated[i], pageId: undefined };
                      onChange({ links: updated, autoLinksFromWebsite: false });
                    }}
                    className={`px-2 py-0.5 text-xs rounded ${linkType === 'custom' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    Custom URL
                  </button>
                </div>

                {/* Page selector or URL input */}
                {linkType === 'page' && pages.length > 0 ? (
                  <select
                    value={link.pageId || ''}
                    onChange={(e) => {
                      const selectedPage = pages.find(pg => pg.id === e.target.value);
                      if (selectedPage) {
                        const updated = [...links];
                        updated[i] = {
                          ...updated[i],
                          pageId: selectedPage.id,
                          href: `/${selectedPage.attributes.slug}`,
                          text: updated[i].text === 'New Link' || !updated[i].text ? selectedPage.attributes.name : updated[i].text,
                        };
                        onChange({ links: updated, autoLinksFromWebsite: false });
                      }
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select a page...</option>
                    {pages.filter(pg => pg.id !== pageId).map(pg => (
                      <option key={pg.id} value={pg.id}>{pg.attributes.name} (/{pg.attributes.slug})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(i, 'href', e.target.value)}
                    placeholder="https://... or /path"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>
            );
          })}
          <button onClick={addLink} className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400">
            + Add link
          </button>
        </div>
      </div>
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

function CarouselEditor({ node, onChange }: { node: PageComponentNode; onChange: (c: Record<string, unknown>) => void }) {
  const p = node.props as Record<string, unknown>;
  const items = (p.items as { image_url?: string; text?: string }[]) || [];
  const visibleCount = (p.visibleCount as number) || 1;
  const infinite = (p.infinite as boolean) ?? true;

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ items: updated });
  };

  const addItem = () => {
    onChange({ items: [...items, { image_url: '', text: `Slide ${items.length + 1}` }] });
  };

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ items: updated });
  };

  return (
    <div className="space-y-3">
      <Field label="Visible Items">
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max={Math.max(items.length, 1)}
            value={visibleCount}
            onChange={(e) => onChange({ visibleCount: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 tabular-nums w-6 text-right">{visibleCount}</span>
        </div>
      </Field>

      <Field label="Infinite Loop">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={infinite}
            onChange={(e) => onChange({ infinite: e.target.checked })}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Loop back to start</span>
        </label>
      </Field>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Slides ({items.length})</span>
          <button onClick={addItem} className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400">
            + Add slide
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Slide {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(i, 'up')}
                    disabled={i === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    &uarr;
                  </button>
                  <button
                    onClick={() => moveItem(i, 'down')}
                    disabled={i === items.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    &darr;
                  </button>
                  <button
                    onClick={() => removeItem(i)}
                    className="text-xs text-red-500 hover:text-red-700 px-1"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item.image_url || ''}
                onChange={(e) => updateItem(i, 'image_url', e.target.value)}
                placeholder="Image URL"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="text"
                value={item.text || ''}
                onChange={(e) => updateItem(i, 'text', e.target.value)}
                placeholder="Slide text"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          ))}
        </div>
      </div>
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

// ── Page link picker (for inter-page linking) ──────────────

function PageLinkPicker({ value, pageId: linkedPageId, onChange }: {
  value: string;
  pageId: string;
  onChange: (pageId: string, slug: string) => void;
}) {
  const { websiteId, pageId: currentPageId } = usePageBuilder();
  const { pages, loading } = useWebsitePages(websiteId || '');

  // Filter out current page
  const availablePages = pages.filter(p => p.id !== currentPageId);

  if (!websiteId) {
    return (
      <Field label="Page Link">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This page is not part of a website. Page linking requires a website.
        </p>
      </Field>
    );
  }

  return (
    <Field label="Link to Page">
      <select
        value={linkedPageId}
        onChange={(e) => {
          const page = availablePages.find(p => p.id === e.target.value);
          onChange(e.target.value, page ? `/${page.attributes.slug}` : '');
        }}
        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">{loading ? 'Loading pages...' : 'Choose a page...'}</option>
        {availablePages.map(page => (
          <option key={page.id} value={page.id}>
            {page.attributes.name} (/{page.attributes.slug})
          </option>
        ))}
      </select>
    </Field>
  );
}
