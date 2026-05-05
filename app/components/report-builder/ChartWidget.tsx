import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import type { ReportWidget } from "~/lib/api/reports";
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface ChartWidgetProps {
  widget: ReportWidget;
  data: Record<string, unknown>[];
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  editMode?: boolean;
}

export default function ChartWidget({
  widget,
  data,
  isSelected,
  onSelect,
  onEdit,
  onRemove,
  onDuplicate,
  editMode = true,
}: ChartWidgetProps) {
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate dimensions from container
  const [dimensions, setDimensions] = useState({ width: 400, height: 250 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width - 32, 100), // padding
          height: Math.max(height - 60, 100), // title + padding
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Render chart based on type
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 10, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const isDarkMode = document.documentElement.classList.contains("dark");
    const colors = {
      primary: isDarkMode ? "#60A5FA" : "#3B82F6",
      secondary: isDarkMode ? "#34D399" : "#10B981",
      text: isDarkMode ? "#9CA3AF" : "#6B7280",
      grid: isDarkMode ? "#374151" : "#E5E7EB",
    };

    switch (widget.type) {
      case "bar":
        renderBarChart(g, data, innerWidth, innerHeight, colors, widget.config);
        break;
      case "pie":
        renderPieChart(g, data, innerWidth, innerHeight, colors, widget.config);
        break;
      case "line":
      case "area":
        renderLineChart(
          g,
          data,
          innerWidth,
          innerHeight,
          colors,
          widget.config,
          widget.type === "area"
        );
        break;
      case "metric":
        // Metric is rendered separately in JSX
        break;
    }
  }, [data, dimensions, widget.type, widget.config]);

  // Render metric card
  if (widget.type === "metric") {
    const value = data[0] ? Object.values(data[0])[0] : 0;
    const formattedValue =
      typeof value === "number"
        ? value.toLocaleString()
        : String(value || 0);

    return (
      <WidgetContainer
        ref={containerRef}
        widget={widget}
        isSelected={isSelected}
        onSelect={onSelect}
        editMode={editMode}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        onEdit={onEdit}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {formattedValue}
          </span>
          {widget.config.aggregation && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {widget.config.aggregation.function} of{" "}
              {widget.config.aggregation.field}
            </span>
          )}
        </div>
      </WidgetContainer>
    );
  }

  // Render table
  if (widget.type === "table") {
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return (
      <WidgetContainer
        ref={containerRef}
        widget={widget}
        isSelected={isSelected}
        onSelect={onSelect}
        editMode={editMode}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        onEdit={onEdit}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
      >
        <div className="overflow-auto h-full">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400"
                  >
                    {formatColumnName(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.slice(0, widget.config.limit || 10).map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 text-gray-900 dark:text-gray-100"
                    >
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WidgetContainer>
    );
  }

  // Render chart widgets
  return (
    <WidgetContainer
      ref={containerRef}
      widget={widget}
      isSelected={isSelected}
      onSelect={onSelect}
      editMode={editMode}
      showMenu={showMenu}
      setShowMenu={setShowMenu}
      onEdit={onEdit}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
    >
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
          <span>No data available</span>
          {widget.config.groupBy && (
            <span className="text-xs">Grouped by: {widget.config.groupBy}</span>
          )}
        </div>
      ) : (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible"
        />
      )}
    </WidgetContainer>
  );
}

// ── Widget Container ─────────────────────────────────────────

interface WidgetContainerProps {
  ref: React.RefObject<HTMLDivElement | null>;
  widget: ReportWidget;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  editMode: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
}

