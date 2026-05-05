import { createContext, useContext, useCallback, useState, useRef } from "react";
import type {
  ReportConfiguration,
  ReportFilter,
  ReportGrouping,
  ReportDateGrouping,
  ReportAggregation,
  ReportWidget,
  ReportableEntity,
  ReportableSchema,
  WidgetType,
  DateInterval,
  AggregationFunction,
} from "~/lib/api/reports";
import { generateId, createDefaultWidget } from "~/lib/api/reports";

interface ReportBuilderState {
  reportId?: string;
  name: string;
  description: string;
  entity: string;
  configuration: ReportConfiguration;
  schema: ReportableSchema | null;
  selectedWidgetId: string | null;
  editMode: boolean;
  previewMode: boolean;
  history: ReportConfiguration[];
  historyIndex: number;
  isDirty: boolean;
}

interface ReportBuilderActions {
  // Entity selection
  setEntity: (entity: string) => void;
  getEntitySchema: () => ReportableEntity | null;

  // Basic info
  setName: (name: string) => void;
  setDescription: (description: string) => void;

  // Filters
  addFilter: (filter: Omit<ReportFilter, "id">) => void;
  updateFilter: (id: string, changes: Partial<ReportFilter>) => void;
  removeFilter: (id: string) => void;

  // Groupings
  addGrouping: (field: string) => void;
  removeGrouping: (id: string) => void;
  reorderGroupings: (fromIndex: number, toIndex: number) => void;

  // Date grouping
  setDateGrouping: (dateGrouping: ReportDateGrouping | null) => void;

  // Aggregations
  addAggregation: (aggregation: Omit<ReportAggregation, "id">) => void;
  updateAggregation: (id: string, changes: Partial<ReportAggregation>) => void;
  removeAggregation: (id: string) => void;

  // Widgets
  addWidget: (type: WidgetType) => void;
  updateWidget: (id: string, changes: Partial<ReportWidget>) => void;
  removeWidget: (id: string) => void;
  selectWidget: (id: string | null) => void;
  updateWidgetGrid: (id: string, breakpoint: "lg" | "sm", pos: { x: number; y: number; w: number; h: number }) => void;
  duplicateWidget: (id: string) => void;

  // Configuration
  setConfiguration: (config: ReportConfiguration) => void;
  getConfiguration: () => ReportConfiguration;

  // Schema
  setSchema: (schema: ReportableSchema) => void;

  // Mode
  setEditMode: (editMode: boolean) => void;
  setPreviewMode: (previewMode: boolean) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Reset
  reset: () => void;
}

type ReportBuilderContextType = ReportBuilderState & ReportBuilderActions;

const ReportBuilderCtx = createContext<ReportBuilderContextType | null>(null);

