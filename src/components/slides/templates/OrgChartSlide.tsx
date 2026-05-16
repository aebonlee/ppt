import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate, OrgNode } from '../../../types';
import { formatPageNumber } from '../../../utils/templateHelpers';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const OrgChartSlide: React.FC<Props> = ({ slide, colors, width, height, template: t }) => {
  const mx = t.layout.marginX;
  const root = slide.orgChart;
  if (!root) return <div style={{ width, height, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No org chart data</div>;

  const chartTop = 130;
  const chartHeight = height - chartTop - 60;
  const chartWidth = width - mx * 2;

  // Calculate tree depth and breadth for layout
  const getMaxDepth = (node: OrgNode, depth = 0): number => {
    if (!node.children?.length) return depth;
    return Math.max(...node.children.map(c => getMaxDepth(c, depth + 1)));
  };
  const getLeafCount = (node: OrgNode): number => {
    if (!node.children?.length) return 1;
    return node.children.reduce((sum, c) => sum + getLeafCount(c), 0);
  };

  const maxDepth = getMaxDepth(root);
  const leafCount = getLeafCount(root);
  const levelHeight = Math.min(100, chartHeight / (maxDepth + 1));
  const nodeWidth = Math.min(120, chartWidth / Math.max(leafCount, 1));
  const nodeHeight = 48;

  // Render a node and its children recursively
  const renderNode = (node: OrgNode, x: number, y: number, availWidth: number): React.ReactNode => {
    const boxW = Math.min(nodeWidth, availWidth - 8);
    const children = node.children || [];
    const childWidth = children.length > 0 ? availWidth / children.length : 0;

    return (
      <React.Fragment key={`${node.name}-${x}-${y}`}>
        {/* Node box */}
        <div style={{
          position: 'absolute',
          left: x - boxW / 2, top: y,
          width: boxW, height: nodeHeight,
          background: y === chartTop ? colors.primary : '#fff',
          border: `1.5px solid ${colors.primary}`,
          borderRadius: 6, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '4px 6px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: y === chartTop ? '#fff' : colors.primary, textAlign: 'center', lineHeight: 1.2 }}>{node.name}</div>
          {node.title && <div style={{ fontSize: 8, color: y === chartTop ? '#ffffffcc' : '#666', marginTop: 2, textAlign: 'center' }}>{node.title}</div>}
        </div>

        {/* Connector lines to children */}
        {children.length > 0 && (
          <svg style={{ position: 'absolute', left: 0, top: 0, width: chartWidth, height: chartHeight, pointerEvents: 'none' }}>
            {/* Vertical line down from parent */}
            <line x1={x} y1={y + nodeHeight} x2={x} y2={y + nodeHeight + (levelHeight - nodeHeight) / 2} stroke={colors.primary} strokeWidth={1.5} />
            {/* Horizontal connector if multiple children */}
            {children.length > 1 && (() => {
              const firstChildX = x - (availWidth / 2) + childWidth / 2;
              const lastChildX = x + (availWidth / 2) - childWidth / 2;
              const connY = y + nodeHeight + (levelHeight - nodeHeight) / 2;
              return <line x1={firstChildX} y1={connY} x2={lastChildX} y2={connY} stroke={colors.primary} strokeWidth={1.5} />;
            })()}
            {/* Vertical lines up to each child */}
            {children.map((_, ci) => {
              const childX = x - (availWidth / 2) + childWidth * ci + childWidth / 2;
              const connY = y + nodeHeight + (levelHeight - nodeHeight) / 2;
              return <line key={ci} x1={childX} y1={connY} x2={childX} y2={y + levelHeight} stroke={colors.primary} strokeWidth={1.5} />;
            })}
          </svg>
        )}

        {/* Render children */}
        {children.map((child, ci) => {
          const childX = x - (availWidth / 2) + childWidth * ci + childWidth / 2;
          return renderNode(child, childX, y + levelHeight, childWidth);
        })}
      </React.Fragment>
    );
  };

  return (
    <div style={{ position: 'relative', width, height, background: '#fff' }}>
      {/* Header */}
      <div style={{ position: 'absolute', left: mx, top: 30, width: width - mx * 2 }}>
        <div style={{ fontSize: t.typography.labelText.fontSize, letterSpacing: t.typography.labelText.letterSpacing, fontWeight: t.typography.labelText.fontWeight, color: colors.accent2 }}>
          ORGANIZATION
        </div>
        <div style={{ fontSize: t.typography.chapterTitle.fontSize, fontWeight: t.typography.chapterTitle.fontWeight, color: colors.primary, marginTop: 4 }}>
          {slide.title || 'Organization Chart'}
        </div>
      </div>

      {/* Org chart area */}
      <div style={{ position: 'absolute', left: mx, top: chartTop, width: chartWidth, height: chartHeight }}>
        {renderNode(root, chartWidth / 2, 0, chartWidth)}
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
