import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const KPIDashboardSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const metrics = slide.kpiMetrics || [];

  const cols = metrics.length <= 3 ? metrics.length : metrics.length <= 4 ? 2 : 3;
  const rows = Math.ceil(metrics.length / cols);
  const cardGap = 16;
  const cardW = (width - mx * 2 - cardGap * (cols - 1)) / cols;
  const cardH = Math.min(160, (height - 220 - cardGap * (rows - 1)) / rows);

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          KPI DASHBOARD
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || 'Key Metrics'}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ position: 'absolute', left: mx, top: 130, width: width - mx * 2, display: 'flex', flexWrap: 'wrap', gap: cardGap }}>
        {metrics.map((metric, i) => (
          <div key={i} style={{
            width: cardW, height: cardH,
            background: '#f8f9fa', borderRadius: 8,
            border: `1px solid ${colors.primary}20`,
            padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.accent2, letterSpacing: '0.05em', marginBottom: 8 }}>
              {metric.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: colors.primary }}>{metric.value}</span>
              {metric.unit && <span style={{ fontSize: 14, color: '#666' }}>{metric.unit}</span>}
            </div>
            {metric.trend && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  fontSize: 14,
                  color: metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#6B7280',
                }}>
                  {metric.trend === 'up' ? '\u25B2' : metric.trend === 'down' ? '\u25BC' : '\u25CF'}
                </span>
                {metric.trendValue && (
                  <span style={{ fontSize: 11, color: metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#6B7280' }}>
                    {metric.trendValue}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Page number */}
      {slide.pageNumber && (
        <div style={{ position: 'absolute', right: mx, bottom: 15, fontSize: 8, fontWeight: 600, color: colors.primary }}>
          {formatPageNumber(slide.pageNumber, t.layout.footer.pageNumberFormat)}
        </div>
      )}
    </div>
  );
};
