import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const MatrixSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const matrix = slide.matrixConfig;
  if (!matrix) return <div style={{ width, height, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No matrix data</div>;

  const matrixSize = Math.min(width - mx * 2 - 80, height - 240);
  const matrixX = (width - matrixSize) / 2;
  const matrixY = 140;

  const defaultQuadrants = matrix.type === 'bcg'
    ? [{ label: 'Stars' }, { label: 'Question Marks' }, { label: 'Cash Cows' }, { label: 'Dogs' }]
    : [{ label: 'Quick Wins' }, { label: 'Major Projects' }, { label: 'Fill-ins' }, { label: 'Thankless Tasks' }];
  const quadrants = matrix.quadrants || defaultQuadrants;

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          {matrix.type === 'bcg' ? 'BCG MATRIX' : 'PRIORITY MATRIX'}
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || ''}
        </div>
      </div>

      {/* Matrix grid */}
      <svg style={{ position: 'absolute', left: matrixX, top: matrixY }} width={matrixSize} height={matrixSize}>
        {/* Quadrant backgrounds */}
        <rect x={0} y={0} width={matrixSize / 2} height={matrixSize / 2} fill={`${colors.primary}15`} />
        <rect x={matrixSize / 2} y={0} width={matrixSize / 2} height={matrixSize / 2} fill={`${colors.accent}15`} />
        <rect x={0} y={matrixSize / 2} width={matrixSize / 2} height={matrixSize / 2} fill={`${colors.accent2}10`} />
        <rect x={matrixSize / 2} y={matrixSize / 2} width={matrixSize / 2} height={matrixSize / 2} fill={`${colors.mute}20`} />
        {/* Grid lines */}
        <line x1={matrixSize / 2} y1={0} x2={matrixSize / 2} y2={matrixSize} stroke={colors.primary} strokeWidth={1.5} />
        <line x1={0} y1={matrixSize / 2} x2={matrixSize} y2={matrixSize / 2} stroke={colors.primary} strokeWidth={1.5} />
        {/* Border */}
        <rect x={0} y={0} width={matrixSize} height={matrixSize} fill="none" stroke="#ddd" strokeWidth={1} />
        {/* Quadrant labels */}
        {quadrants[0] && <text x={matrixSize * 0.25} y={30} textAnchor="middle" fontSize={10} fontWeight={600} fill={colors.primary}>{quadrants[0].label}</text>}
        {quadrants[1] && <text x={matrixSize * 0.75} y={30} textAnchor="middle" fontSize={10} fontWeight={600} fill={colors.accent}>{quadrants[1].label}</text>}
        {quadrants[2] && <text x={matrixSize * 0.25} y={matrixSize / 2 + 30} textAnchor="middle" fontSize={10} fontWeight={600} fill={colors.accent2}>{quadrants[2].label}</text>}
        {quadrants[3] && <text x={matrixSize * 0.75} y={matrixSize / 2 + 30} textAnchor="middle" fontSize={10} fontWeight={600} fill={colors.mute}>{quadrants[3].label}</text>}
        {/* Items as dots */}
        {matrix.items.map((item, i) => {
          const cx = (item.x / 100) * matrixSize;
          const cy = matrixSize - (item.y / 100) * matrixSize;
          const r = item.size || 12;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill={colors.accent} opacity={0.8} />
              <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize={9} fill="#333">{item.label}</text>
            </g>
          );
        })}
      </svg>

      {/* Axis labels */}
      {matrix.xAxisLabel && (
        <div style={{ position: 'absolute', left: matrixX + matrixSize / 2, top: matrixY + matrixSize + 20, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: '#666' }}>
          {matrix.xAxisLabel} \u2192
        </div>
      )}
      {matrix.yAxisLabel && (
        <div style={{ position: 'absolute', left: matrixX - 30, top: matrixY + matrixSize / 2, transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: 'left center', fontSize: 10, fontWeight: 600, color: '#666' }}>
          {matrix.yAxisLabel} \u2192
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
