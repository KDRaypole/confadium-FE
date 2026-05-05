import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';

// ── Reportable Schema Types ──────────────────────────────────

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'date_histogram';

export interface ReportableAttribute {
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean';
  format?: 'date' | 'date-time' | 'email' | 'uri';
  filterable: boolean;
  sortable: boolean;
  searchable: boolean;
  aggregatable: boolean;
  aggregations: AggregationType[];
}

export interface ReportableEntity {
  name: string;
  attributes: ReportableAttribute[];
}

export interface ReportableSchema {
  entities: ReportableEntity[];
}

// ── Report Filter Types ──────────────────────────────────────

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'in'
  | 'between'
  | 'is_null'
  | 'is_not_null';

export interface ReportFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

// ── Report Grouping Types ────────────────────────────────────

export interface ReportGrouping {
  id: string;
  field: string;
}

export type DateInterval = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface ReportDateGrouping {
  field: string;
  interval: DateInterval;
}

// ── Report Aggregation Types ─────────────────────────────────

export type AggregationFunction = 'count' | 'sum' | 'avg' | 'min' | 'max';

export interface ReportAggregation {
  id: string;
  field: string;
  function: AggregationFunction;
}

// ── Report Widget Types ──────────────────────────────────────

export type WidgetType = 'metric' | 'bar' | 'pie' | 'line' | 'area' | 'table';

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  groupBy?: string;
  dateField?: string;
  dateInterval?: DateInterval;
  aggregation?: {
    field: string;
    function: AggregationFunction;
  };
  filters?: ReportFilter[];
  limit?: number;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  stacked?: boolean;
}

export interface ReportWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  grid: {
    lg: GridPosition;
    sm: GridPosition;
  };
}

// ── Report Configuration ─────────────────────────────────────

export interface ReportConfiguration {
  filters?: ReportFilter[];
  groupings?: ReportGrouping[];
  dateGrouping?: ReportDateGrouping;
  aggregations?: ReportAggregation[];
  widgets?: ReportWidget[];
}

// ── Report Attributes ────────────────────────────────────────

export interface ReportAttributes {
  name: string;
  description: string | null;
  entity: 'contacts' | 'deals' | 'activities';
  configuration: ReportConfiguration;
  created_at: string;
  updated_at: string;
}

export type Report = Resource<ReportAttributes>;

// ── Report Execution Result ──────────────────────────────────

export interface ReportExecutionResult {
  data: Record<string, unknown>[];
  meta: {
    total: number;
    entity: string;
    executed_at: string;
  };
}

// ── API Functions ────────────────────────────────────────────

const basePath = (orgId: string) => `/organizations/${orgId}/reports`;

export const reportsAPI = {
  /**
   * Fetch the reportable schema (available entities and their attributes)
   */
  async getSchema(): Promise<ReportableSchema> {
    return api.get<ReportableSchema>('/reportable/schema');
  },

  /**
   * List all reports for an organization
   */
  async getReports(orgId: string, params?: QueryParams): Promise<CollectionDocument<ReportAttributes>> {
    return api.get<CollectionDocument<ReportAttributes>>(basePath(orgId), params);
  },

  /**
   * Get a single report by ID
   */
  async getReportById(id: string): Promise<ResourceDocument<ReportAttributes>> {
    return api.get<ResourceDocument<ReportAttributes>>(`/reports/${id}`, { included: 'organization' });
  },

  /**
   * Create a new report
   */
  async createReport(
    orgId: string,
    attrs: Partial<ReportAttributes>
  ): Promise<ResourceDocument<ReportAttributes>> {
    return api.post<ResourceDocument<ReportAttributes>>(basePath(orgId), buildResource('report', attrs));
  },

  /**
   * Update an existing report
   */
  async updateReport(
    id: string,
    attrs: Partial<ReportAttributes>
  ): Promise<ResourceDocument<ReportAttributes>> {
    return api.patch<ResourceDocument<ReportAttributes>>(`/reports/${id}`, buildResource('report', attrs, id));
  },

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    return api.delete(`/reports/${id}`);
  },

  /**
   * Execute a report and return aggregated data
   */
  async executeReport(id: string): Promise<ReportExecutionResult> {
    return api.post<ReportExecutionResult>(`/reports/${id}/execute`, {});
  },
};

// ── Helper Functions ─────────────────────────────────────────

/**
 * Get the appropriate input type for a filter based on attribute type and format
 */
export function getFilterInputType(attr: ReportableAttribute): 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' {
  if (attr.format === 'date') return 'date';
  if (attr.format === 'date-time') return 'datetime';
  if (attr.type === 'boolean') return 'boolean';
  if (attr.type === 'number' || attr.type === 'integer') return 'number';
  return 'text';
}

/**
 * Get available operators for a given attribute type
 */
export function getOperatorsForType(attr: ReportableAttribute): FilterOperator[] {
  const baseOps: FilterOperator[] = ['eq', 'neq', 'is_null', 'is_not_null'];

  if (attr.type === 'string' && !attr.format) {
    return [...baseOps, 'contains', 'in'];
  }

  if (attr.type === 'number' || attr.type === 'integer') {
    return [...baseOps, 'gt', 'gte', 'lt', 'lte', 'between', 'in'];
  }

  if (attr.format === 'date' || attr.format === 'date-time') {
    return [...baseOps, 'gt', 'gte', 'lt', 'lte', 'between'];
  }

  return baseOps;
}

/**
 * Human-readable operator labels
 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'equals',
  neq: 'does not equal',
  gt: 'greater than',
  gte: 'greater than or equal to',
  lt: 'less than',
  lte: 'less than or equal to',
  contains: 'contains',
  in: 'is one of',
  between: 'is between',
  is_null: 'is empty',
  is_not_null: 'is not empty',
};

/**
 * Human-readable aggregation function labels
 */
export const AGGREGATION_LABELS: Record<AggregationFunction, string> = {
  count: 'Count',
  sum: 'Sum',
  avg: 'Average',
  min: 'Minimum',
  max: 'Maximum',
};

/**
 * Human-readable date interval labels
 */
export const DATE_INTERVAL_LABELS: Record<DateInterval, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
};

/**
 * Generate a unique ID for widgets, filters, etc.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default widget configuration
 */
export function createDefaultWidget(type: WidgetType, index: number): ReportWidget {
  const col = index % 2;
  const row = Math.floor(index / 2);

  return {
    id: generateId(),
    type,
    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
    config: {},
    grid: {
      lg: { x: col * 6, y: row * 4, w: 6, h: 4 },
      sm: { x: 0, y: index * 4, w: 6, h: 4 },
    },
  };
}
