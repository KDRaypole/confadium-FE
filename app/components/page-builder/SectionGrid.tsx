import { useCallback, useMemo, useRef, useState, useEffect, type ComponentType, type ReactNode, type CSSProperties } from "react";
import { Responsive as ResponsiveImport } from "react-grid-layout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Responsive = ResponsiveImport as ComponentType<any>;
import { usePageBuilder } from "./PageBuilderContext";
import ComponentRenderer from "./ComponentRenderer";
import type { PageComponentNode, BackgroundConfig, BackgroundGradient, BackgroundLayer } from "~/lib/api/types";
import { PlusIcon } from "@heroicons/react/24/outline";

/** Convert a BackgroundGradient to a CSS gradient string */
function gradientToCss(gradient: BackgroundGradient): string {
  const stops = gradient.stops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  if (gradient.type === 'linear') {
    const angle = gradient.angle ?? 180;
    return `linear-gradient(${angle}deg, ${stops})`;
  } else if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${stops})`;
  } else if (gradient.type === 'conic') {
    const angle = gradient.angle ?? 0;
    return `conic-gradient(from ${angle}deg, ${stops})`;
  }
  return '';
}

/** Build the section's background styles from BackgroundConfig */
function buildBackgroundStyles(config: BackgroundConfig | undefined, fallbackColor: string): CSSProperties {
  if (!config) {
    return { backgroundColor: fallbackColor };
  }

  const styles: CSSProperties = {};

  // Base color
  if (config.color) {
    styles.backgroundColor = config.color;
  } else {
    styles.backgroundColor = fallbackColor;
  }

  // Background image
  if (config.image?.url) {
    const img = config.image;
    styles.backgroundImage = `url(${img.url})`;
    styles.backgroundSize = img.size || 'cover';
    styles.backgroundPosition = img.position || 'center';
    styles.backgroundRepeat = img.repeat || 'no-repeat';
    if (img.attachment) {
      styles.backgroundAttachment = img.attachment;
    }
  }

  // Gradient (can layer on top of image using multiple backgrounds)
  if (config.gradient) {
    const gradientCss = gradientToCss(config.gradient);
    if (config.image?.url) {
      // Layer gradient over image
      styles.backgroundImage = `${gradientCss}, url(${config.image.url})`;
    } else {
      styles.backgroundImage = gradientCss;
    }
  }

  return styles;
}

/** Render a background layer (SVG or HTML) */
function BackgroundLayerRenderer({ layer }: { layer: BackgroundLayer }) {
  const baseStyle: CSSProperties = {
    position: layer.position || 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: layer.zIndex ?? 0,
    opacity: layer.opacity ?? 1,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  if (layer.type === 'svg') {
    return (
      <div
        style={baseStyle}
        dangerouslySetInnerHTML={{ __html: layer.content }}
      />
    );
  }

  if (layer.type === 'html') {
    return (
      <div
        style={baseStyle}
        dangerouslySetInnerHTML={{ __html: layer.content }}
      />
    );
  }

  return null;
}

/**
 * Wrapper that measures its content and reports when the content height
 * exceeds the grid-allocated height, so the parent can grow the item's row span.
 */
function AutoSizeItem({ children, rowHeight, gridH, margin, onHeightChange }: {
  children: ReactNode;
  rowHeight: number;
  gridH: number;
  margin: number;
  onHeightChange: (neededH: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentHeight = entry.contentRect.height;
        // Calculate how many grid rows the content actually needs
        // Grid item pixel height = h * rowHeight + (h - 1) * margin
        // Solve for h: h = ceil((contentHeight + margin) / (rowHeight + margin))
        const neededH = Math.ceil((contentHeight + margin) / (rowHeight + margin));
        if (neededH > gridH) {
          onHeightChange(neededH);
        }
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rowHeight, gridH, margin, onHeightChange]);

  return <div ref={ref}>{children}</div>;
}

type GLayout = {
  i: string; x: number; y: number; w: number; h: number;
  minW?: number; minH?: number; isDraggable?: boolean; isResizable?: boolean;
};

interface SectionGridProps {
  node: PageComponentNode;
}

export default function SectionGrid({ node }: SectionGridProps) {
  const {
    editMode, device, updateGridPosition, select, selectedSelector, showGrid, theme, manipulate,
  } = usePageBuilder();

  const children = (node.props.children as PageComponentNode[]) || [];
  const palette = theme.colorPalette;

  // Support both legacy backgroundColor string and new background config object
  const backgroundConfig = node.props.background as BackgroundConfig | undefined;
  const legacyBgColor = (node.props.backgroundColor as string) || palette?.color5 || '#ffffff';
  const backgroundStyles = buildBackgroundStyles(backgroundConfig, legacyBgColor);
  const backgroundLayers = backgroundConfig?.layers || [];
  const overlay = backgroundConfig?.overlay;

  // Read breakpoint-specific layout values (supports both legacy single numbers and { lg, sm } objects)
  const bpVal = (prop: unknown, fallback: number, bp: string): number => {
    if (typeof prop === 'number') return prop;
    if (prop && typeof prop === 'object') return (prop as Record<string, number>)[bp] ?? fallback;
    return fallback;
  };

  const breakpoint = device === 'mobile' ? 'sm' : 'lg';
  const rows = bpVal(node.props.rows, 12, breakpoint);
  const paddingX = bpVal(node.props.paddingX, 32, breakpoint);
  const paddingY = bpVal(node.props.paddingY, 24, breakpoint);
  const gapX = bpVal(node.props.gridGapX, 8, breakpoint);
  const gapY = bpVal(node.props.gridGapY, 8, breakpoint);

  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [gridAreaWidth, setGridAreaWidth] = useState(0);
  const [heightOverrides, setHeightOverrides] = useState<Record<string, number>>({});

  // Reset height overrides when breakpoint changes (content reflows at different widths)
  useEffect(() => {
    setHeightOverrides({});
  }, [breakpoint]);
  const cols = breakpoint === 'lg' ? 12 : 8;
  const isSectionSelected = selectedSelector === node.selector;
  const gridMargin: [number, number] = [gapX, gapY];
  const rowHeight = 45;

  // Measure the grid area width so the overlay can replicate exact positions
  useEffect(() => {
    if (!gridAreaRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridAreaWidth(entry.contentRect.width);
      }
    });
    observer.observe(gridAreaRef.current);
    return () => observer.disconnect();
  }, []);

  const layouts = useMemo(() => {
    const lg: GLayout[] = [];
    const sm: GLayout[] = [];
    children.forEach((child) => {
      const gLg = child.grid?.lg || { x: 0, y: 0, w: 12, h: 4 };
      const gSm = child.grid?.sm || { x: 0, y: 0, w: 8, h: 4 };
      // Clamp width to column count so items never exceed the grid
      const lgW = Math.min(gLg.w, 12);
      const smW = Math.min(gSm.w, 8);
      // Clamp x so item doesn't start beyond available columns
      const lgX = Math.min(gLg.x, 12 - lgW);
      const smX = Math.min(gSm.x, 8 - smW);
      // Apply height overrides from content measurement
      const override = heightOverrides[child.selector];
      const lgH = override ? Math.max(gLg.h, override) : gLg.h;
      const smH = override ? Math.max(gSm.h, override) : gSm.h;
      lg.push({ i: child.selector, x: lgX, y: gLg.y, w: lgW, h: lgH, minW: gLg.minW || 2, minH: gLg.minH || 1, isDraggable: editMode, isResizable: editMode });
      sm.push({ i: child.selector, x: smX, y: gSm.y, w: smW, h: smH, minW: 2, minH: 1, isDraggable: editMode, isResizable: editMode });
    });
    return { lg, sm };
  }, [children, editMode, heightOverrides]);

  // Use a ref to track whether a drag/resize is in progress to prevent
  // layout recalculations from fighting with the grid's internal state
  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback(() => { isDraggingRef.current = true; }, []);
  const handleDragStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layout: any[]) => {
      isDraggingRef.current = false;
      if (!Array.isArray(layout)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layout.forEach((item: any) => {
        const child = children.find((c) => c.selector === item.i);
        if (!child) return;
        const existing = child.grid?.[breakpoint];
        if (existing && existing.x === item.x && existing.y === item.y && existing.w === item.w && existing.h === item.h) return;
        updateGridPosition(item.i, breakpoint, { x: item.x, y: item.y, w: item.w, h: item.h });
      });
    },
    [children, breakpoint, updateGridPosition]
  );

  const handleResizeStop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layout: any[]) => {
      isDraggingRef.current = false;
      if (!Array.isArray(layout)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layout.forEach((item: any) => {
        const child = children.find((c) => c.selector === item.i);
        if (!child) return;
        const existing = child.grid?.[breakpoint];
        if (existing && existing.x === item.x && existing.y === item.y && existing.w === item.w && existing.h === item.h) return;
        // Clear height override when user explicitly resizes
        setHeightOverrides(prev => {
          if (!prev[item.i]) return prev;
          const next = { ...prev };
          delete next[item.i];
          return next;
        });
        updateGridPosition(item.i, breakpoint, { x: item.x, y: item.y, w: item.w, h: item.h });
      });
    },
    [children, breakpoint, updateGridPosition]
  );

  const maxY = useMemo(() => {
    const minRows = rows || 6;
    if (children.length === 0) return minRows;
    let contentMax = 0;
    children.forEach((child) => {
      const g = child.grid?.[breakpoint];
      if (g) contentMax = Math.max(contentMax, g.y + g.h);
    });
    return Math.max(minRows, contentMax);
  }, [children, breakpoint, rows]);

  return (
    <div
      style={{
        ...backgroundStyles,
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        position: 'relative',
      }}
      onClick={(e) => {
        if (editMode && e.target === e.currentTarget) {
          e.stopPropagation();
          select(node.selector);
        }
      }}
    >
      {/* Background layers (SVG/HTML) */}
      {backgroundLayers.map((layer) => (
        <BackgroundLayerRenderer key={layer.id} layer={layer} />
      ))}

      {/* Background overlay */}
      {overlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            mixBlendMode: overlay.blendMode || 'normal',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Grid area — overlay + react-grid-layout share this same container */}
      <div ref={gridAreaRef} style={{ position: 'relative', zIndex: 2 }}>
        {/* Grid overlay — uses measured width to replicate react-grid-layout column positions */}
        {editMode && showGrid && gridAreaWidth > 0 && (
          <GridOverlay
            cols={cols}
            rowHeight={rowHeight}
            totalRows={maxY}
            containerWidth={gridAreaWidth}
            margin={gridMargin}
            accentColor={palette?.color1 || '#7c3aed'}
          />
        )}

        {children.length === 0 && editMode ? (
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '120px',
              border: `2px dashed ${isSectionSelected ? (palette?.color1 || '#7c3aed') : (palette?.color2 || '#d1d5db')}`,
              borderRadius: '0.5rem', cursor: 'pointer', transition: 'border-color 0.2s',
            }}
            onClick={(e) => { e.stopPropagation(); select(node.selector); }}
          >
            <PlusIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af', marginBottom: '0.375rem' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
              Empty section — use the palette to add content
            </span>
          </div>
        ) : (
          <Responsive
            key={`grid-${gapX}-${gapY}-${rows}-${breakpoint}`}
            className={`page-builder-grid${editMode ? ' edit-mode' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 996, sm: 0 }}
            cols={{ lg: 12, sm: 8 }}
            rowHeight={rowHeight}
            margin={gridMargin}
            compactType="vertical"
            preventCollision={false}
            isDraggable={editMode}
            isResizable={editMode}
            useCSSTransforms
            resizeHandles={editMode ? ['se'] : []}
            onDragStart={() => { isDraggingRef.current = true; }}
            onDragStop={(layout: any[]) => {
              isDraggingRef.current = false;
              handleDragStop(layout);
            }}
            onResizeStart={() => { isDraggingRef.current = true; }}
            onResizeStop={(layout: any[]) => {
              isDraggingRef.current = false;
              handleResizeStop(layout);
            }}
            onLayoutChange={(_currentLayout: any[], allLayouts: any) => {
              // Only persist layout changes when not mid-drag
              if (isDraggingRef.current) return;
            }}
            onWidthChange={(width: number) => setGridAreaWidth(width)}
            width={gridAreaWidth || undefined}
            autoSize
          >
            {children.map((child) => {
              const gridH = (breakpoint === 'lg'
                ? child.grid?.lg?.h
                : child.grid?.sm?.h) || 4;
              return (
                <div key={child.selector} style={{ overflow: 'hidden' }}>
                  <AutoSizeItem
                    rowHeight={rowHeight}
                    gridH={heightOverrides[child.selector] || gridH}
                    margin={gapY}
                    onHeightChange={(neededH) => {
                      setHeightOverrides(prev => {
                        if (prev[child.selector] === neededH) return prev;
                        return { ...prev, [child.selector]: neededH };
                      });
                    }}
                  >
                    <ComponentRenderer node={child} />
                  </AutoSizeItem>
                </div>
              );
            })}
          </Responsive>
        )}
      </div>

      {/* Row resize handle */}
      {editMode && isSectionSelected && (
        <SectionRowHandle
          rows={rows}
          maxY={maxY}
          onResize={(newRows) => {
            const stored = node.props.rows;
            const current = typeof stored === 'object' && stored
              ? stored as Record<string, number>
              : { lg: rows, sm: rows };
            manipulate(node.selector, { rows: { ...current, [breakpoint]: newRows } });
          }}
        />
      )}

      {editMode && children.length > 0 && isSectionSelected && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0 0' }}>
          <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
            Use the palette to add more content to this section
          </span>
        </div>
      )}
    </div>
  );
}

