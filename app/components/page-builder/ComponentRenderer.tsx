import { usePageBuilder } from "./PageBuilderContext";
import SectionGrid from "./SectionGrid";
import EmbeddedForm from "./EmbeddedForm";
import type { PageComponentNode, PageTheme, PageThemeButton } from "~/lib/api/types";
import {
  Bars3Icon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Cog6ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import type { CSSProperties } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Theme helpers ──────────────────────────────────────────

/** Resolve the font styles for headings from the theme */
function headingFontStyle(theme: PageTheme): CSSProperties {
  const f = theme.fonts?.headings;
  if (!f) return {};
  return {
    fontFamily: f.fontFamily || undefined,
    fontWeight: (f.fontWeight as CSSProperties['fontWeight']) || undefined,
    lineHeight: f.lineHeight || undefined,
    letterSpacing: f.letterSpacing || undefined,
  };
}

/** Resolve the font styles for paragraphs from the theme */
function paragraphFontStyle(theme: PageTheme): CSSProperties {
  const f = theme.fonts?.paragraphs;
  if (!f) return {};
  return {
    fontFamily: f.fontFamily || undefined,
    fontWeight: (f.fontWeight as CSSProperties['fontWeight']) || undefined,
    lineHeight: f.lineHeight || undefined,
    letterSpacing: f.letterSpacing || undefined,
  };
}

/** Resolve the font styles for buttons from the theme */
function buttonFontStyle(theme: PageTheme): CSSProperties {
  const f = theme.fonts?.buttons;
  if (!f) return {};
  return {
    fontFamily: f.fontFamily || undefined,
    fontWeight: (f.fontWeight as CSSProperties['fontWeight']) || undefined,
    lineHeight: f.lineHeight || undefined,
    letterSpacing: f.letterSpacing || undefined,
  };
}

/** Build inline button styles from theme button config + color palette */
function resolveButtonStyle(theme: PageTheme, variant: string): CSSProperties {
  const palette = theme.colorPalette;
  const btnConfig: PageThemeButton | undefined = theme.buttons?.[variant as keyof typeof theme.buttons];
  const btnStyle = btnConfig?.style || 'solid';
  const btnShape = btnConfig?.shape || 'rounded';

  // Derive colors from palette
  const primaryColor = palette?.color1 || '#7c3aed';
  const lightColor = palette?.color5 || '#ffffff';

  let bg: string;
  let textColor: string;
  let border: string;

  if (variant === 'primary') {
    bg = btnStyle === 'solid' ? primaryColor : 'transparent';
    textColor = btnStyle === 'solid' ? lightColor : primaryColor;
    border = `2px solid ${primaryColor}`;
  } else if (variant === 'secondary') {
    const secondaryColor = palette?.color2 || '#a78bfa';
    bg = btnStyle === 'solid' ? secondaryColor : 'transparent';
    textColor = btnStyle === 'solid' ? lightColor : secondaryColor;
    border = `2px solid ${secondaryColor}`;
  } else {
    // tertiary / outline
    bg = 'transparent';
    textColor = primaryColor;
    border = `2px solid ${primaryColor}`;
  }

  const borderRadius = btnShape === 'pill' ? '9999px' : btnShape === 'rounded' ? '0.375rem' : '0';

  return {
    backgroundColor: bg,
    color: textColor,
    border,
    borderRadius,
    ...buttonFontStyle(theme),
  };
}

// ── Size maps ──────────────────────────────────────────────

const HEADING_SIZES: Record<string, string> = {
  heading_1: '2.25rem',
  heading_2: '1.875rem',
  heading_3: '1.5rem',
  heading_4: '1.25rem',
};

const PARAGRAPH_SIZES: Record<string, string> = {
  paragraph_1: '1rem',
  paragraph_2: '0.875rem',
  paragraph_3: '0.75rem',
};

const actionBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '3px',
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  padding: 0,
};

// ── Main renderer ──────────────────────────────────────────

interface ComponentRendererProps {
  node: PageComponentNode;
  depth?: number;
}

