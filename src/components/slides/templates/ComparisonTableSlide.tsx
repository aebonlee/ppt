import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ComparisonTableSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const headers = slide.comparisonHeaders || [];
  const rows = slide.comparisonRows || [];

  const tableTop = 140;
  const tableWidth = width - mx * 2;
  const colWidth = headers.length > 0 ? tableWidth / (headers.length + 1) : tableWidth / 2;
  const rowHeight = Math.min(44, (height - tableTop - 80) / (rows.length + 1));

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          {slide.type === 'assessment-table' ? 'ASSESSMENT' : 'COMPARISON'}
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* Table */}
      <div style={{ position: 'absolute', left: mx, top: tableTop, width: tableWidth }}>
        {/* Header row */}
        <div style={{ display: 'flex', borderBottom: `2px solid ${colors.primary}` }}>
          <div style={{ width: colWidth, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: colors.primary }}>
            Criteria
          </div>
          {headers.map((h, i) => (
            <div key={i} style={{ width: colWidth, padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#fff', background: i === 0 ? colors.primary : colors.accent2, textAlign: 'center' }}>
              {h}
            </div>
          ))}
        </div>
        {/* Data rows */}
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', borderBottom: '1px solid #eee', background: ri % 2 === 0 ? '#fff' : '#f8f9fa' }}>
            <div style={{ width: colWidth, padding: '8px 12px', fontSize: 11, fontWeight: 600, color: colors.primary, height: rowHeight, display: 'flex', alignItems: 'center' }}>
              {row.label}
            </div>
            {row.values.map((val, vi) => (
              <div key={vi} style={{ width: colWidth, padding: '8px 12px', fontSize: 11, color: '#333', textAlign: 'center', height: rowHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footnote */}
      {slide.footnote && (
        <div style={{ position: 'absolute', left: mx, bottom: 35, fontSize: 8, color: '#999' }}>{slide.footnote}</div>
      )}

      {/* Page number */}
      {slide.pageNumber && (
        <div style={{ position: 'absolute', right: mx, bottom: 15, fontSize: 8, fontWeight: 600, color: colors.primary }}>
          {formatPageNumber(slide.pageNumber, t.layout.footer.pageNumberFormat)}
        </div>
      )}
    </div>
  );
};
