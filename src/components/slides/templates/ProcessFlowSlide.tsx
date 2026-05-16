import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const ProcessFlowSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const steps = slide.processSteps || [];

  const flowTop = 150;
  const flowWidth = width - mx * 2;
  const isVertical = steps.length > 6 || height > width;

  const stepW = isVertical ? flowWidth * 0.7 : Math.min(140, (flowWidth - 30 * (steps.length - 1)) / steps.length);
  const stepH = isVertical ? 50 : 70;
  const gap = isVertical ? 20 : 30;

  const getShapeStyle = (type?: string): React.CSSProperties => {
    switch (type) {
      case 'start':
      case 'end':
        return { borderRadius: stepH / 2, background: type === 'start' ? colors.primary : colors.accent2 };
      case 'decision':
        return { borderRadius: 4, background: colors.accent, transform: 'rotate(0deg)' };
      default:
        return { borderRadius: 6, background: '#fff', border: `2px solid ${colors.primary}` };
    }
  };

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          PROCESS FLOW
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{slide.subtitle}</div>
        )}
      </div>

      {/* Process steps */}
      {isVertical ? (
        <div style={{ position: 'absolute', left: mx + (flowWidth - stepW) / 2, top: flowTop, width: stepW }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                width: stepW, height: stepH,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', padding: '8px 12px',
                ...getShapeStyle(step.type),
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: step.type === 'start' || step.type === 'end' ? '#fff' : colors.primary, textAlign: 'center' }}>{step.label}</div>
                {step.description && <div style={{ fontSize: 9, color: step.type === 'start' || step.type === 'end' ? '#ffffffcc' : '#666', marginTop: 2, textAlign: 'center' }}>{step.description}</div>}
              </div>
              {i < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', height: gap }}>
                  <div style={{ width: 0, height: '100%', borderLeft: `2px solid ${colors.primary}` }} />
                  <div style={{ position: 'absolute', marginTop: gap - 8, color: colors.primary, fontSize: 12 }}>{'\u25BC'}</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{ position: 'absolute', left: mx, top: flowTop + (height - flowTop - 100 - stepH) / 2, width: flowWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{
                width: stepW, height: stepH, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', padding: '8px 10px',
                ...getShapeStyle(step.type),
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: step.type === 'start' || step.type === 'end' ? '#fff' : colors.primary, textAlign: 'center' }}>{step.label}</div>
                {step.description && <div style={{ fontSize: 8, color: step.type === 'start' || step.type === 'end' ? '#ffffffcc' : '#666', marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>{step.description}</div>}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: gap, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.primary, fontSize: 14 }}>
                  {'\u25B6'}
                </div>
              )}
            </React.Fragment>
          ))}
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
