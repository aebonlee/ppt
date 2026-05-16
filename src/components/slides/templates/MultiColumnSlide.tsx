import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const MultiColumnSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const columns = slide.columns || [];
  const colCount = slide.type === 'three-column' ? 3 : 2;
  const colGap = 24;
  const colWidth = (width - mx * 2 - colGap * (colCount - 1)) / colCount;

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          {colCount === 3 ? 'THREE COLUMNS' : 'TWO COLUMNS'}
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* Columns */}
      <div style={{ position: 'absolute', left: mx, top: 130, width: width - mx * 2, display: 'flex', gap: colGap }}>
        {columns.slice(0, colCount).map((col, i) => (
          <div key={i} style={{ width: colWidth, padding: '16px 0' }}>
            {/* Column icon/number */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12,
            }}>
              {col.icon || String(i + 1)}
            </div>

            {/* Column title */}
            {col.title && (
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>
                {col.title}
              </div>
            )}

            {/* Column body */}
            {col.body && (
              <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                {col.body}
              </div>
            )}

            {/* Column items */}
            {col.items && col.items.length > 0 && (
              <ul style={{ margin: '8px 0 0 0', padding: '0 0 0 16px', listStyle: 'none' }}>
                {col.items.map((item, ii) => (
                  <li key={ii} style={{ fontSize: 10, color: '#555', marginBottom: 4, position: 'relative', paddingLeft: 12 }}>
                    <span style={{ position: 'absolute', left: 0, color: colors.accent }}>{'\u2022'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Divider between columns (except last) */}
            {i < colCount - 1 && (
              <div style={{
                position: 'absolute', left: mx + colWidth * (i + 1) + colGap * i + colGap / 2 - 0.5,
                top: 130, width: 1, height: height - 200,
                background: `${colors.primary}15`,
              }} />
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
