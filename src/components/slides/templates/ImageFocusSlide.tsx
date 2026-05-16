import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ImageFocusSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;

  return (
    <div style={{ position: 'relative', width, height, background: '#f8f9fa' }}>
      {/* Placeholder area for image */}
      <div style={{
        position: 'absolute', left: mx, top: 80, width: width - mx * 2, height: height - 180,
        background: `${colors.primary}08`, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${colors.primary}30`,
      }}>
        <div style={{ textAlign: 'center', color: colors.mute }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{'\uD83D\uDDBC'}</div>
          <div style={{ fontSize: 12 }}>Image Placeholder</div>
        </div>
      </div>

      {/* Caption */}
      {slide.title && (
        <div style={{ position: 'absolute', left: mx, bottom: 40, width: width - mx * 2 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{slide.title}</div>
          {slide.subtitle && <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>}
        </div>
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
