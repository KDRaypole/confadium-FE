import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface ChartData {
  id: string;
  name: string;
  value: number;
  category?: string;
  created_at: string;
  tags: string[];
  [key: string]: any;
}

interface D3ChartProps {
  data: ChartData[];
  type: 'bar' | 'pie' | 'timeline' | 'scatter';
  width?: number;
  height?: number;
  title?: string;
  xKey?: string;
  yKey?: string;
  className?: string;
  isDarkMode?: boolean;
}

export default function D3Chart({
  data,
  type,
  width = 400,
  height = 250,
  title,
  xKey = 'value',
  yKey = 'count',
  className = '',
  isDarkMode = false
}: D3ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colors = {
      primary: isDarkMode ? '#60A5FA' : '#3B82F6',
      secondary: isDarkMode ? '#34D399' : '#10B981',
      text: isDarkMode ? '#E5E7EB' : '#6B7280',
      background: isDarkMode ? '#374151' : '#F9FAFB'
    };

    switch (type) {
      case 'bar':
        createBarChart(g, data, innerWidth, innerHeight, colors);
        break;
      case 'pie':
        createPieChart(g, data, Math.min(innerWidth, innerHeight) / 2 - 10, colors);
        break;
      case 'timeline':
        createTimelineChart(g, data, innerWidth, innerHeight, colors);
        break;
      case 'scatter':
        createScatterChart(g, data, innerWidth, innerHeight, colors);
        break;
    }
  }, [data, type, width, height, xKey, yKey, isDarkMode]);

  const createBarChart = (g: any, data: ChartData[], width: number, height: number, colors: any) => {
    const bins = d3.bin()
      .value(d => d.value)
      .thresholds(10)(data);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([height, 0]);

    // Add bars
    g.selectAll(".bar")
      .data(bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => x(d.x0 || 0))
      .attr("width", (d: any) => Math.max(0, x(d.x1 || 0) - x(d.x0 || 0) - 1))
      .attr("y", (d: any) => y(d.length))
      .attr("height", (d: any) => height - y(d.length))
      .attr("fill", colors.primary)
      .attr("opacity", 0.8)
      .on("mouseover", function(this: any, event: any, d: any) {
        d3.select(this).attr("opacity", 1);
        
        // Tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${x(d.x0)}, ${y(d.length)})`);
        
        const rect = tooltip.append("rect")
          .attr("x", -30)
          .attr("y", -25)
          .attr("width", 60)
          .attr("height", 20)
          .attr("fill", colors.background)
          .attr("stroke", colors.text)
          .attr("rx", 3);
        
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -10)
          .style("font-size", "12px")
          .style("fill", colors.text)
          .text(d.length);
      })
      .on("mouseout", function(this: any) {
        d3.select(this).attr("opacity", 0.8);
        g.select(".tooltip").remove();
      });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0s")))
      .selectAll("text")
      .style("fill", colors.text);

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", colors.text);

    // Add axis lines
    g.selectAll(".domain, .tick line")
      .style("stroke", colors.text);
  };

  const createPieChart = (g: any, data: ChartData[], radius: number, colors: any) => {
    const statusCounts = d3.rollup(
      data,
      v => v.length,
      d => d.status || d.stage || d.outcome || d.category || "Other"
    );

    const pie = d3.pie<[string, number]>()
      .value(d => d[1])
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(0)
      .outerRadius(radius);

    const color = d3.scaleOrdinal()
      .domain(Array.from(statusCounts.keys()))
      .range(d3.schemeSet3);

    const arcs = g.selectAll(".arc")
      .data(pie(Array.from(statusCounts)))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d: any, i: number) => color(d.data[0]))
      .attr("stroke", colors.background)
      .attr("stroke-width", 2)
      .on("mouseover", function(this: any, event: any, d: any) {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function(this: any) {
        d3.select(this).attr("opacity", 1);
      });

    // Add labels
    arcs.append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text((d: any) => d.data[1] > 2 ? d.data[0] : '');

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${radius + 20}, ${-radius})`);

    const legendItems = legend.selectAll(".legend-item")
      .data(Array.from(statusCounts))
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d: any, i: number) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d: any) => color(d[0]));

    legendItems.append("text")
      .attr("x", 16)
      .attr("y", 6)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", colors.text)
      .text((d: any) => `${d[0]} (${d[1]})`);
  };

  const createTimelineChart = (g: any, data: ChartData[], width: number, height: number, colors: any) => {
    const dailyData = d3.rollup(
      data,
      v => v.length,
      d => d3.timeDay(new Date(d.created_at))
    );

    const timelineData = Array.from(dailyData, ([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (timelineData.length === 0) return;

    const x = d3.scaleTime()
      .domain(d3.extent(timelineData, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.count) || 0])
      .range([height, 0]);

    const line = d3.line<{ date: Date; count: number }>()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    const area = d3.area<{ date: Date; count: number }>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Add area
    g.append("path")
      .datum(timelineData)
      .attr("fill", colors.primary)
      .attr("opacity", 0.3)
      .attr("d", area);

    // Add line
    g.append("path")
      .datum(timelineData)
      .attr("fill", "none")
      .attr("stroke", colors.primary)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(timelineData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.count))
      .attr("r", 4)
      .attr("fill", colors.primary)
      .attr("stroke", colors.background)
      .attr("stroke-width", 2)
      .on("mouseover", function(this: any, event: any, d: any) {
        d3.select(this).attr("r", 6);
        
        // Tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${x(d.date)}, ${y(d.count)})`);
        
        tooltip.append("rect")
          .attr("x", -40)
          .attr("y", -35)
          .attr("width", 80)
          .attr("height", 25)
          .attr("fill", colors.background)
          .attr("stroke", colors.text)
          .attr("rx", 3);
        
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -20)
          .style("font-size", "12px")
          .style("fill", colors.text)
          .text(`${d.count} items`);
        
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -8)
          .style("font-size", "10px")
          .style("fill", colors.text)
          .text(d3.timeFormat("%m/%d")(d.date));
      })
      .on("mouseout", function(this: any) {
        d3.select(this).attr("r", 4);
        g.select(".tooltip").remove();
      });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")))
      .selectAll("text")
      .style("fill", colors.text);

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", colors.text);

    // Add axis lines
    g.selectAll(".domain, .tick line")
      .style("stroke", colors.text);
  };

  const createScatterChart = (g: any, data: ChartData[], width: number, height: number, colors: any) => {
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.revenue || d.duration || Math.random() * 100) as [number, number])
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add dots
    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.value))
      .attr("cy", d => y(d.revenue || d.duration || Math.random() * 100))
      .attr("r", 5)
      .attr("fill", (d: any) => color(d.category || d.status || 'default'))
      .attr("opacity", 0.7)
      .on("mouseover", function(this: any, event: any, d: any) {
        d3.select(this).attr("r", 7).attr("opacity", 1);
      })
      .on("mouseout", function(this: any) {
        d3.select(this).attr("r", 5).attr("opacity", 0.7);
      });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", colors.text);

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", colors.text);

    // Add axis lines
    g.selectAll(".domain, .tick line")
      .style("stroke", colors.text);
  };

  return (
    <div className={`${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h4>
      )}
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  );
}