export default function ComponentRenderer({ node, depth = 0 }: ComponentRendererProps) {
  const { selectedSelector, select, removeComponent, moveComponent, duplicateComponent, editMode } = usePageBuilder();
  const isSelected = selectedSelector === node.selector;
  const children = node.props.children as PageComponentNode[] | undefined;

  const renderContent = () => {
    switch (node.type) {
      case 'Text':
        return <TextComponent node={node} />;
      case 'Image':
        return <ImageComponent node={node} />;
      case 'ContentButton':
        return <ButtonComponent node={node} />;
      case 'ContentVideo':
        return <VideoComponent node={node} />;
      case 'ContentDivider':
        return <DividerComponent />;
      case 'IconItem':
        return <IconComponent node={node} />;
      case 'BoxItem':
        return <BoxComponent node={node} />;
      case 'ContentList':
        return <ListComponent node={node} />;
      case 'ContentAccordion':
        return <AccordionComponent node={node} />;
      case 'FormEmbed':
        return <FormEmbedComponent node={node} />;
      case 'ProductEmbed':
        return <ProductEmbedComponent node={node} />;
      case 'Section':
        return <SectionComponent node={node} />;
      case 'Navigation':
        return <NavigationComponent node={node} />;
      case 'Footer':
        return <FooterComponent node={node} />;
      default:
        if (children && children.length > 0) {
          return (
            <div>
              {children.map((child) => (
                <ComponentRenderer key={child.selector} node={child} depth={depth + 1} />
              ))}
            </div>
          );
        }
        return <div className="p-2 text-xs text-gray-400">Unknown: {node.type}</div>;
    }
  };

  // Root container: render with section reordering
  if (node.selector === '0' || node.type === 'Theme') {
    return <RootContainer node={node} depth={depth} />;
  }

  return (
    <div
      className={`relative group ${editMode ? 'cursor-pointer' : ''}`}
      style={{
        outline: isSelected ? '2px solid #7c3aed' : undefined,
        outlineOffset: '-1px',
        borderRadius: '4px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (editMode) select(node.selector);
      }}
    >
      {/* Floating action bar — inside the component, top-right corner */}
      {editMode && isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: '#7c3aed',
            color: '#fff',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.625rem',
            fontWeight: 500,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ marginRight: '4px' }}>{node.type}</span>
          <button
            onClick={(e) => { e.stopPropagation(); duplicateComponent(node.selector); }}
            style={actionBtnStyle}
            title="Duplicate"
          >
            <DocumentDuplicateIcon style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeComponent(node.selector); }}
            style={{ ...actionBtnStyle, backgroundColor: 'rgba(239,68,68,0.8)' }}
            title="Delete"
          >
            <TrashIcon style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        </div>
      )}

      {/* Hover outline for non-selected items */}
      {editMode && !isSelected && (
        <div
          className="opacity-0 group-hover:opacity-100"
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px dashed rgba(124,58,237,0.4)',
            borderRadius: '4px',
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
          }}
        />
      )}

      {renderContent()}
    </div>
  );
}

// ── Individual Component Renderers ─────────────────────────

function TextComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { tagType, verbiage, textAlign, color } = node.props as Record<string, string>;
  const palette = theme.colorPalette;

  const isHeading = tagType?.startsWith('heading');
  const Tag = isHeading ? (`h${tagType.split('_')[1]}` as keyof JSX.IntrinsicElements) : 'p';

  // Build font style from theme
  const baseFontStyle = isHeading ? headingFontStyle(theme) : paragraphFontStyle(theme);
  const fontSize = isHeading ? HEADING_SIZES[tagType] : PARAGRAPH_SIZES[tagType];
  const fontWeight = isHeading ? 'bold' : undefined;

  // Resolve color: per-component override > theme palette > default
  // Headings use color4 (dark), paragraphs use color4 as well
  const defaultColor = isHeading
    ? palette?.color4 || '#1e1b4b'
    : palette?.color4 || '#374151';

  const resolvedColor = color || defaultColor;

  return (
    <Tag
      style={{
        ...baseFontStyle,
        fontSize,
        fontWeight: baseFontStyle.fontWeight || fontWeight,
        textAlign: (textAlign as CSSProperties['textAlign']) || 'left',
        color: resolvedColor,
        margin: 0,
        padding: '0.5rem 0',
      }}
    >
      {verbiage || 'Enter text...'}
    </Tag>
  );
}

