import { createContext, useContext, useCallback, useState, useRef } from "react";
import type { EmailComponentNode, EmailTheme } from "~/lib/api/types";

interface EmailBuilderState {
  components: EmailComponentNode[];
  theme: EmailTheme;
  selectedId: string | null;
  history: EmailComponentNode[][];
  historyIndex: number;
}

interface EmailBuilderActions {
  setComponents: (c: EmailComponentNode[]) => void;
  setTheme: (t: EmailTheme) => void;
  select: (id: string | null) => void;
  getComponent: (id: string) => EmailComponentNode | undefined;
  manipulate: (id: string, changes: Record<string, unknown>) => void;
  addComponent: (type: string, afterId?: string) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, direction: 'up' | 'down') => void;
  duplicateComponent: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

type EmailBuilderContextType = EmailBuilderState & EmailBuilderActions;

const Ctx = createContext<EmailBuilderContextType | null>(null);

export function useEmailBuilder() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmailBuilder must be used within EmailBuilderProvider");
  return ctx;
}

let _nextId = 1;
function genId(): string {
  return `ec_${Date.now()}_${_nextId++}`;
}

const DEFAULT_PROPS: Record<string, Record<string, unknown>> = {
  EmailHeader: { logoUrl: '', logoAlt: 'Company', logoWidth: '150', backgroundColor: '' },
  EmailText: { content: 'Your text here', textType: 'body', align: 'left', color: '' },
  EmailImage: { src: '', alt: 'Image', width: '600', linkUrl: '' },
  EmailButton: { text: 'Click Here', url: 'https://', bgColor: '', textColor: '#ffffff', borderRadius: '6', width: '200' },
  EmailDivider: { color: '#e5e7eb', thickness: '1' },
  EmailSpacer: { height: '24' },
  EmailColumns: { columns: 2, columnContent: [{ content: 'Column 1' }, { content: 'Column 2' }] },
  EmailSocial: { networks: [{ name: 'Twitter', url: 'https://' }, { name: 'LinkedIn', url: 'https://' }] },
  EmailFooter: { text: '\u00A9 2026 Company. All rights reserved.', unsubscribeUrl: '{{unsubscribe_url}}', companyAddress: '' },
  EmailHtml: { html: '' },
};

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

const MAX_HISTORY = 40;

interface EmailBuilderProviderProps {
  initialComponents: EmailComponentNode[];
  initialTheme: EmailTheme;
  children: React.ReactNode;
  onChange?: (components: EmailComponentNode[], theme: EmailTheme) => void;
}

export function EmailBuilderProvider({ initialComponents, initialTheme, children, onChange }: EmailBuilderProviderProps) {
  const [components, setComponentsState] = useState<EmailComponentNode[]>(initialComponents);
  const [theme, setThemeState] = useState<EmailTheme>(initialTheme);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const historyRef = useRef<EmailComponentNode[][]>([deepClone(initialComponents)]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((newComps: EmailComponentNode[]) => {
    const h = historyRef.current.slice(0, historyIndexRef.current + 1);
    h.push(deepClone(newComps));
    if (h.length > MAX_HISTORY) h.shift();
    historyRef.current = h;
    historyIndexRef.current = h.length - 1;
  }, []);

  const update = useCallback((newComps: EmailComponentNode[]) => {
    setComponentsState(newComps);
    pushHistory(newComps);
    onChange?.(newComps, theme);
  }, [pushHistory, onChange, theme]);

  const setComponents = useCallback((c: EmailComponentNode[]) => update(c), [update]);

  const setTheme = useCallback((t: EmailTheme) => {
    setThemeState(t);
    onChange?.(components, t);
  }, [onChange, components]);

  const select = useCallback((id: string | null) => setSelectedId(id), []);

  const getComponent = useCallback((id: string) => components.find(c => c.id === id), [components]);

  const manipulate = useCallback((id: string, changes: Record<string, unknown>) => {
    const updated = components.map(c => c.id === id ? { ...c, props: { ...c.props, ...changes } } : c);
    update(updated);
  }, [components, update]);

  const addComponent = useCallback((type: string, afterId?: string) => {
    const newComp: EmailComponentNode = { id: genId(), type, props: deepClone(DEFAULT_PROPS[type] || {}) };
    const updated = [...components];
    if (afterId) {
      const idx = updated.findIndex(c => c.id === afterId);
      updated.splice(idx + 1, 0, newComp);
    } else {
      updated.push(newComp);
    }
    update(updated);
    setSelectedId(newComp.id);
  }, [components, update]);

  const removeComponent = useCallback((id: string) => {
    update(components.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [components, update, selectedId]);

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = components.findIndex(c => c.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= components.length) return;
    const updated = [...components];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    update(updated);
  }, [components, update]);

  const duplicateComponent = useCallback((id: string) => {
    const idx = components.findIndex(c => c.id === id);
    if (idx === -1) return;
    const dup = { ...deepClone(components[idx]), id: genId() };
    const updated = [...components];
    updated.splice(idx + 1, 0, dup);
    update(updated);
  }, [components, update]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prev = deepClone(historyRef.current[historyIndexRef.current]);
      setComponentsState(prev);
      onChange?.(prev, theme);
    }
  }, [onChange, theme]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const next = deepClone(historyRef.current[historyIndexRef.current]);
      setComponentsState(next);
      onChange?.(next, theme);
    }
  }, [onChange, theme]);

  const value: EmailBuilderContextType = {
    components, theme, selectedId,
    history: historyRef.current, historyIndex: historyIndexRef.current,
    setComponents, setTheme, select, getComponent, manipulate,
    addComponent, removeComponent, moveComponent, duplicateComponent,
    undo, redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { DEFAULT_PROPS };
