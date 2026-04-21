import { usePageBuilder } from "./PageBuilderContext";
import type { PageComponentNode, PageTheme, PageThemeButton } from "~/lib/api/types";
import {
  Bars3Icon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import type { CSSProperties } from "react";

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

  // Root container doesn't get selection UI
  if (node.selector === '0' || node.type === 'Theme') {
    return (
      <div>
        {children?.map((child) => (
          <ComponentRenderer key={child.selector} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative group ${editMode ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : editMode ? 'hover:ring-1 hover:ring-purple-300' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (editMode) select(node.selector);
      }}
    >
      {/* Edit toolbar */}
      {editMode && isSelected && (
        <div className="absolute -top-8 left-0 z-10 flex items-center space-x-1 bg-purple-600 text-white rounded-t px-2 py-1 text-xs">
          <span className="font-medium mr-2">{node.type}</span>
          <button onClick={(e) => { e.stopPropagation(); moveComponent(node.selector, 'up'); }} className="hover:bg-purple-700 p-0.5 rounded" title="Move Up">
            <ArrowUpIcon className="h-3 w-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); moveComponent(node.selector, 'down'); }} className="hover:bg-purple-700 p-0.5 rounded" title="Move Down">
            <ArrowDownIcon className="h-3 w-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); duplicateComponent(node.selector); }} className="hover:bg-purple-700 p-0.5 rounded" title="Duplicate">
            <DocumentDuplicateIcon className="h-3 w-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); removeComponent(node.selector); }} className="hover:bg-red-600 p-0.5 rounded" title="Remove">
            <TrashIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Drag handle (visible on hover in edit mode) */}
      {editMode && (
        <div className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Bars3Icon className="h-4 w-4 text-gray-400" />
        </div>
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
  const { theme, addComponent } = usePageBuilder();
  const children = node.props.children as PageComponentNode[] | undefined;
  const palette = theme.colorPalette;

  return (
    <div style={{
      padding: '2rem 1rem',
      minHeight: '120px',
      backgroundColor: palette?.color5 || '#ffffff',
    }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
          {children?.map((child) => {
            const span = child.grid?.lg?.w || 12;
            return (
              <div key={child.selector} style={{ gridColumn: `span ${Math.min(span, 12)}` }}>
                <ComponentRenderer node={child} />
              </div>
            );
          })}
        </div>
        {(!children || children.length === 0) && (
          <div
            style={{
              border: `2px dashed ${palette?.color2 || '#d1d5db'}`,
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={(e) => { e.stopPropagation(); addComponent(node.selector, 'Text'); }}
          >
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Click to add a component to this section</span>
          </div>
        )}
      </div>
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
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        maxWidth: '72rem',
        margin: '0 auto',
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
  const { theme } = usePageBuilder();
  const { formId, formName } = node.props as { formId?: string; formName?: string };
  const palette = theme.colorPalette;

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
          {formId ? `Form: ${formName || formId}` : 'No form selected \u2014 click to configure'}
        </p>
      </div>
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