function WidgetContainer({
  ref,
  widget,
  children,
  isSelected,
  onSelect,
  editMode,
  showMenu,
  setShowMenu,
  onEdit,
  onRemove,
  onDuplicate,
}: WidgetContainerProps) {
  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`
        h-full bg-white dark:bg-gray-800 rounded-lg border p-4
        ${isSelected ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-gray-200 dark:border-gray-700"}
        ${editMode ? "cursor-move" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {widget.title}
        </h5>
        {editMode && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-10 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart content */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

// ── Chart Renderers ──────────────────────────────────────────

function renderBarChart(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[],
  width: number,
  height: number,
  colors: { primary: string; text: string; grid: string },
  config: ReportWidget["config"]
) {
  // Get the first two fields as category and value
  const keys = Object.keys(data[0] || {});

  // Find the category key - prefer config.groupBy, then look for non-numeric/non-aggregate fields
  const aggregatePatterns = /^(count|sum|avg|min|max)_/i;
  const categoryKey = config.groupBy ||
    keys.find(k => !aggregatePatterns.test(k) && k !== 'date_bucket' && typeof data[0]?.[k] === 'string') ||
    keys.find(k => !aggregatePatterns.test(k) && k !== 'date_bucket') ||
    keys[0];

  // Find the value key - prefer aggregation fields, then numeric fields
  const valueKey = config.aggregation?.field
    ? keys.find(k => k.toLowerCase().includes(config.aggregation!.field.toLowerCase()) || k.startsWith(`${config.aggregation!.function}_`))
    : keys.find(k => aggregatePatterns.test(k)) ||
      keys.find(k => k !== categoryKey && typeof data[0]?.[k] === 'number') ||
      keys.find(k => k !== categoryKey) ||
      keys[1];

  // Handle null/undefined category values
  const formatCategory = (val: unknown): string => {
    if (val === null || val === undefined) return '(Empty)';
    return String(val);
  };

  const x = d3
    .scaleBand()
    .domain(data.map((d) => formatCategory(d[categoryKey])))
    .range([0, width])
    .padding(0.2);

  const maxValue = d3.max(data, (d) => Number(d[valueKey]) || 0) || 1;
  const y = d3
    .scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([height, 0]);

  // Grid lines
  g.append("g")
    .attr("class", "grid")
    .call(
      d3
        .axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => "")
    )
    .selectAll("line")
    .style("stroke", colors.grid)
    .style("stroke-opacity", 0.5);

  // Bars
  const bars = g.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-group");

  bars.append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(formatCategory(d[categoryKey])) || 0)
    .attr("y", (d) => y(Number(d[valueKey]) || 0))
    .attr("width", x.bandwidth())
    .attr("height", (d) => Math.max(0, height - y(Number(d[valueKey]) || 0)))
    .attr("fill", colors.primary)
    .attr("rx", 4);

  // Value labels on top of bars (only show if bar is tall enough)
  bars.append("text")
    .attr("x", (d) => (x(formatCategory(d[categoryKey])) || 0) + x.bandwidth() / 2)
    .attr("y", (d) => y(Number(d[valueKey]) || 0) - 4)
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .style("fill", colors.text)
    .style("font-weight", "500")
    .text((d) => {
      const val = Number(d[valueKey]) || 0;
      const barHeight = height - y(val);
      // Only show label if bar is visible
      if (barHeight < 10) return "";
      return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toLocaleString();
    });

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("fill", colors.text)
    .style("font-size", "10px")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end");

  // Y axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .style("fill", colors.text)
    .style("font-size", "10px");

  // Remove domain lines
  g.selectAll(".domain").remove();
}

function renderPieChart(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[],
  width: number,
  height: number,
  colors: { primary: string; text: string },
  config: ReportWidget["config"]
) {
  const keys = Object.keys(data[0] || {});

  // Find the category key - prefer config.groupBy, then look for non-numeric/non-aggregate fields
  const aggregatePatterns = /^(count|sum|avg|min|max)_/i;
  const categoryKey = config.groupBy ||
    keys.find(k => !aggregatePatterns.test(k) && k !== 'date_bucket' && typeof data[0]?.[k] === 'string') ||
    keys.find(k => !aggregatePatterns.test(k) && k !== 'date_bucket') ||
    keys[0];

  // Find the value key - prefer aggregation fields, then numeric fields
  const valueKey = config.aggregation?.field
    ? keys.find(k => k.toLowerCase().includes(config.aggregation!.field.toLowerCase()) || k.startsWith(`${config.aggregation!.function}_`))
    : keys.find(k => aggregatePatterns.test(k)) ||
      keys.find(k => k !== categoryKey && typeof data[0]?.[k] === 'number') ||
      keys.find(k => k !== categoryKey) ||
      keys[1];

  const radius = Math.min(width, height) / 2;

  // Handle null/undefined category values
  const formatCategory = (val: unknown): string => {
    if (val === null || val === undefined) return '(Empty)';
    return String(val);
  };

  const pie = d3
    .pie<Record<string, unknown>>()
    .value((d) => Number(d[valueKey]) || 0)
    .sort(null);

  const arc = d3
    .arc<d3.PieArcDatum<Record<string, unknown>>>()
    .innerRadius(0)
    .outerRadius(radius - 10);

  const colorScale = d3.scaleOrdinal(d3.schemeSet3);

  const pieG = g.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

  const arcs = pieG
    .selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colorScale(String(i)))
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Labels on slices (only for large slices)
  arcs
    .append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text((d) => {
      const angle = d.endAngle - d.startAngle;
      return angle > 0.5 ? formatCategory(d.data[categoryKey]) : "";
    });

  // Add legend below the pie
  const legendY = height / 2 + radius + 10;
  const legendItemWidth = Math.min(100, width / Math.min(data.length, 3));

  const legend = g.append("g")
    .attr("transform", `translate(${width / 2 - (Math.min(data.length, 3) * legendItemWidth) / 2}, ${legendY})`);

  data.slice(0, 6).forEach((d, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const itemG = legend.append("g")
      .attr("transform", `translate(${col * legendItemWidth}, ${row * 16})`);

    itemG.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", colorScale(String(i)));

    itemG.append("text")
      .attr("x", 14)
      .attr("y", 9)
      .style("font-size", "9px")
      .style("fill", colors.text)
      .text(formatCategory(d[categoryKey]).slice(0, 12));
  });
}

function renderLineChart(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: Record<string, unknown>[],
  width: number,
  height: number,
  colors: { primary: string; text: string; grid: string },
  config: ReportWidget["config"],
  isArea: boolean
) {
  const keys = Object.keys(data[0] || {});

  // Find date key - look for date_bucket first, then config.dateField, then first key
  const xKey = keys.find(k => k === 'date_bucket') ||
    config.dateField ||
    keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('created') || k.toLowerCase().includes('updated')) ||
    keys[0];

  // Find value key - look for aggregation columns
  const aggregatePatterns = /^(count|sum|avg|min|max)_/i;
  const yKey = keys.find(k => aggregatePatterns.test(k)) ||
    keys.find((k) => k !== xKey && typeof data[0]?.[k] === 'number') ||
    keys.find((k) => k !== xKey) ||
    keys[1];

  // Parse dates safely
  const parseDate = (val: unknown): Date | null => {
    if (val === null || val === undefined) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const str = String(val);
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filter out invalid dates and sort
  const validData = data
    .map(d => ({ ...d, _parsedDate: parseDate(d[xKey]) }))
    .filter(d => d._parsedDate !== null)
    .sort((a, b) => a._parsedDate!.getTime() - b._parsedDate!.getTime());

  // If no valid dates, show message and return
  if (validData.length === 0) {
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("fill", colors.text)
      .style("font-size", "12px")
      .text("No valid date data available");
    return;
  }

  const dateExtent = d3.extent(validData, (d) => d._parsedDate) as [Date, Date];

  const x = d3
    .scaleTime()
    .domain(dateExtent)
    .range([0, width]);

  const maxY = d3.max(validData, (d) => Number(d[yKey]) || 0) || 1;
  const y = d3
    .scaleLinear()
    .domain([0, maxY])
    .nice()
    .range([height, 0]);

  // Grid lines
  g.append("g")
    .attr("class", "grid")
    .call(
      d3
        .axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => "")
    )
    .selectAll("line")
    .style("stroke", colors.grid)
    .style("stroke-opacity", 0.5);

  // Area (if area chart)
  if (isArea) {
    const area = d3
      .area<typeof validData[0]>()
      .x((d) => x(d._parsedDate!))
      .y0(height)
      .y1((d) => y(Number(d[yKey]) || 0))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(validData)
      .attr("fill", colors.primary)
      .attr("fill-opacity", 0.2)
      .attr("d", area);
  }

  // Line
  const line = d3
    .line<typeof validData[0]>()
    .x((d) => x(d._parsedDate!))
    .y((d) => y(Number(d[yKey]) || 0))
    .curve(d3.curveMonotoneX);

  g.append("path")
    .datum(validData)
    .attr("fill", "none")
    .attr("stroke", colors.primary)
    .attr("stroke-width", 2)
    .attr("d", line);

  // Dots
  g.selectAll(".dot")
    .data(validData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d._parsedDate!))
    .attr("cy", (d) => y(Number(d[yKey]) || 0))
    .attr("r", 3)
    .attr("fill", colors.primary);

  // X axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text")
    .style("fill", colors.text)
    .style("font-size", "10px");

  // Y axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .style("fill", colors.text)
    .style("font-size", "10px");

  // Remove domain lines
  g.selectAll(".domain").remove();
}

// ── Helpers ──────────────────────────────────────────────────

function formatColumnName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