/** Draggable handle at bottom of section to add/remove rows */
function SectionRowHandle({ rows, maxY, onResize }: {
  rows: number;
  maxY: number;
  onResize: (newRows: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startRows = useRef(rows);
  const lastEmitted = useRef(rows);
  const onResizeRef = useRef(onResize);
  const maxYRef = useRef(maxY);
  onResizeRef.current = onResize;
  maxYRef.current = maxY;

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY.current;
      const deltaRows = Math.round(deltaY / 45);
      const newRows = Math.max(maxYRef.current, Math.max(1, startRows.current + deltaRows));
      if (newRows !== lastEmitted.current) {
        lastEmitted.current = newRows;
        onResizeRef.current(newRows);
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startY.current = e.clientY;
    startRows.current = rows;
    lastEmitted.current = rows;
    setDragging(true);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '16px',
        cursor: 'ns-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: dragging ? 'rgba(124,58,237,0.1)' : 'transparent',
      }}
      title={`${rows} rows (drag to resize)`}
    >
      <div style={{
        width: '40px',
        height: '4px',
        borderTop: '2px solid rgba(124,58,237,0.4)',
        borderBottom: '2px solid rgba(124,58,237,0.4)',
        borderRadius: '2px',
      }} />
    </div>
  );
}

// ── Grid overlay ───────────────────────────────────────────
// Replicates react-grid-layout's exact column/row positioning math so guides
// line up perfectly with where items actually snap.