function ImageComponent({ node }: { node: PageComponentNode }) {
  const { src, alt, objectFit, radiusType } = node.props as Record<string, string>;
  const borderRadius = radiusType === 'rounded' ? '0.5rem' : radiusType === 'circle' ? '50%' : '0';

  if (!src) {
    return (
      <div
        style={{ borderRadius, backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}
      >
        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No image selected</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius,
        objectFit: (objectFit as CSSProperties['objectFit']) || 'cover',
      }}
    />
  );
}

function ButtonComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { text, buttonType } = node.props as Record<string, string>;
  const variant = buttonType || 'primary';

  const btnStyle = resolveButtonStyle(theme, variant);

  return (
    <button
      style={{
        ...btnStyle,
        padding: theme.buttons?.[variant as keyof typeof theme.buttons]?.padding || '0.625rem 1.5rem',
        fontSize: '0.875rem',
        fontWeight: btnStyle.fontWeight || '500',
        cursor: 'pointer',
        display: 'inline-block',
        textDecoration: 'none',
      }}
    >
      {text || 'Button'}
    </button>
  );
}

function VideoComponent({ node }: { node: PageComponentNode }) {
  const { video } = node.props as Record<string, string>;
  if (!video) {
    return (
      <div style={{ backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem', borderRadius: '0.5rem' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No video URL set</span>
      </div>
    );
  }

  const embedUrl = video.includes('youtube') ? video.replace('watch?v=', 'embed/') : video;
  return (
    <div style={{ aspectRatio: '16/9' }}>
      <iframe src={embedUrl} style={{ width: '100%', height: '100%', borderRadius: '0.5rem', border: 'none' }} allowFullScreen title="Video" />
    </div>
  );
}

function DividerComponent() {
  const { theme } = usePageBuilder();
  const palette = theme.colorPalette;

  return (
    <hr style={{
      margin: '1rem 0',
      border: 'none',
      borderTop: `1px solid ${palette?.color2 || '#e5e7eb'}`,
    }} />
  );
}

function IconComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { icon, color } = node.props as Record<string, string>;
  const palette = theme.colorPalette;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
      <span style={{ fontSize: '1.5rem', color: color || palette?.color1 || '#7c3aed' }}>
        {icon || '\u2605'}
      </span>
    </div>
  );
}

function BoxComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { color, radiusType } = node.props as Record<string, string>;
  const children = node.props.children as PageComponentNode[] | undefined;
  const palette = theme.colorPalette;

  const borderRadius = radiusType === 'pill' ? '9999px' : radiusType === 'rounded' ? '0.5rem' : '0';

  return (
    <div style={{ padding: '1rem', borderRadius, backgroundColor: color || palette?.color3 || '#f3f4f6' }}>
      {children?.map((child) => (
        <ComponentRenderer key={child.selector} node={child} />
      ))}
      {(!children || children.length === 0) && (
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', padding: '1rem 0' }}>Drop components here</div>
      )}
    </div>
  );
}

function ListComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const children = node.props.children as PageComponentNode[] | undefined;
  const palette = theme.colorPalette;

  return (
    <ul style={{ listStyle: 'disc', listStylePosition: 'inside', padding: '0.5rem 0', color: palette?.color4 || '#374151' }}>
      {children?.map((child) => (
        <li key={child.selector}>
          <ComponentRenderer node={child} />
        </li>
      ))}
      {(!children || children.length === 0) && (
        <li style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Empty list</li>
      )}
    </ul>
  );
}

function AccordionComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const children = node.props.children as PageComponentNode[] | undefined;
  const palette = theme.colorPalette;

  return (
    <div style={{ border: `1px solid ${palette?.color2 || '#e5e7eb'}`, borderRadius: '0.5rem', overflow: 'hidden' }}>
      {children?.map((child, i) => (
        <details key={child.selector} style={{ padding: '1rem', borderTop: i > 0 ? `1px solid ${palette?.color2 || '#e5e7eb'}` : undefined }} open={i === 0}>
          <summary style={{ cursor: 'pointer', fontWeight: 500, color: palette?.color4 || '#1f2937', ...headingFontStyle(theme) }}>
            Section {i + 1}
          </summary>
          <div style={{ marginTop: '0.5rem' }}>
            <ComponentRenderer node={child} />
          </div>
        </details>
      ))}
      {(!children || children.length === 0) && (
        <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.875rem' }}>Empty accordion</div>
      )}
    </div>
  );
}

