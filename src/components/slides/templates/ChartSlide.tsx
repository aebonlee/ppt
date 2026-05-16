import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ChartSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const chart = slide.chartConfig;
  if (!chart) return <div style={{ width, height, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No chart data</div>;

  const chartAreaX = mx + 20;
  const chartAreaY = 140;
  const chartW = width - mx * 2 - 40;
  const chartH = height - 240;

  const renderColumnChart = () => {
    const maxVal = Math.max(...chart.series.flatMap(s => s.data), 1);
    const categories = chart.categories || chart.series[0]?.data.map((_, i) => String(i + 1)) || [];
    const barGroupWidth = chartW / categories.length;
    const barWidth = Math.min(barGroupWidth * 0.6 / chart.series.length, 40);
    const defaultColors = [colors.primary, colors.accent, colors.accent2, colors.mute];

    return (
      <g>
        {/* Y axis */}
        <line x1={0} y1={0} x2={0} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        {/* X axis */}
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <g key={i}>
            <line x1={0} y1={chartH * (1 - r)} x2={chartW} y2={chartH * (1 - r)} stroke="#f0f0f0" strokeWidth={1} strokeDasharray="4,4" />
            <text x={-8} y={chartH * (1 - r) + 4} textAnchor="end" fontSize={9} fill="#999">{Math.round(maxVal * r)}</text>
          </g>
        ))}
        {/* Bars */}
        {categories.map((cat, ci) => (
          <g key={ci}>
            {chart.series.map((series, si) => {
              const barH = (series.data[ci] || 0) / maxVal * chartH;
              const x = ci * barGroupWidth + (barGroupWidth - barWidth * chart.series.length) / 2 + si * barWidth;
              return (
                <rect key={si} x={x} y={chartH - barH} width={barWidth - 2} height={barH} fill={series.color || defaultColors[si % defaultColors.length]} rx={2} />
              );
            })}
            <text x={ci * barGroupWidth + barGroupWidth / 2} y={chartH + 16} textAnchor="middle" fontSize={9} fill="#666">{cat}</text>
          </g>
        ))}
      </g>
    );
  };

  const renderLineChart = () => {
    const maxVal = Math.max(...chart.series.flatMap(s => s.data), 1);
    const categories = chart.categories || chart.series[0]?.data.map((_, i) => String(i + 1)) || [];
    const defaultColors = [colors.primary, colors.accent, colors.accent2, colors.mute];

    return (
      <g>
        <line x1={0} y1={0} x2={0} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <line key={i} x1={0} y1={chartH * (1 - r)} x2={chartW} y2={chartH * (1 - r)} stroke="#f0f0f0" strokeWidth={1} strokeDasharray="4,4" />
        ))}
        {chart.series.map((series, si) => {
          const points = series.data.map((v, i) => {
            const x = categories.length > 1 ? (i / (categories.length - 1)) * chartW : chartW / 2;
            const y = chartH - (v / maxVal) * chartH;
            return `${x},${y}`;
          });
          const color = series.color || defaultColors[si % defaultColors.length];
          return (
            <g key={si}>
              <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
              {series.data.map((v, i) => {
                const x = categories.length > 1 ? (i / (categories.length - 1)) * chartW : chartW / 2;
                const y = chartH - (v / maxVal) * chartH;
                return <circle key={i} cx={x} cy={y} r={4} fill={color} />;
              })}
            </g>
          );
        })}
        {categories.map((cat, ci) => {
          const x = categories.length > 1 ? (ci / (categories.length - 1)) * chartW : chartW / 2;
          return <text key={ci} x={x} y={chartH + 16} textAnchor="middle" fontSize={9} fill="#666">{cat}</text>;
        })}
      </g>
    );
  };

  const renderPieChart = () => {
    const data = chart.series[0]?.data || [];
    const total = data.reduce((a, b) => a + b, 0) || 1;
    const cx = chartW / 2;
    const cy = chartH / 2;
    const r = Math.min(cx, cy) * 0.75;
    const defaultColors = [colors.primary, colors.accent, colors.accent2, colors.mute, '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    let startAngle = -Math.PI / 2;

    return (
      <g>
        {data.map((val, i) => {
          const angle = (val / total) * Math.PI * 2;
          const endAngle = startAngle + angle;
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);
          const largeArc = angle > Math.PI ? 1 : 0;
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          const midAngle = startAngle + angle / 2;
          const labelR = r * 1.2;
          const lx = cx + labelR * Math.cos(midAngle);
          const ly = cy + labelR * Math.sin(midAngle);
          startAngle = endAngle;
          return (
            <g key={i}>
              <path d={path} fill={defaultColors[i % defaultColors.length]} stroke="#fff" strokeWidth={2} />
              {chart.categories?.[i] && (
                <text x={lx} y={ly} textAnchor="middle" fontSize={9} fill="#333">{chart.categories[i]}</text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  const renderBubbleChart = () => {
    const maxVal = Math.max(...chart.series.flatMap(s => s.data), 1);
    const defaultColors = [colors.primary, colors.accent, colors.accent2, colors.mute];

    return (
      <g>
        <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={chartH} stroke="#e0e0e0" strokeWidth={1} />
        {chart.series.map((series, si) => {
          const color = series.color || defaultColors[si % defaultColors.length];
          return series.data.map((v, i) => {
            const x = ((i + 1) / (series.data.length + 1)) * chartW;
            const y = chartH - (v / maxVal) * chartH * 0.8;
            const radius = Math.max(8, (v / maxVal) * 30);
            return <circle key={`${si}-${i}`} cx={x} cy={y} r={radius} fill={color} opacity={0.7} />;
          });
        })}
      </g>
    );
  };

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2, zIndex: 10 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          {chart.type.toUpperCase()} CHART
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || chart.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* Chart area */}
      <svg style={{ position: 'absolute', left: chartAreaX, top: chartAreaY, overflow: 'visible' }} width={chartW} height={chartH}>
        {chart.type === 'column' && renderColumnChart()}
        {chart.type === 'bar' && renderColumnChart()}
        {chart.type === 'line' && renderLineChart()}
        {chart.type === 'pie' && renderPieChart()}
        {chart.type === 'bubble' && renderBubbleChart()}
      </svg>

      {/* Legend */}
      {chart.showLegend !== false && chart.series.length > 1 && (
        <div style={{ position: 'absolute', left: mx, bottom: 50, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {chart.series.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color || [colors.primary, colors.accent, colors.accent2, colors.mute][i % 4] }} />
              <span style={{ fontSize: 10, color: '#666' }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Axis labels */}
      {chart.xAxisLabel && (
        <div style={{ position: 'absolute', left: chartAreaX + chartW / 2, bottom: 20, transform: 'translateX(-50%)', fontSize: 9, color: '#999' }}>{chart.xAxisLabel}</div>
      )}
      {chart.yAxisLabel && (
        <div style={{ position: 'absolute', left: mx, top: chartAreaY + chartH / 2, transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: 'left center', fontSize: 9, color: '#999' }}>{chart.yAxisLabel}</div>
      )}

      {/* Page number */}
      {slide.pageNumber && (
        <div style={{ position: 'absolute', right: mx, bottom: 15, fontSize: 8, fontWeight: 600, color: colors.primary }}>
          {formatPageNumber(slide.pageNumber, t.layout.footer.pageNumberFormat)}
        </div>
      )}

      {/* Footnote */}
      {slide.footnote && (
        <div style={{ position: 'absolute', left: mx, bottom: 15, fontSize: 8, color: '#999' }}>{slide.footnote}</div>
      )}
    </div>
  );
};
