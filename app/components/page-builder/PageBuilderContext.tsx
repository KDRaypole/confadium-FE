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
  showGrid: boolean;
  websiteId?: string;
  pageId?: string;
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
  /** Reorder a section within the root children (nav/footer stay pinned) */
  reorderSections: (fromIndex: number, toIndex: number) => void;
  /** Update grid position for a component inside a section */
  updateGridPosition: (selector: string, breakpoint: 'lg' | 'sm', pos: { x: number; y: number; w: number; h: number }) => void;
  /** Add a component to a section with auto-generated grid position */
  addToSection: (sectionSelector: string, componentType: string, gridOverride?: { x: number; y: number; w: number; h: number }) => void;
  setEditMode: (editMode: boolean) => void;
  setDevice: (device: DeviceMode) => void;
  setDragComponent: (type: string | null) => void;
  setShowGrid: (show: boolean) => void;
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

/** Default grid sizes when dropping content into a section (matching attract-ui) */
const DEFAULT_GRID_SIZES: Record<string, { lg: { w: number; h: number; minW?: number; minH?: number }; sm: { w: number; h: number } }> = {
  Text:              { lg: { w: 12, h: 3 },              sm: { w: 8, h: 3 } },
  Image:             { lg: { w: 12, h: 8 },              sm: { w: 8, h: 6 } },
  ContentButton:     { lg: { w: 6,  h: 2, minW: 4, minH: 2 }, sm: { w: 4, h: 2 } },
  ContentVideo:      { lg: { w: 12, h: 8, minW: 6, minH: 6 }, sm: { w: 8, h: 6 } },
  ContentDivider:    { lg: { w: 12, h: 1 },              sm: { w: 8, h: 1 } },
  ContentList:       { lg: { w: 12, h: 4 },              sm: { w: 8, h: 4 } },
  ContentAccordion:  { lg: { w: 12, h: 6 },              sm: { w: 8, h: 6 } },
  IconItem:          { lg: { w: 4,  h: 3 },              sm: { w: 3, h: 3 } },
  BoxItem:           { lg: { w: 8,  h: 4, minW: 4, minH: 2 }, sm: { w: 6, h: 4 } },
  FormEmbed:         { lg: { w: 12, h: 6 },              sm: { w: 8, h: 6 } },
  ProductEmbed:      { lg: { w: 12, h: 6 },              sm: { w: 8, h: 6 } },
  Carousel:          { lg: { w: 12, h: 8, minW: 6, minH: 4 }, sm: { w: 8, h: 6 } },
};

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
  Carousel: {
    node: false,
    type: 'Carousel',
    props: {
      items: [
        { image_url: '', text: 'Slide 1' },
        { image_url: '', text: 'Slide 2' },
        { image_url: '', text: 'Slide 3' },
      ],
      visibleCount: 1,
      infinite: true,
    },
  },
  Section: {
    node: false,
    type: 'Section',
    props: {
      children: [],
      rows: { lg: 12, sm: 12 },
      backgroundColor: '',
      background: {}, // Advanced background config (image, gradient, overlay, layers)
      paddingX: 32,
      paddingY: 24,
      gridGapX: 8,
      gridGapY: 8,
    },
  },
};

const MAX_HISTORY = 50;

interface PageBuilderProviderProps {
  initialStructure: PageComponentNode | null;
  initialTheme: PageTheme;
  children: React.ReactNode;
  onChange?: (structure: PageComponentNode | null, theme: PageTheme) => void;
  /** Website ID for inter-page linking */
  websiteId?: string;
  /** Current page ID */
  pageId?: string;
}