function SectionComponent({ node }: { node: PageComponentNode }) {
  return <SectionGrid node={node} />;
}

// ── Root container with sortable sections ──────────────────

function RootContainer({ node, depth }: { node: PageComponentNode; depth: number }) {
  const { editMode, reorderSections, select, addComponent, removeComponent, theme } = usePageBuilder();
  const children = (node.props.children as PageComponentNode[]) || [];
  const palette = theme.colorPalette;

  // Separate pinned (nav/footer) from sortable sections
  const nav = children.find((c) => c.type === 'Navigation');
  const footer = children.find((c) => c.type === 'Footer');
  const sections = children.filter((c) => c.type !== 'Navigation' && c.type !== 'Footer' && c.type !== 'Theme');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = sections.findIndex((s) => s.selector === active.id);
    const toIdx = sections.findIndex((s) => s.selector === over.id);
    if (fromIdx !== -1 && toIdx !== -1) {
      reorderSections(fromIdx, toIdx);
    }
  };

  return (
    <div>
      {/* Navigation - pinned at top */}
      {nav && (
        <PinnedWrapper node={nav} label="Navigation" onSelect={() => select(nav.selector)}>
          <ComponentRenderer node={nav} depth={depth + 1} />
        </PinnedWrapper>
      )}

      {/* Sortable sections */}
      {editMode ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.selector)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SortableSection key={section.selector} node={section} depth={depth + 1} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        sections.map((section) => (
          <ComponentRenderer key={section.selector} node={section} depth={depth + 1} />
        ))
      )}

      {/* Add section button */}
      {editMode && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <button
            onClick={() => addComponent('0', 'Section')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              border: `2px dashed ${palette?.color2 || '#d1d5db'}`,
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <PlusIcon style={{ width: '1rem', height: '1rem' }} />
            Add Section
          </button>
        </div>
      )}

      {/* Footer - pinned at bottom */}
      {footer && (
        <PinnedWrapper node={footer} label="Footer" onSelect={() => select(footer.selector)}>
          <ComponentRenderer node={footer} depth={depth + 1} />
        </PinnedWrapper>
      )}
    </div>
  );
}

/** Wrapper for pinned elements (nav/footer) showing edit affordance */
function PinnedWrapper({ node, label, onSelect, children: childContent }: {
  node: PageComponentNode;
  label: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const { editMode, selectedSelector } = usePageBuilder();
  const isSelected = selectedSelector === node.selector;

  return (
    <div
      style={{ position: 'relative' }}
      onClick={(e) => {
        e.stopPropagation();
        if (editMode) onSelect();
      }}
    >
      {editMode && (
        <div
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.5rem',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: isSelected ? '#7c3aed' : 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 500,
            cursor: 'pointer',
            opacity: isSelected ? 1 : 0.7,
          }}
        >
          <Cog6ToothIcon style={{ width: '0.75rem', height: '0.75rem' }} />
          {label}
        </div>
      )}
      <div style={{ outline: isSelected ? '2px solid #7c3aed' : undefined, outlineOffset: '-2px' }}>
        {childContent}
      </div>
    </div>
  );
}

/** Sortable section wrapper for drag-reordering */
function SortableSection({ node, depth }: { node: PageComponentNode; depth: number }) {
  const { selectedSelector, select, removeComponent, theme } = usePageBuilder();
  const palette = theme.colorPalette;
  const isSelected = selectedSelector === node.selector;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.selector });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    outline: isSelected ? '2px solid #7c3aed' : undefined,
    outlineOffset: '-2px',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        // Select section when clicking on the section background (not a child component)
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          select(node.selector);
        }
      }}
    >
      {/* Section toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '0.25rem',
          left: '0.5rem',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.125rem 0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: isSelected ? '#7c3aed' : 'rgba(0,0,0,0.4)',
          color: '#fff',
          fontSize: '0.625rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        onClick={(e) => { e.stopPropagation(); select(node.selector); }}
      >
        {/* Drag handle */}
        <span {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <Bars3Icon style={{ width: '0.75rem', height: '0.75rem' }} />
        </span>
        <span>Section</span>
        <button
          onClick={(e) => { e.stopPropagation(); removeComponent(node.selector); }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#fff', padding: 0 }}
          title="Remove section"
        >
          <TrashIcon style={{ width: '0.75rem', height: '0.75rem' }} />
        </button>
      </div>

      <SectionGrid node={node} />
    </div>
  );
}


function NavigationComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { logo, links, backgroundColor, textColor } = node.props as {
    logo?: string;
    links?: { text: string; href: string }[];
    backgroundColor?: string;
    textColor?: string;
  };
  const palette = theme.colorPalette;

  const navBg = backgroundColor || palette?.color5 || '#ffffff';
  const navTextColor = textColor || palette?.color4 || '#1f2937';
  const linkColor = palette?.color4 || '#6b7280';

  return (
    <nav style={{
      backgroundColor: navBg,
      borderBottom: `1px solid ${palette?.color2 || '#e5e7eb'}`,
      padding: '1rem 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: '1.125rem',
          color: navTextColor,
          ...headingFontStyle(theme),
        }}>
          {logo || 'Your Logo'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {(links || [{ text: 'Home', href: '#' }, { text: 'About', href: '#' }, { text: 'Contact', href: '#' }]).map((link, i) => (
            <span key={i} style={{
              fontSize: '0.875rem',
              color: linkColor,
              cursor: 'pointer',
              ...paragraphFontStyle(theme),
            }}>
              {link.text}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}

function FooterComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { text, backgroundColor, textColor } = node.props as {
    text?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  const palette = theme.colorPalette;

  const footerBg = backgroundColor || palette?.color4 || '#1e1b4b';
  const footerTextColor = textColor || palette?.color2 || '#a78bfa';

  return (
    <footer style={{
      backgroundColor: footerBg,
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: '0.875rem',
        color: footerTextColor,
        ...paragraphFontStyle(theme),
      }}>
        {text || '\u00A9 2026 Your Company. All rights reserved.'}
      </div>
    </footer>
  );
}

function FormEmbedComponent({ node }: { node: PageComponentNode }) {
  const { theme, editMode } = usePageBuilder();
  const { formId, formName } = node.props as { formId?: string; formName?: string };
  const palette = theme.colorPalette;

  if (!formId) {
    return (
      <div style={{
        border: `2px dashed ${palette?.color1 || '#7c3aed'}40`,
        borderRadius: '0.5rem',
        padding: '1.5rem',
        backgroundColor: `${palette?.color1 || '#7c3aed'}08`,
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: `${palette?.color1 || '#7c3aed'}20`,
            color: palette?.color1 || '#7c3aed',
            marginBottom: '0.5rem',
          }}>
            Form Embed
          </span>
          <p style={{ fontSize: '0.875rem', color: palette?.color4 || '#6b7280', ...paragraphFontStyle(theme) }}>
            No form selected &mdash; click to configure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Edit mode badge */}
      {editMode && (
        <div style={{
          position: 'absolute',
          top: '0.25rem',
          right: '0.25rem',
          zIndex: 10,
          padding: '0.125rem 0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: `${palette?.color1 || '#7c3aed'}`,
          color: '#fff',
          fontSize: '0.625rem',
          fontWeight: 500,
        }}>
          Form: {formName || 'Embedded'}
        </div>
      )}
      <EmbeddedForm formId={formId} />
    </div>
  );
}

function ProductEmbedComponent({ node }: { node: PageComponentNode }) {
  const { theme } = usePageBuilder();
  const { productId, productName } = node.props as { productId?: string; productName?: string };
  const palette = theme.colorPalette;

  const accentColor = palette?.color1 || '#059669';

  return (
    <div style={{
      border: `2px dashed ${accentColor}40`,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      backgroundColor: `${accentColor}08`,
    }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: `${accentColor}20`,
          color: accentColor,
          marginBottom: '0.5rem',
        }}>
          Product Embed
        </span>
        <p style={{ fontSize: '0.875rem', color: palette?.color4 || '#6b7280', ...paragraphFontStyle(theme) }}>
          {productId ? `Product: ${productName || productId}` : 'No product selected \u2014 click to configure'}
        </p>
      </div>
    </div>
  );
}