function GridOverlay({ cols, rowHeight, totalRows, containerWidth, margin, accentColor }: {
  cols: number;
  rowHeight: number;
  totalRows: number;
  containerWidth: number;
  margin: [number, number];
  accentColor: string;
}) {
  const [mx, my] = margin;

  // react-grid-layout positions:
  //   colWidth = (containerWidth - margin[0] * (cols + 1)) / cols
  //   item col x left  = mx + x * (colWidth + mx)
  //   item row y top   = my + y * (rowHeight + my)
  //   item row y bottom = top + rowHeight

  const colWidth = (containerWidth - mx * (cols + 1)) / cols;

  // Content bounds: first item top edge → last item bottom edge
  const contentTop = my;
  const contentBottom = my + totalRows * (rowHeight + my) - my; // last row bottom = my + (totalRows-1)*(rowHeight+my) + rowHeight
  const contentHeight = contentBottom - contentTop;

  if (colWidth <= 0 || contentHeight <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: `${contentTop}px`,
        left: 0,
        width: `${containerWidth}px`,
        height: `${contentHeight}px`,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Column guides — span the full content height */}
      {Array.from({ length: cols }).map((_, i) => {
        const left = mx + i * (colWidth + mx);
        return (
          <div
            key={`col-${i}`}
            style={{
              position: 'absolute',
              left: `${left}px`,
              top: 0,
              width: `${colWidth}px`,
              height: '100%',
              backgroundColor: `${accentColor}06`,
              borderLeft: `1px solid ${accentColor}15`,
              borderRight: `1px solid ${accentColor}15`,
            }}
          />
        );
      })}

      {/* Row guides — one line at the top of each row, plus one at the bottom of the last row */}
      {Array.from({ length: totalRows + 1 }).map((_, i) => {
        // Position relative to contentTop (which is already offset in the parent)
        const top = i * (rowHeight + my);
        // Don't draw if past the content area
        if (top > contentHeight) return null;
        return (
          <div
            key={`row-${i}`}
            style={{
              position: 'absolute',
              left: `${mx}px`,
              right: `${mx}px`,
              top: `${top}px`,
              height: '1px',
              backgroundColor: `${accentColor}12`,
            }}
          />
        );
      })}
    </div>
  );
}
