import { useEmailBuilder } from "./EmailBuilderContext";
import type { EmailComponentNode, EmailTheme } from "~/lib/api/types";
import {
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import type { CSSProperties } from "react";

/** Renders the email component list with web-preview styles (not table HTML) */
export default function EmailComponentRenderer() {
  const { components, selectedId, select, removeComponent, moveComponent, duplicateComponent, theme } = useEmailBuilder();

  if (components.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
        <p style={{ fontSize: '0.875rem' }}>No components yet. Use the palette to add content.</p>
      </div>
    );
  }

  return (
    <div>
      {components.map((comp) => (
        <EmailComponentItem
          key={comp.id}
          node={comp}
          theme={theme}
          isSelected={selectedId === comp.id}
          onSelect={() => select(comp.id)}
          onRemove={() => removeComponent(comp.id)}
          onMoveUp={() => moveComponent(comp.id, 'up')}
          onMoveDown={() => moveComponent(comp.id, 'down')}
          onDuplicate={() => duplicateComponent(comp.id)}
        />
      ))}
    </div>
  );
}

function EmailComponentItem({ node, theme, isSelected, onSelect, onRemove, onMoveUp, onMoveDown, onDuplicate }: {
  node: EmailComponentNode;
  theme: EmailTheme;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}) {
  const s = { ...DEFAULTS, ...theme };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        outline: isSelected ? '2px solid #7c3aed' : undefined,
        outlineOffset: '-1px',
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: '2px', right: '2px', zIndex: 10,
          display: 'flex', gap: '2px', backgroundColor: '#7c3aed', borderRadius: '4px',
          padding: '2px 6px', fontSize: '0.625rem', color: '#fff', fontWeight: 500,
        }}>
          <span style={{ marginRight: '4px' }}>{LABELS[node.type] || node.type}</span>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} style={btnStyle} title="Move up"><ArrowUpIcon style={iconStyle} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} style={btnStyle} title="Move down"><ArrowDownIcon style={iconStyle} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} style={btnStyle} title="Duplicate"><DocumentDuplicateIcon style={iconStyle} /></button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ ...btnStyle, backgroundColor: 'rgba(239,68,68,0.8)' }} title="Delete"><TrashIcon style={iconStyle} /></button>
        </div>
      )}
      {renderPreview(node, s)}
    </div>
  );
}

const DEFAULTS: Required<EmailTheme> = {
  bodyBg: '#f4f4f5', contentBg: '#ffffff', primaryColor: '#7c3aed',
  textColor: '#374151', headingColor: '#111827', linkColor: '#7c3aed',
  fontFamily: "Arial, Helvetica, sans-serif",
  headingFontSize: '24px', bodyFontSize: '16px', smallFontSize: '13px',
};

const LABELS: Record<string, string> = {
  EmailHeader: 'Header', EmailText: 'Text', EmailImage: 'Image', EmailButton: 'Button',
  EmailDivider: 'Divider', EmailSpacer: 'Spacer', EmailColumns: 'Columns',
  EmailSocial: 'Social', EmailFooter: 'Footer', EmailHtml: 'HTML',
};

const btnStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.25rem', height: '1.25rem', borderRadius: '3px', border: 'none', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', padding: 0 };
const iconStyle: CSSProperties = { width: '0.75rem', height: '0.75rem' };

