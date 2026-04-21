import { createContext, useContext, useCallback, useState, useRef } from "react";
import type { PageComponentNode, PageTheme } from "~/lib/api/types";

type DeviceMode = 'desktop' | 'mobile';

interface PageBuilderState {
  structure: PageComponentNode | null;
  theme: PageTheme;
  selectedSelector: string | null;
  editMode: boolean;
  device: DeviceMode;
  dragComponent: string | null;
  history: (PageComponentNode | null)[];
  historyIndex: number;
}

interface PageBuilderActions {
  setStructure: (structure: PageComponentNode | null) => void;
  setTheme: (theme: PageTheme) => void;
  select: (selector: string | null) => void;
  getComponent: (selector: string) => PageComponentNode | null;
  manipulate: (selector: string, changes: Record<string, unknown>) => void;
  addComponent: (parentSelector: string, componentType: string, position?: number) => void;
  removeComponent: (selector: string) => void;
  moveComponent: (selector: string, direction: 'up' | 'down') => void;
  duplicateComponent: (selector: string) => void;
  setDevice: (device: DeviceMode) => void;
  setDragComponent: (type: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

type PageBuilderContextType = PageBuilderState & PageBuilderActions;

const PageBuilderCtx = createContext<PageBuilderContextType | null>(null);

export function usePageBuilder() {
  const ctx = useContext(PageBuilderCtx);
  if (!ctx) throw new Error("usePageBuilder must be used within PageBuilderProvider");
  return ctx;
}

function findBySelector(root: PageComponentNode | null, selector: string): PageComponentNode | null {
  if (!root) return null;
  if (root.selector === selector) return root;
  if (root.props.children) {
    for (const child of root.props.children as PageComponentNode[]) {
      const found = findBySelector(child, selector);
      if (found) return found;
    }
  }
  return null;
}

function findParent(root: PageComponentNode, selector: string): PageComponentNode | null {
  if (root.props.children) {
    const children = root.props.children as PageComponentNode[];
    for (const child of children) {
      if (child.selector === selector) return root;
      const found = findParent(child, selector);
      if (found) return found;
    }
  }
  return null;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function reindexSelectors(node: PageComponentNode, prefix: string): PageComponentNode {
  const updated = { ...node, selector: prefix };
  if (node.props.children) {
    const children = (node.props.children as PageComponentNode[]).map((child, i) =>
      reindexSelectors(child, `${prefix}-${i}`)
    );
    updated.props = { ...node.props, children };
  }
  return updated;
}

const DEFAULT_COMPONENTS: Record<string, Partial<PageComponentNode>> = {
  Text: { node: false, type: 'Text', props: { verbiage: 'New text block', tagType: 'paragraph_1', textAlign: 'left', color: '' } },
  Image: { node: false, type: 'Image', props: { src: '', alt: 'Image', objectFit: 'cover', radiusType: 'none' } },
  Button: { node: false, type: 'ContentButton', props: { text: 'Click here', link: '#', linkType: 'link', buttonType: 'primary' } },
  Video: { node: false, type: 'ContentVideo', props: { video: '' } },
  Divider: { node: false, type: 'ContentDivider', props: {} },
  List: { node: false, type: 'ContentList', props: { children: [] } },
  Accordion: { node: false, type: 'ContentAccordion', props: { children: [] } },
  Icon: { node: false, type: 'IconItem', props: { icon: 'star', color: '' } },
  Box: { node: false, type: 'BoxItem', props: { color: '#f3f4f6', radiusType: 'rounded', children: [] } },
  FormEmbed: { node: false, type: 'FormEmbed', props: { formId: '', formName: '' } },
  ProductEmbed: { node: false, type: 'ProductEmbed', props: { productId: '', productName: '' } },
  Section: {
    node: false,
    type: 'Section',
    props: {
      children: [],
      rows: { lg: 12, sm: 12 },
    },
    grid: { lg: { x: 0, y: 0, w: 12, h: 6 }, sm: { x: 0, y: 0, w: 4, h: 4 } },
  },
};

const MAX_HISTORY = 50;

interface PageBuilderProviderProps {
  initialStructure: PageComponentNode | null;
  initialTheme: PageTheme;
  children: React.ReactNode;
  onChange?: (structure: PageComponentNode | null, theme: PageTheme) => void;
}

export function PageBuilderProvider({ initialStructure, initialTheme, children, onChange }: PageBuilderProviderProps) {
  const [structure, setStructureState] = useState<PageComponentNode | null>(initialStructure);
  const [theme, setThemeState] = useState<PageTheme>(initialTheme);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [dragComponent, setDragComponent] = useState<string | null>(null);

  const historyRef = useRef<(PageComponentNode | null)[]>([initialStructure]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((newStructure: PageComponentNode | null) => {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    const truncated = h.slice(0, idx + 1);
    truncated.push(deepClone(newStructure));
    if (truncated.length > MAX_HISTORY) truncated.shift();
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
  }, []);

  const updateStructure = useCallback((newStructure: PageComponentNode | null) => {
    setStructureState(newStructure);
    pushHistory(newStructure);
    onChange?.(newStructure, theme);
  }, [pushHistory, onChange, theme]);

  const setStructure = useCallback((s: PageComponentNode | null) => {
    updateStructure(s);
  }, [updateStructure]);

  const setTheme = useCallback((t: PageTheme) => {
    setThemeState(t);
    onChange?.(structure, t);
  }, [onChange, structure]);

  const select = useCallback((selector: string | null) => {
    setSelectedSelector(selector);
  }, []);

  const getComponent = useCallback((selector: string) => {
    return findBySelector(structure, selector);
  }, [structure]);

  const manipulate = useCallback((selector: string, changes: Record<string, unknown>) => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const target = findBySelector(cloned, selector);
    if (target) {
      target.props = { ...target.props, ...changes };
      updateStructure(cloned);
    }
  }, [structure, updateStructure]);

  const addComponent = useCallback((parentSelector: string, componentType: string, position?: number) => {
    if (!structure) return;
    const template = DEFAULT_COMPONENTS[componentType];
    if (!template) return;

    const cloned = deepClone(structure);
    const parent = findBySelector(cloned, parentSelector);
    if (!parent) return;

    const children = (parent.props.children as PageComponentNode[]) || [];
    const idx = position ?? children.length;
    const newSelector = `${parentSelector}-${idx}`;

    const newComponent: PageComponentNode = {
      selector: newSelector,
      node: template.node ?? false,
      type: template.type!,
      props: deepClone(template.props) as PageComponentNode['props'],
      ...(template.grid ? { grid: deepClone(template.grid) } : {}),
    };

    children.splice(idx, 0, newComponent);
    parent.props = { ...parent.props, children: children.map((c, i) => reindexSelectors(c, `${parentSelector}-${i}`)) };
    updateStructure(cloned);
    setSelectedSelector(newComponent.selector);
  }, [structure, updateStructure]);

  const removeComponent = useCallback((selector: string) => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const parent = findParent(cloned, selector);
    if (!parent) return;

    const children = (parent.props.children as PageComponentNode[]) || [];
    const idx = children.findIndex(c => c.selector === selector);
    if (idx === -1) return;

    children.splice(idx, 1);
    parent.props = { ...parent.props, children: children.map((c, i) => reindexSelectors(c, `${parent.selector}-${i}`)) };
    updateStructure(cloned);
    if (selectedSelector === selector) setSelectedSelector(null);
  }, [structure, updateStructure, selectedSelector]);

  const moveComponent = useCallback((selector: string, direction: 'up' | 'down') => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const parent = findParent(cloned, selector);
    if (!parent) return;

    const children = (parent.props.children as PageComponentNode[]) || [];
    const idx = children.findIndex(c => c.selector === selector);
    if (idx === -1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= children.length) return;

    [children[idx], children[newIdx]] = [children[newIdx], children[idx]];
    parent.props = { ...parent.props, children: children.map((c, i) => reindexSelectors(c, `${parent.selector}-${i}`)) };
    updateStructure(cloned);
  }, [structure, updateStructure]);

  const duplicateComponent = useCallback((selector: string) => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const parent = findParent(cloned, selector);
    if (!parent) return;

    const children = (parent.props.children as PageComponentNode[]) || [];
    const idx = children.findIndex(c => c.selector === selector);
    if (idx === -1) return;

    const duplicate = deepClone(children[idx]);
    children.splice(idx + 1, 0, duplicate);
    parent.props = { ...parent.props, children: children.map((c, i) => reindexSelectors(c, `${parent.selector}-${i}`)) };
    updateStructure(cloned);
  }, [structure, updateStructure]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prev = deepClone(historyRef.current[historyIndexRef.current]);
      setStructureState(prev);
      onChange?.(prev, theme);
    }
  }, [onChange, theme]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const next = deepClone(historyRef.current[historyIndexRef.current]);
      setStructureState(next);
      onChange?.(next, theme);
    }
  }, [onChange, theme]);

  const value: PageBuilderContextType = {
    structure,
    theme,
    selectedSelector,
    editMode: true,
    device,
    dragComponent,
    history: historyRef.current,
    historyIndex: historyIndexRef.current,
    setStructure,
    setTheme,
    select,
    getComponent,
    manipulate,
    addComponent,
    removeComponent,
    moveComponent,
    duplicateComponent,
    setDevice,
    setDragComponent,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
  };

  return <PageBuilderCtx.Provider value={value}>{children}</PageBuilderCtx.Provider>;
}

export { DEFAULT_COMPONENTS };
