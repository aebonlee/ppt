import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const QuoteSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const quote = slide.quote;
  if (!quote) return <div style={{ width, height, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No quote data</div>;

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Decorative background */}
      <div style={{ position: 'absolute', left: 0, top: 0, width, height, background: `linear-gradient(135deg, ${colors.primary}05 0%, ${colors.accent}08 100%)` }} />

      {/* Large quotation mark */}
      <div style={{ position: 'absolute', left: mx + 20, top: height * 0.2, fontSize: 120, fontWeight: 900, color: `${colors.primary}15`, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {'\u201C'}
      </div>

      {/* Quote text */}
      <div style={{
        position: 'absolute', left: mx + 40, top: height * 0.3, width: width - mx * 2 - 80,
        fontSize: Math.min(24, width / 30), fontWeight: 500, color: colors.primary,
        lineHeight: 1.6, fontStyle: 'italic',
      }}>
        {quote.text}
      </div>

      {/* Author */}
      <div style={{ position: 'absolute', left: mx + 40, bottom: height * 0.2, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Accent line */}
        <div style={{ width: 40, height: 2, background: colors.accent }} />
        <div>
          {quote.author && (
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{quote.author}</div>
          )}
          {quote.source && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{quote.source}</div>
          )}
        </div>
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
