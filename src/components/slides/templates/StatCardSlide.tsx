import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const StatCardSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const stats = slide.statHighlight || [];

  const cols = stats.length <= 2 ? stats.length : stats.length <= 4 ? 2 : 3;
  const rows = Math.ceil(stats.length / cols);
  const cardGap = 20;
  const cardW = (width - mx * 2 - cardGap * (cols - 1)) / cols;
  const cardH = Math.min(180, (height - 200 - cardGap * (rows - 1)) / rows);

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          KEY STATISTICS
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ position: 'absolute', left: mx, top: 130, width: width - mx * 2, display: 'flex', flexWrap: 'wrap', gap: cardGap, justifyContent: 'center' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            width: cardW, height: cardH,
            background: stat.color ? `${stat.color}08` : `${colors.primary}08`,
            borderRadius: 12, padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderTop: `4px solid ${stat.color || colors.primary}`,
          }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: stat.color || colors.primary, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.primary, marginTop: 12, textAlign: 'center' }}>
              {stat.label}
            </div>
            {stat.description && (
              <div style={{ fontSize: 10, color: '#666', marginTop: 6, textAlign: 'center', lineHeight: 1.4 }}>
                {stat.description}
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
