import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import {
  reportsAPI,
  type ReportAttributes,
  type ReportableSchema,
  type ReportExecutionResult,
} from '~/lib/api/reports';
import type { Resource } from '~/lib/api/client';

export type Report = Resource<ReportAttributes>;

export const REPORTS_QUERY_KEYS = {
  all: ['reports'] as const,
  schema: ['reports', 'schema'] as const,
  list: (orgId: string, page?: number, size?: number) =>
    [...REPORTS_QUERY_KEYS.all, 'list', orgId, page, size] as const,
  detail: (id: string) => [...REPORTS_QUERY_KEYS.all, 'detail', id] as const,
  execution: (id: string) => [...REPORTS_QUERY_KEYS.all, 'execution', id] as const,
};

// ── useReportSchema ──────────────────────────────────────────

/**
 * Fetch the reportable schema (available entities and their attributes)
 */
export const useReportSchema = () => {
  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.schema,
    queryFn: () => reportsAPI.getSchema(),
    staleTime: 1000 * 60 * 30, // Cache schema for 30 minutes
  });

  return {
    schema: query.data as ReportableSchema | undefined,
    entities: query.data?.entities || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};

// ── useReports ───────────────────────────────────────────────

interface UseReportsOptions {
  page?: number;
  pageSize?: number;
}

/**
 * List all reports for the current organization
 */
export const useReports = (options: UseReportsOptions = {}) => {
  const { page = 1, pageSize = 25 } = options;
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.list(orgId, page, pageSize),
    queryFn: () =>
      reportsAPI.getReports(orgId, {
        page: { number: page, size: pageSize },
      }),
    enabled: !!orgId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ReportAttributes>) =>
      reportsAPI.createReport(orgId, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsAPI.deleteReport(id),
    onSuccess: invalidate,
  });

  const pagination = (query.data?.meta as { pagination?: { total?: number; pages?: number } })?.pagination;

  return {
    reports: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    total: pagination?.total || 0,
    totalPages: pagination?.pages || 1,
    createReport: createMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
  };
};

// ── useReport ────────────────────────────────────────────────

/**
 * Get a single report by ID with update/delete capabilities
 */
export const useReport = (reportId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.detail(reportId || ''),
    queryFn: () => reportsAPI.getReportById(reportId!),
    enabled: !!reportId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<ReportAttributes>) =>
      reportsAPI.updateReport(reportId!, attrs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportsAPI.deleteReport(reportId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEYS.all });
    },
  });

  return {
    report: query.data?.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    updateReport: updateMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
};

// ── useReportExecution ───────────────────────────────────────

/**
 * Execute a report and get the aggregated data
 */
export const useReportExecution = (reportId?: string) => {
  const executeMutation = useMutation({
    mutationFn: () => reportsAPI.executeReport(reportId!),
  });

  const query = useQuery({
    queryKey: REPORTS_QUERY_KEYS.execution(reportId || ''),
    queryFn: () => reportsAPI.executeReport(reportId!),
    enabled: !!reportId,
  });

  return {
    results: query.data as ReportExecutionResult | undefined,
    data: query.data?.data || [],
    meta: query.data?.meta,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    execute: executeMutation.mutateAsync,
    executing: executeMutation.isPending,
    executeError: executeMutation.error?.message || null,
  };
};

// ── useReportBuilder ─────────────────────────────────────────

/**
 * Combined hook for the report builder that provides schema, report, and execution
 */
export const useReportBuilder = (reportId?: string) => {
  const schema = useReportSchema();
  const report = useReport(reportId);
  const execution = useReportExecution(reportId);

  return {
    // Schema
    schema: schema.schema,
    entities: schema.entities,
    schemaLoading: schema.loading,

    // Report
    report: report.report,
    reportLoading: report.loading,
    updateReport: report.updateReport,
    deleteReport: report.deleteReport,
    updating: report.updating,

    // Execution
    results: execution.results,
    data: execution.data,
    executionMeta: execution.meta,
    executionLoading: execution.loading,
    execute: execution.execute,
    executing: execution.executing,

    // Combined
    loading: schema.loading || report.loading,
    error: schema.error || report.error || execution.error,
  };
};
