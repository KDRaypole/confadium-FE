import { useCallback, useMemo, useRef, useState, useEffect, type ComponentType } from "react";
import { Responsive as ResponsiveImport } from "react-grid-layout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Responsive = ResponsiveImport as ComponentType<any>;
import { usePageBuilder } from "./PageBuilderContext";
import ComponentRenderer from "./ComponentRenderer";
import type { PageComponentNode } from "~/lib/api/types";
import { PlusIcon } from "@heroicons/react/24/outline";

type GLayout = {
  i: string; x: number; y: number; w: number; h: number;
  minW?: number; minH?: number; isDraggable?: boolean; isResizable?: boolean;
};

interface SectionGridProps {
  node: PageComponentNode;
}

export default function SectionGrid({ node }: SectionGridProps) {
  const {
    editMode, device, updateGridPosition, select, selectedSelector, showGrid, theme,
  } = usePageBuilder();

  const children = (node.props.children as PageComponentNode[]) || [];
  const palette = theme.colorPalette;
  const sectionBg = (node.props.backgroundColor as string) || palette?.color5 || '#ffffff';
  const rows = (node.props.rows as { lg: number; sm: number }) || { lg: 12, sm: 12 };
  const paddingX = (node.props.paddingX as number) ?? 32;
  const paddingY = (node.props.paddingY as number) ?? 24;
  const gapX = (node.props.gridGapX as number) ?? 8;
  const gapY = (node.props.gridGapY as number) ?? 8;

  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [gridAreaWidth, setGridAreaWidth] = useState(0);

  const breakpoint = device === 'mobile' ? 'sm' : 'lg';
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
      lg.push({ i: child.selector, x: gLg.x, y: gLg.y, w: gLg.w, h: gLg.h, minW: gLg.minW || 2, minH: gLg.minH || 1, isDraggable: editMode, isResizable: editMode });
      sm.push({ i: child.selector, x: gSm.x, y: gSm.y, w: gSm.w, h: gSm.h, minW: 2, minH: 1, isDraggable: editMode, isResizable: editMode });
    });
    return { lg, sm };
  }, [children, editMode]);

  const handleLayoutChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_currentLayout: any[], allLayouts: any) => {
      const layoutForBp = allLayouts?.[breakpoint] || _currentLayout;
      if (!Array.isArray(layoutForBp)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layoutForBp.forEach((item: any) => {
        const child = children.find((c) => c.selector === item.i);
        if (!child) return;
        const existing = child.grid?.[breakpoint];
        if (existing && existing.x === item.x && existing.y === item.y && existing.w === item.w && existing.h === item.h) return;
        updateGridPosition(item.i, breakpoint, { x: item.x, y: item.y, w: item.w, h: item.h });
      });
    },
    [children, breakpoint, updateGridPosition]
  );

  const maxY = useMemo(() => {
    const minRows = rows[breakpoint] || 6;
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
        backgroundColor: sectionBg,
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
      {/* Grid area — overlay + react-grid-layout share this same container */}
      <div ref={gridAreaRef} style={{ position: 'relative', overflow: 'hidden' }}>
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
            className={`page-builder-grid${editMode ? ' edit-mode' : ''}`}
            layouts={layouts}
            breakpoints={{ lg: 996, sm: 0 }}
            cols={{ lg: 12, sm: 8 }}
            rowHeight={rowHeight}
            margin={gridMargin}
            compactType="vertical"
            isDraggable={editMode}
            isResizable={editMode}
            useCSSTransforms
            resizeHandles={editMode ? ['se'] : []}
            onLayoutChange={handleLayoutChange}
            onWidthChange={(width: number) => setGridAreaWidth(width)}
            width={gridAreaWidth || undefined}
          >
            {children.map((child) => (
              <div key={child.selector} style={{ overflow: 'visible' }}>
                <ComponentRenderer node={child} />
              </div>
            ))}
          </Responsive>
        )}
      </div>

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