export function useReportBuilder() {
  const ctx = useContext(ReportBuilderCtx);
  if (!ctx) throw new Error("useReportBuilder must be used within ReportBuilderProvider");
  return ctx;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const MAX_HISTORY = 50;

const DEFAULT_CONFIGURATION: ReportConfiguration = {
  filters: [],
  groupings: [],
  aggregations: [],
  widgets: [],
};

interface ReportBuilderProviderProps {
  children: React.ReactNode;
  initialReportId?: string;
  initialName?: string;
  initialDescription?: string;
  initialEntity?: string;
  initialConfiguration?: ReportConfiguration;
  initialSchema?: ReportableSchema;
  onChange?: (config: {
    name: string;
    description: string;
    entity: string;
    configuration: ReportConfiguration;
  }) => void;
}

export function ReportBuilderProvider({
  children,
  initialReportId,
  initialName = "",
  initialDescription = "",
  initialEntity = "",
  initialConfiguration = DEFAULT_CONFIGURATION,
  initialSchema,
  onChange,
}: ReportBuilderProviderProps) {
  const [reportId] = useState(initialReportId);
  const [name, setNameState] = useState(initialName);
  const [description, setDescriptionState] = useState(initialDescription);
  const [entity, setEntityState] = useState(initialEntity);
  const [configuration, setConfigurationState] = useState<ReportConfiguration>(initialConfiguration);
  const [schema, setSchemaState] = useState<ReportableSchema | null>(initialSchema || null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const historyRef = useRef<ReportConfiguration[]>([initialConfiguration]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((newConfig: ReportConfiguration) => {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    const truncated = h.slice(0, idx + 1);
    truncated.push(deepClone(newConfig));
    if (truncated.length > MAX_HISTORY) truncated.shift();
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
  }, []);

  const updateConfiguration = useCallback(
    (newConfig: ReportConfiguration) => {
      setConfigurationState(newConfig);
      pushHistory(newConfig);
      setIsDirty(true);
      onChange?.({ name, description, entity, configuration: newConfig });
    },
    [pushHistory, onChange, name, description, entity]
  );

  // ── Entity ─────────────────────────────────────────────────

  const setEntity = useCallback(
    (newEntity: string) => {
      setEntityState(newEntity);
      // Reset configuration when entity changes
      const newConfig = { ...DEFAULT_CONFIGURATION };
      setConfigurationState(newConfig);
      setIsDirty(true);
      onChange?.({ name, description, entity: newEntity, configuration: newConfig });
    },
    [name, description, onChange]
  );

  const getEntitySchema = useCallback((): ReportableEntity | null => {
    if (!schema || !entity) return null;
    return schema.entities.find((e) => e.name === entity) || null;
  }, [schema, entity]);

  // ── Basic Info ─────────────────────────────────────────────

  const setName = useCallback(
    (newName: string) => {
      setNameState(newName);
      setIsDirty(true);
      onChange?.({ name: newName, description, entity, configuration });
    },
    [description, entity, configuration, onChange]
  );

  const setDescription = useCallback(
    (newDesc: string) => {
      setDescriptionState(newDesc);
      setIsDirty(true);
      onChange?.({ name, description: newDesc, entity, configuration });
    },
    [name, entity, configuration, onChange]
  );

  // ── Filters ────────────────────────────────────────────────

  const addFilter = useCallback(
    (filter: Omit<ReportFilter, "id">) => {
      const newFilter: ReportFilter = { ...filter, id: generateId() };
      const newConfig = {
        ...configuration,
        filters: [...(configuration.filters || []), newFilter],
      };
      updateConfiguration(newConfig);
    },
    [configuration, updateConfiguration]
  );

  const updateFilter = useCallback(
    (id: string, changes: Partial<ReportFilter>) => {
      const newFilters = (configuration.filters || []).map((f) =>
        f.id === id ? { ...f, ...changes } : f
      );
      updateConfiguration({ ...configuration, filters: newFilters });
    },
    [configuration, updateConfiguration]
  );

  const removeFilter = useCallback(
    (id: string) => {
      const newFilters = (configuration.filters || []).filter((f) => f.id !== id);
      updateConfiguration({ ...configuration, filters: newFilters });
    },
    [configuration, updateConfiguration]
  );

  // ── Groupings ──────────────────────────────────────────────

  const addGrouping = useCallback(
    (field: string) => {
      const newGrouping: ReportGrouping = { id: generateId(), field };
      const newConfig = {
        ...configuration,
        groupings: [...(configuration.groupings || []), newGrouping],
      };
      updateConfiguration(newConfig);
    },
    [configuration, updateConfiguration]
  );

  const removeGrouping = useCallback(
    (id: string) => {
      const newGroupings = (configuration.groupings || []).filter((g) => g.id !== id);
      updateConfiguration({ ...configuration, groupings: newGroupings });
    },
    [configuration, updateConfiguration]
  );

  const reorderGroupings = useCallback(
    (fromIndex: number, toIndex: number) => {
      const groupings = [...(configuration.groupings || [])];
      const [moved] = groupings.splice(fromIndex, 1);
      groupings.splice(toIndex, 0, moved);
      updateConfiguration({ ...configuration, groupings });
    },
    [configuration, updateConfiguration]
  );

  // ── Date Grouping ──────────────────────────────────────────

  const setDateGrouping = useCallback(
    (dateGrouping: ReportDateGrouping | null) => {
      updateConfiguration({
        ...configuration,
        dateGrouping: dateGrouping || undefined,
      });
    },
    [configuration, updateConfiguration]
  );

  // ── Aggregations ───────────────────────────────────────────

  const addAggregation = useCallback(
    (aggregation: Omit<ReportAggregation, "id">) => {
      const newAgg: ReportAggregation = { ...aggregation, id: generateId() };
      const newConfig = {
        ...configuration,
        aggregations: [...(configuration.aggregations || []), newAgg],
      };
      updateConfiguration(newConfig);
    },
    [configuration, updateConfiguration]
  );

  const updateAggregation = useCallback(
    (id: string, changes: Partial<ReportAggregation>) => {
      const newAggs = (configuration.aggregations || []).map((a) =>
        a.id === id ? { ...a, ...changes } : a
      );
      updateConfiguration({ ...configuration, aggregations: newAggs });
    },
    [configuration, updateConfiguration]
  );

  const removeAggregation = useCallback(
    (id: string) => {
      const newAggs = (configuration.aggregations || []).filter((a) => a.id !== id);
      updateConfiguration({ ...configuration, aggregations: newAggs });
    },
    [configuration, updateConfiguration]
  );

  // ── Widgets ────────────────────────────────────────────────

  const addWidget = useCallback(
    (type: WidgetType) => {
      const widgets = configuration.widgets || [];
      const newWidget = createDefaultWidget(type, widgets.length);

      // Auto-initialize widget config based on report configuration
      const groupings = configuration.groupings || [];
      const aggregations = configuration.aggregations || [];
      const dateGrouping = configuration.dateGrouping;

      // For bar/pie charts, set groupBy from first grouping
      if ((type === "bar" || type === "pie") && groupings.length > 0) {
        newWidget.config.groupBy = groupings[0].field;
      }

      // For line/area charts, set dateField from dateGrouping
      if ((type === "line" || type === "area") && dateGrouping) {
        newWidget.config.dateField = dateGrouping.field;
        newWidget.config.dateInterval = dateGrouping.interval;
      }

      // Set aggregation from first aggregation if available
      if (aggregations.length > 0) {
        newWidget.config.aggregation = {
          field: aggregations[0].field,
          function: aggregations[0].function,
        };
      } else {
        // Default to count
        newWidget.config.aggregation = {
          field: "*",
          function: "count",
        };
      }

      updateConfiguration({
        ...configuration,
        widgets: [...widgets, newWidget],
      });
      setSelectedWidgetId(newWidget.id);
    },
    [configuration, updateConfiguration]
  );

  const updateWidget = useCallback(
    (id: string, changes: Partial<ReportWidget>) => {
      const newWidgets = (configuration.widgets || []).map((w) =>
        w.id === id ? { ...w, ...changes } : w
      );
      updateConfiguration({ ...configuration, widgets: newWidgets });
    },
    [configuration, updateConfiguration]
  );

  const removeWidget = useCallback(
    (id: string) => {
      const newWidgets = (configuration.widgets || []).filter((w) => w.id !== id);
      updateConfiguration({ ...configuration, widgets: newWidgets });
      if (selectedWidgetId === id) setSelectedWidgetId(null);
    },
    [configuration, updateConfiguration, selectedWidgetId]
  );

  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
  }, []);

  const updateWidgetGrid = useCallback(
    (
      id: string,
      breakpoint: "lg" | "sm",
      pos: { x: number; y: number; w: number; h: number }
    ) => {
      const newWidgets = (configuration.widgets || []).map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          grid: {
            ...w.grid,
            [breakpoint]: { ...w.grid[breakpoint], ...pos },
          },
        };
      });
      updateConfiguration({ ...configuration, widgets: newWidgets });
    },
    [configuration, updateConfiguration]
  );

  const duplicateWidget = useCallback(
    (id: string) => {
      const widget = (configuration.widgets || []).find((w) => w.id === id);
      if (!widget) return;

      const widgets = configuration.widgets || [];
      const newWidget: ReportWidget = {
        ...deepClone(widget),
        id: generateId(),
        title: `${widget.title} (Copy)`,
        grid: {
          lg: { ...widget.grid.lg, y: widget.grid.lg.y + widget.grid.lg.h },
          sm: { ...widget.grid.sm, y: widget.grid.sm.y + widget.grid.sm.h },
        },
      };

      updateConfiguration({
        ...configuration,
        widgets: [...widgets, newWidget],
      });
      setSelectedWidgetId(newWidget.id);
    },
    [configuration, updateConfiguration]
  );

  // ── Configuration ──────────────────────────────────────────

  const setConfiguration = useCallback(
    (config: ReportConfiguration) => {
      updateConfiguration(config);
    },
    [updateConfiguration]
  );

  const getConfiguration = useCallback(() => {
    return configuration;
  }, [configuration]);

  // ── Schema ─────────────────────────────────────────────────

  const setSchema = useCallback((newSchema: ReportableSchema) => {
    setSchemaState(newSchema);
  }, []);

  // ── History ────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prev = deepClone(historyRef.current[historyIndexRef.current]);
      setConfigurationState(prev);
      onChange?.({ name, description, entity, configuration: prev });
    }
  }, [name, description, entity, onChange]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const next = deepClone(historyRef.current[historyIndexRef.current]);
      setConfigurationState(next);
      onChange?.({ name, description, entity, configuration: next });
    }
  }, [name, description, entity, onChange]);

  // ── Reset ──────────────────────────────────────────────────

  const reset = useCallback(() => {
    setNameState("");
    setDescriptionState("");
    setEntityState("");
    setConfigurationState(DEFAULT_CONFIGURATION);
    setSelectedWidgetId(null);
    setIsDirty(false);
    historyRef.current = [DEFAULT_CONFIGURATION];
    historyIndexRef.current = 0;
  }, []);

  const value: ReportBuilderContextType = {
    // State
    reportId,
    name,
    description,
    entity,
    configuration,
    schema,
    selectedWidgetId,
    editMode,
    previewMode,
    history: historyRef.current,
    historyIndex: historyIndexRef.current,
    isDirty,

    // Actions
    setEntity,
    getEntitySchema,
    setName,
    setDescription,
    addFilter,
    updateFilter,
    removeFilter,
    addGrouping,
    removeGrouping,
    reorderGroupings,
    setDateGrouping,
    addAggregation,
    updateAggregation,
    removeAggregation,
    addWidget,
    updateWidget,
    removeWidget,
    selectWidget,
    updateWidgetGrid,
    duplicateWidget,
    setConfiguration,
    getConfiguration,
    setSchema,
    setEditMode,
    setPreviewMode,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    reset,
  };

  return (
    <ReportBuilderCtx.Provider value={value}>{children}</ReportBuilderCtx.Provider>
  );
}
