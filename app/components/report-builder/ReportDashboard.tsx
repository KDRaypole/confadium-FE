import { useMemo, useState, useRef, useEffect, type ComponentType } from "react";
import { Responsive as ResponsiveImport } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import { useReportBuilder } from "./ReportBuilderContext";
import ChartWidget from "./ChartWidget";
import WidgetEditor from "./WidgetEditor";
import type { ReportWidget } from "~/lib/api/reports";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResponsiveGridLayout = ResponsiveImport as ComponentType<any>;

interface ReportDashboardProps {
  data: Record<string, unknown>[];
  editMode?: boolean;
}

export default function ReportDashboard({
  data,
  editMode = true,
}: ReportDashboardProps) {
  const {
    configuration,
    selectedWidgetId,
    selectWidget,
    updateWidget,
    updateWidgetGrid,
    removeWidget,
    duplicateWidget,
  } = useReportBuilder();

  const widgets = configuration.widgets || [];
  const [showEditor, setShowEditor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Measure container width for responsive grid
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Convert widgets to grid layouts
  const layouts = useMemo((): Layouts => {
    const lg: Layout[] = widgets.map((w) => ({
      i: w.id,
      x: w.grid.lg.x,
      y: w.grid.lg.y,
      w: w.grid.lg.w,
      h: w.grid.lg.h,
      minW: w.grid.lg.minW || 2,
      minH: w.grid.lg.minH || 2,
      isDraggable: editMode,
      isResizable: editMode,
    }));

    const sm: Layout[] = widgets.map((w) => ({
      i: w.id,
      x: w.grid.sm.x,
      y: w.grid.sm.y,
      w: w.grid.sm.w,
      h: w.grid.sm.h,
      minW: 2,
      minH: 2,
      isDraggable: editMode,
      isResizable: editMode,
    }));

    return { lg, sm };
  }, [widgets, editMode]);

  const handleLayoutChange = (
    currentLayout: Layout[],
    allLayouts: Layouts
  ) => {
    // Update widget positions based on the new layout
    currentLayout.forEach((layoutItem) => {
      const widget = widgets.find((w) => w.id === layoutItem.i);
      if (!widget) return;

      // Check if position changed
      const currentBreakpoint = window.innerWidth >= 1200 ? "lg" : "sm";
      const currentGrid = widget.grid[currentBreakpoint];
      if (
        currentGrid.x !== layoutItem.x ||
        currentGrid.y !== layoutItem.y ||
        currentGrid.w !== layoutItem.w ||
        currentGrid.h !== layoutItem.h
      ) {
        updateWidgetGrid(widget.id, currentBreakpoint, {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        });
      }
    });
  };

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No visualizations yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add chart widgets to visualize your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, sm: 768 }}
        cols={{ lg: 12, sm: 6 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        draggableHandle=".widget-drag-handle"
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-drag-handle">
            <ChartWidget
              widget={widget}
              data={data}
              isSelected={selectedWidgetId === widget.id}
              onSelect={() => selectWidget(widget.id)}
              onEdit={() => {
                selectWidget(widget.id);
                setShowEditor(true);
              }}
              onRemove={() => removeWidget(widget.id)}
              onDuplicate={() => duplicateWidget(widget.id)}
              editMode={editMode}
            />
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Widget Editor Panel */}
      {showEditor && selectedWidget && (
        <WidgetEditor
          widget={selectedWidget}
          onUpdate={(changes) => updateWidget(selectedWidget.id, changes)}
          onClose={() => {
            setShowEditor(false);
            selectWidget(null);
          }}
        />
      )}
    </div>
  );
}
