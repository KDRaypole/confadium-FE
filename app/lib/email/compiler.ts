import type { EmailComponentNode, EmailTheme } from '~/lib/api/types';

const DEFAULTS: Required<EmailTheme> = {
  bodyBg: '#f4f4f5',
  contentBg: '#ffffff',
  primaryColor: '#7c3aed',
  textColor: '#374151',
  headingColor: '#111827',
  linkColor: '#7c3aed',
  fontFamily: "Arial, Helvetica, sans-serif",
  headingFontSize: '24px',
  bodyFontSize: '16px',
  smallFontSize: '13px',
};

function t(theme: EmailTheme): Required<EmailTheme> {
  return { ...DEFAULTS, ...theme };
}

/** Escape HTML entities */
function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Compiles an array of email components + theme into email-safe HTML.
 * Produces table-based layout with inline styles compatible with
 * Gmail, Outlook, Apple Mail, and Yahoo Mail.
 */
export function compileEmailHtml(components: EmailComponentNode[], theme: EmailTheme): string {
  const s = t(theme);

  const rows = components.map((c) => compileComponent(c, s)).join('\n');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${s.linkColor}; text-decoration: underline; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-column { display: block !important; width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${s.bodyBg};font-family:${s.fontFamily};color:${s.textColor};font-size:${s.bodyFontSize};line-height:1.6;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${s.bodyBg};">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${s.contentBg};border-radius:8px;overflow:hidden;">
${rows}
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function compileComponent(node: EmailComponentNode, s: Required<EmailTheme>): string {
  switch (node.type) {
    case 'EmailHeader': return compileHeader(node, s);
    case 'EmailText': return compileText(node, s);
    case 'EmailImage': return compileImage(node, s);
    case 'EmailButton': return compileButton(node, s);
    case 'EmailDivider': return compileDivider(node, s);
    case 'EmailSpacer': return compileSpacer(node);
    case 'EmailColumns': return compileColumns(node, s);
    case 'EmailSocial': return compileSocial(node, s);
    case 'EmailFooter': return compileFooter(node, s);
    case 'EmailHtml': return compileRawHtml(node);
    default: return '';
  }
}

function compileHeader(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { logoUrl, logoAlt, logoWidth, backgroundColor } = node.props as Record<string, string>;
  const bg = backgroundColor || s.contentBg;
  const width = logoWidth || '150';

  return `          <tr>
            <td align="center" style="padding:24px 40px;background-color:${bg};" bgcolor="${bg}">
              ${logoUrl
                ? `<img src="${esc(logoUrl)}" alt="${esc(logoAlt || '')}" width="${width}" style="display:block;max-width:${width}px;width:100%;height:auto;">`
                : `<p style="margin:0;font-size:22px;font-weight:bold;color:${s.headingColor};font-family:${s.fontFamily};">${esc(logoAlt || 'Your Logo')}</p>`
              }
            </td>
          </tr>`;
}

function compileText(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { content, textType, align, color } = node.props as Record<string, string>;
  const isHeading = textType === 'heading';
  const fontSize = isHeading ? s.headingFontSize : s.bodyFontSize;
  const fontWeight = isHeading ? 'bold' : 'normal';
  const textColor = color || (isHeading ? s.headingColor : s.textColor);
  const tag = isHeading ? 'h2' : 'p';

  return `          <tr>
            <td style="padding:8px 40px;font-family:${s.fontFamily};font-size:${fontSize};line-height:1.6;color:${textColor};text-align:${align || 'left'};">
              <${tag} style="margin:0;font-size:${fontSize};font-weight:${fontWeight};color:${textColor};font-family:${s.fontFamily};">${content || ''}</${tag}>
            </td>
          </tr>`;
}

function compileImage(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { src, alt, width, linkUrl } = node.props as Record<string, string>;
  const w = width || '600';
  const imgTag = `<img src="${esc(src || '')}" alt="${esc(alt || '')}" width="${w}" style="display:block;max-width:${w}px;width:100%;height:auto;border:0;">`;
  const wrapped = linkUrl ? `<a href="${esc(linkUrl)}" target="_blank">${imgTag}</a>` : imgTag;

  return `          <tr>
            <td align="center" style="padding:0;">
              ${wrapped}
            </td>
          </tr>`;
}

function compileButton(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { text, url, bgColor, textColor, borderRadius, width } = node.props as Record<string, string>;
  const bg = bgColor || s.primaryColor;
  const tc = textColor || '#ffffff';
  const br = borderRadius || '6';
  const w = width || '200';
  const href = esc(url || '#');

  return `          <tr>
            <td align="center" style="padding:16px 40px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:${w}px;" arcsize="${Math.round(parseInt(br) / 44 * 100)}%" fillcolor="${bg}">
                <w:anchorlock/>
                <center style="color:${tc};font-family:${s.fontFamily};font-size:${s.bodyFontSize};font-weight:bold;">${esc(text || 'Click Here')}</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:${bg};border-radius:${br}px;padding:12px 32px;" bgcolor="${bg}">
                    <a href="${href}" target="_blank" style="display:inline-block;color:${tc};font-family:${s.fontFamily};font-size:${s.bodyFontSize};font-weight:bold;text-decoration:none;line-height:1.2;">${esc(text || 'Click Here')}</a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>`;
}

function compileDivider(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { color, thickness } = node.props as Record<string, string>;
  const c = color || '#e5e7eb';
  const th = thickness || '1';

  return `          <tr>
            <td style="padding:8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:${th}px solid ${c};font-size:1px;line-height:1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function compileSpacer(node: EmailComponentNode): string {
  const { height } = node.props as Record<string, string>;
  const h = height || '24';

  return `          <tr>
            <td style="padding:0;height:${h}px;font-size:1px;line-height:${h}px;">&nbsp;</td>
          </tr>`;
}

function compileColumns(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { columns, columnContent } = node.props as { columns?: number; columnContent?: { content: string }[] };
  const cols = columns || 2;
  const content = columnContent || [];
  const colWidth = Math.floor(560 / cols);

  const tds = Array.from({ length: cols }).map((_, i) => {
    const cellContent = content[i]?.content || '';
    return `                <td class="email-column" width="${colWidth}" valign="top" style="padding:0 10px;font-family:${s.fontFamily};font-size:${s.bodyFontSize};color:${s.textColor};line-height:1.6;">
                  ${cellContent}
                </td>`;
  }).join('\n');

  return `          <tr>
            <td style="padding:8px 30px;">
              <!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><![endif]-->
${tds}
              <!--[if mso]></tr></table><![endif]-->
            </td>
          </tr>`;
}

function compileSocial(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { networks } = node.props as { networks?: { name: string; url: string }[] };
  const items = networks || [];

  const icons = items.map((n) => {
    const label = esc(n.name);
    return `<td style="padding:0 6px;">
                    <a href="${esc(n.url)}" target="_blank" style="color:${s.linkColor};font-family:${s.fontFamily};font-size:${s.smallFontSize};text-decoration:none;">${label}</a>
                  </td>`;
  }).join('\n                  ');

  return `          <tr>
            <td align="center" style="padding:16px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  ${icons}
                </tr>
              </table>
            </td>
          </tr>`;
}

function compileFooter(node: EmailComponentNode, s: Required<EmailTheme>): string {
  const { text, unsubscribeUrl, companyAddress } = node.props as Record<string, string>;

  const unsub = unsubscribeUrl
    ? `<br><a href="${esc(unsubscribeUrl)}" style="color:${s.linkColor};font-size:${s.smallFontSize};">Unsubscribe</a>`
    : '';
  const addr = companyAddress
    ? `<br>${esc(companyAddress)}`
    : '';

  return `          <tr>
            <td style="padding:24px 40px;font-family:${s.fontFamily};font-size:${s.smallFontSize};color:#9ca3af;text-align:center;line-height:1.6;">
              ${text || ''}${addr}${unsub}
            </td>
          </tr>`;
}

function compileRawHtml(node: EmailComponentNode): string {
  const { html } = node.props as { html?: string };
  return `          <tr>
            <td style="padding:0;">
              ${html || ''}
            </td>
          </tr>`;
}

/**
 * Generates a plain-text version from the component tree.
 */
export function compileEmailText(components: EmailComponentNode[]): string {
  return components.map((c) => {
    switch (c.type) {
      case 'EmailText': return (c.props.content as string) || '';
      case 'EmailHeader': return (c.props.logoAlt as string) || '';
      case 'EmailButton': return `${c.props.text || 'Click Here'}: ${c.props.url || ''}`;
      case 'EmailImage': return `[Image: ${c.props.alt || ''}]`;
      case 'EmailDivider': return '---';
      case 'EmailSpacer': return '';
      case 'EmailSocial': {
        const networks = (c.props.networks as { name: string; url: string }[]) || [];
        return networks.map((n) => `${n.name}: ${n.url}`).join('\n');
      }
      case 'EmailFooter': {
        const parts = [c.props.text || ''];
        if (c.props.companyAddress) parts.push(c.props.companyAddress as string);
        if (c.props.unsubscribeUrl) parts.push(`Unsubscribe: ${c.props.unsubscribeUrl}`);
        return parts.join('\n');
      }
      case 'EmailHtml': return '';
      case 'EmailColumns': return '';
      default: return '';
    }
  }).filter(Boolean).join('\n\n');
}
