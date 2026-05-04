import type { EmailComponentNode, EmailTheme } from '~/lib/api/types';

export interface ParsedEmailTemplate {
  components: EmailComponentNode[];
  theme: EmailTheme;
}

/**
 * Decodes a base64 string that was encoded with UTF-8 support.
 * Handles Unicode characters properly.
 */
function decodeBase64Utf8(base64: string): string {
  try {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    // Fallback to simple atob for backward compatibility
    return atob(base64);
  }
}

/**
 * Parses compiled email HTML back into EmailComponentNode array and theme.
 * Extracts component data from data-email-component attributes and theme from meta tag.
 *
 * @param html The compiled email HTML string
 * @returns Parsed components and theme, or null if parsing fails
 */
export function parseEmailHtml(html: string): ParsedEmailTemplate | null {
  if (!html || typeof html !== 'string') {
    return null;
  }

  try {
    // Use DOMParser for browser environment
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract theme from meta tag
    const themeMeta = doc.querySelector('meta[name="email-builder-theme"]');
    let theme: EmailTheme = {};
    if (themeMeta) {
      const themeContent = themeMeta.getAttribute('content');
      if (themeContent) {
        try {
          theme = JSON.parse(decodeBase64Utf8(themeContent));
        } catch {
          // Theme parsing failed, use empty theme
        }
      }
    }

    // Extract components from data-email-component attributes
    const componentElements = doc.querySelectorAll('[data-email-component]');
    const components: EmailComponentNode[] = [];

    componentElements.forEach((el) => {
      const encoded = el.getAttribute('data-email-component');
      if (encoded) {
        try {
          const data = JSON.parse(decodeBase64Utf8(encoded));
          if (data.id && data.type && data.props !== undefined) {
            components.push({
              id: data.id,
              type: data.type,
              props: data.props,
            });
          }
        } catch {
          // Component parsing failed, skip this component
        }
      }
    });

    return { components, theme };
  } catch {
    return null;
  }
}

/**
 * Checks if HTML was created by the visual email builder.
 * Returns true if the HTML contains email builder data attributes.
 */
export function isBuilderHtml(html: string): boolean {
  if (!html || typeof html !== 'string') {
    return false;
  }

  // Check for the presence of our data attributes
  return html.includes('data-email-component=') || html.includes('name="email-builder-theme"');
}

/**
 * Extracts all variables ({{variable_name}}) from the component props.
 * Handles both {{name}} and {{ name }} formats with optional whitespace.
 */
export function extractVariablesFromComponents(components: EmailComponentNode[]): string[] {
  const variables = new Set<string>();

  function extractFromValue(value: unknown): void {
    if (typeof value === 'string') {
      // Use matchAll to avoid lastIndex issues with global regex
      // Allow optional whitespace around variable names: {{ name }} or {{name}}
      const matches = value.matchAll(/\{\{\s*([^}\s]+(?:\.[^}\s]+)*)\s*\}\}/g);
      for (const match of matches) {
        variables.add(match[1].trim());
      }
    } else if (Array.isArray(value)) {
      value.forEach(extractFromValue);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(extractFromValue);
    }
  }

  components.forEach((component) => {
    Object.values(component.props).forEach(extractFromValue);
  });

  return Array.from(variables);
}

/**
 * Replaces variables in component props with actual values.
 * Returns a new array with replaced values (does not mutate original).
 */
export function replaceVariablesInComponents(
  components: EmailComponentNode[],
  values: Record<string, string>
): EmailComponentNode[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;

  function replaceInValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return value.replace(variableRegex, (_, varName) => {
        const trimmed = varName.trim();
        return values[trimmed] !== undefined ? values[trimmed] : `{{${trimmed}}}`;
      });
    } else if (Array.isArray(value)) {
      return value.map(replaceInValue);
    } else if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = replaceInValue(v);
      }
      return result;
    }
    return value;
  }

  return components.map((component) => ({
    ...component,
    props: replaceInValue(component.props) as Record<string, unknown>,
  }));
}