export function PageBuilderProvider({ initialStructure, initialTheme, children, onChange, websiteId, pageId }: PageBuilderProviderProps) {
  const [structure, setStructureState] = useState<PageComponentNode | null>(initialStructure);
  const [theme, setThemeState] = useState<PageTheme>(initialTheme);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [editMode, setEditMode] = useState(true);
  const [dragComponent, setDragComponent] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);

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

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const children = (cloned.props.children as PageComponentNode[]) || [];
    // Identify movable sections (not Navigation or Footer)
    const movable: { node: PageComponentNode; origIdx: number }[] = [];
    const pinned: { node: PageComponentNode; origIdx: number }[] = [];
    children.forEach((c, i) => {
      if (c.type === 'Navigation' || c.type === 'Footer') {
        pinned.push({ node: c, origIdx: i });
      } else {
        movable.push({ node: c, origIdx: i });
      }
    });
    if (fromIndex < 0 || fromIndex >= movable.length || toIndex < 0 || toIndex >= movable.length) return;
    const [moved] = movable.splice(fromIndex, 1);
    movable.splice(toIndex, 0, moved);
    // Reconstruct: nav first (if exists), then sections in new order, footer last (if exists)
    const nav = pinned.find(p => p.node.type === 'Navigation');
    const footer = pinned.find(p => p.node.type === 'Footer');
    const rebuilt: PageComponentNode[] = [];
    if (nav) rebuilt.push(nav.node);
    movable.forEach(m => rebuilt.push(m.node));
    if (footer) rebuilt.push(footer.node);
    cloned.props = { ...cloned.props, children: rebuilt.map((c, i) => reindexSelectors(c, `${cloned.selector}-${i}`)) };
    updateStructure(cloned);
  }, [structure, updateStructure]);

  const updateGridPosition = useCallback((selector: string, breakpoint: 'lg' | 'sm', pos: { x: number; y: number; w: number; h: number }) => {
    if (!structure) return;
    const cloned = deepClone(structure);
    const target = findBySelector(cloned, selector);
    if (!target) return;
    const existingGrid = target.grid || { lg: { x: 0, y: 0, w: 12, h: 4 }, sm: { x: 0, y: 0, w: 8, h: 4 } };
    target.grid = {
      ...existingGrid,
      [breakpoint]: { ...existingGrid[breakpoint], ...pos },
    };
    updateStructure(cloned);
  }, [structure, updateStructure]);

  const addToSection = useCallback((sectionSelector: string, componentType: string, gridOverride?: { x: number; y: number; w: number; h: number }) => {
    if (!structure) return;
    const template = DEFAULT_COMPONENTS[componentType];
    if (!template) return;

    const cloned = deepClone(structure);
    const section = findBySelector(cloned, sectionSelector);
    if (!section) return;

    const children = (section.props.children as PageComponentNode[]) || [];
    const newIdx = children.length;
    const newSelector = `${sectionSelector}-${newIdx}`;

    // Calculate next y position from existing children
    let nextY = 0;
    for (const child of children) {
      const g = child.grid?.lg;
      if (g) nextY = Math.max(nextY, g.y + g.h);
    }

    const defaults = DEFAULT_GRID_SIZES[template.type!] || { lg: { w: 12, h: 4 }, sm: { w: 8, h: 4 } };
    const lgPos = gridOverride || { x: 0, y: nextY, w: defaults.lg.w, h: defaults.lg.h };

    const newComponent: PageComponentNode = {
      selector: newSelector,
      node: template.node ?? false,
      type: template.type!,
      props: deepClone(template.props) as PageComponentNode['props'],
      grid: {
        lg: { ...lgPos, minW: defaults.lg.minW, minH: defaults.lg.minH },
        sm: { x: 0, y: nextY, w: defaults.sm.w, h: defaults.sm.h },
      },
    };

    children.push(newComponent);
    section.props = { ...section.props, children };
    updateStructure(cloned);
    setSelectedSelector(newSelector);
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
    editMode,
    device,
    dragComponent,
    showGrid,
    websiteId,
    pageId,
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
    reorderSections,
    updateGridPosition,
    addToSection,
    setDevice,
    setEditMode,
    setDragComponent,
    setShowGrid,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
  };

  return <PageBuilderCtx.Provider value={value}>{children}</PageBuilderCtx.Provider>;
}

export { DEFAULT_COMPONENTS, DEFAULT_GRID_SIZES };