function renderPreview(node: EmailComponentNode, s: Required<EmailTheme>) {
  const p = node.props as Record<string, any>;

  switch (node.type) {
    case 'EmailHeader':
      return (
        <div style={{ padding: '24px 40px', textAlign: 'center', backgroundColor: p.backgroundColor || s.contentBg }}>
          {p.logoUrl
            ? <img src={p.logoUrl} alt={p.logoAlt || ''} style={{ maxWidth: p.logoWidth ? `${p.logoWidth}px` : '150px', height: 'auto' }} />
            : <span style={{ fontSize: '22px', fontWeight: 'bold', color: s.headingColor, fontFamily: s.fontFamily }}>{p.logoAlt || 'Your Logo'}</span>
          }
        </div>
      );

    case 'EmailText': {
      const isH = p.textType === 'heading';
      const textContent = p.content || 'Your text here';
      // Check if content contains HTML tags (like <br>, <a>, <strong>, etc.)
      const hasHtml = /<[^>]+>/.test(textContent);
      return (
        <div
          style={{ padding: '8px 40px', fontFamily: s.fontFamily, fontSize: isH ? s.headingFontSize : s.bodyFontSize, fontWeight: isH ? 'bold' : 'normal', color: p.color || (isH ? s.headingColor : s.textColor), textAlign: p.align || 'left', lineHeight: 1.6 }}
          {...(hasHtml ? { dangerouslySetInnerHTML: { __html: textContent } } : { children: textContent })}
        />
      );
    }

    case 'EmailImage':
      return (
        <div style={{ padding: '0', textAlign: 'center' }}>
          {p.src
            ? <img src={p.src} alt={p.alt || ''} style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '0 auto' }} />
            : <div style={{ padding: '40px', backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '0.875rem' }}>No image — set URL in editor</div>
          }
        </div>
      );

    case 'EmailButton':
      return (
        <div style={{ padding: '16px 40px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '12px 32px', backgroundColor: p.bgColor || s.primaryColor, color: p.textColor || '#ffffff', borderRadius: `${p.borderRadius || 6}px`, fontFamily: s.fontFamily, fontSize: s.bodyFontSize, fontWeight: 'bold', textDecoration: 'none' }}>
            {p.text || 'Click Here'}
          </span>
        </div>
      );

    case 'EmailDivider':
      return (
        <div style={{ padding: '8px 40px' }}>
          <hr style={{ border: 'none', borderTop: `${p.thickness || 1}px solid ${p.color || '#e5e7eb'}`, margin: 0 }} />
        </div>
      );

    case 'EmailSpacer':
      return <div style={{ height: `${p.height || 24}px` }} />;

    case 'EmailColumns': {
      const cols = p.columns || 2;
      const content = p.columnContent || [];
      return (
        <div style={{ padding: '8px 30px', display: 'flex', gap: '10px' }}>
          {Array.from({ length: cols }).map((_, i) => {
            const cellContent = content[i]?.content || `Column ${i + 1}`;
            // Check if content contains HTML tags
            const hasHtml = /<[^>]+>/.test(cellContent);
            return (
              <div
                key={i}
                style={{ flex: 1, padding: '10px', fontSize: s.bodyFontSize, color: s.textColor, fontFamily: s.fontFamily, lineHeight: 1.6, backgroundColor: '#f9fafb', borderRadius: '4px', minHeight: '40px' }}
                {...(hasHtml ? { dangerouslySetInnerHTML: { __html: cellContent } } : { children: cellContent })}
              />
            );
          })}
        </div>
      );
    }

    case 'EmailSocial': {
      const networks = p.networks || [];
      return (
        <div style={{ padding: '16px 40px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', gap: '12px' }}>
            {networks.map((n: any, i: number) => (
              <span key={i} style={{ fontSize: s.smallFontSize, color: s.linkColor, fontFamily: s.fontFamily }}>{n.name}</span>
            ))}
          </div>
        </div>
      );
    }

    case 'EmailFooter': {
      const footerText = p.text || '© 2026 Company';
      const hasHtml = /<[^>]+>/.test(footerText);
      return (
        <div style={{ padding: '24px 40px', textAlign: 'center', fontSize: s.smallFontSize, color: '#9ca3af', fontFamily: s.fontFamily, lineHeight: 1.6 }}>
          {hasHtml ? <span dangerouslySetInnerHTML={{ __html: footerText }} /> : footerText}
          {p.companyAddress && <><br />{p.companyAddress}</>}
          {p.unsubscribeUrl && <><br /><span style={{ color: s.linkColor, textDecoration: 'underline' }}>Unsubscribe</span></>}
        </div>
      );
    }

    case 'EmailHtml':
      return (
        <div style={{ padding: '8px 40px', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', backgroundColor: '#f9fafb', minHeight: '40px' }}>
          {p.html ? <div dangerouslySetInnerHTML={{ __html: p.html }} /> : '<html block>'}
        </div>
      );

    default:
      return <div style={{ padding: '8px', color: '#9ca3af' }}>Unknown: {node.type}</div>;
  }
}
