import React, { Suspense, lazy } from 'react';
import type { SlideData, ColorScheme, DesignTemplateId, DesignTemplate } from '../../types';
import { getDesignTemplate } from '../../config/designTemplates';
import { CoverSlide } from './templates/CoverSlide';
import { TOCSlide } from './templates/TOCSlide';
import { SectionCoverSlide } from './templates/SectionCoverSlide';
import { ContentSlide } from './templates/ContentSlide';
import { DiagramSlide } from './templates/DiagramSlide';
import { WorkbookSlide } from './templates/WorkbookSlide';
import { SummarySlide } from './templates/SummarySlide';
import { BackCoverSlide } from './templates/BackCoverSlide';

// Lazy-loaded new slide types
const ChartSlide = lazy(() => import('./templates/ChartSlide').then(m => ({ default: m.ChartSlide })));
const KPIDashboardSlide = lazy(() => import('./templates/KPIDashboardSlide').then(m => ({ default: m.KPIDashboardSlide })));
const ComparisonTableSlide = lazy(() => import('./templates/ComparisonTableSlide').then(m => ({ default: m.ComparisonTableSlide })));
const MatrixSlide = lazy(() => import('./templates/MatrixSlide').then(m => ({ default: m.MatrixSlide })));
const OrgChartSlide = lazy(() => import('./templates/OrgChartSlide').then(m => ({ default: m.OrgChartSlide })));
const TimelineSlide = lazy(() => import('./templates/TimelineSlide').then(m => ({ default: m.TimelineSlide })));
const ProcessFlowSlide = lazy(() => import('./templates/ProcessFlowSlide').then(m => ({ default: m.ProcessFlowSlide })));
const StatCardSlide = lazy(() => import('./templates/StatCardSlide').then(m => ({ default: m.StatCardSlide })));
const QuoteSlide = lazy(() => import('./templates/QuoteSlide').then(m => ({ default: m.QuoteSlide })));
const MultiColumnSlide = lazy(() => import('./templates/MultiColumnSlide').then(m => ({ default: m.MultiColumnSlide })));
// ImageFocusSlide reserved for future 'image-focus' type
// const ImageFocusSlide = lazy(() => import('./templates/ImageFocusSlide').then(m => ({ default: m.ImageFocusSlide })));

interface SlideRendererProps {
  slide: SlideData;
  colorScheme: ColorScheme;
  width: number;
  height: number;
  scale?: number;
  className?: string;
  designTemplateId?: DesignTemplateId;
}

const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#999', fontSize: 12 }}>
    Loading...
  </div>
);

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide, colorScheme, width, height, scale = 1, className = '', designTemplateId
}) => {
  const template: DesignTemplate = getDesignTemplate(designTemplateId || 'modern-corporate');

  const renderSlide = () => {
    const props = { slide, colors: colorScheme, width, height, template };
    switch (slide.type) {
      // Basic types (eagerly loaded)
      case 'cover': return <CoverSlide {...props} />;
      case 'toc': return <TOCSlide {...props} />;
      case 'section-cover': return <SectionCoverSlide {...props} />;
      case 'content': return <ContentSlide {...props} />;
      case 'diagram': return <DiagramSlide {...props} />;
      case 'workbook': return <WorkbookSlide {...props} />;
      case 'summary': return <SummarySlide {...props} />;
      case 'back-cover': return <BackCoverSlide {...props} />;

      // Chart types (lazy)
      case 'column-chart':
      case 'line-chart':
      case 'pie-chart':
      case 'bubble-chart':
        return <Suspense fallback={<LoadingFallback />}><ChartSlide {...props} /></Suspense>;
      case 'kpi-dashboard':
        return <Suspense fallback={<LoadingFallback />}><KPIDashboardSlide {...props} /></Suspense>;

      // Matrix types (lazy)
      case 'comparison-table':
      case 'assessment-table':
        return <Suspense fallback={<LoadingFallback />}><ComparisonTableSlide {...props} /></Suspense>;
      case 'bcg-matrix':
      case 'priority-matrix':
        return <Suspense fallback={<LoadingFallback />}><MatrixSlide {...props} /></Suspense>;

      // Structure types (lazy)
      case 'org-chart':
        return <Suspense fallback={<LoadingFallback />}><OrgChartSlide {...props} /></Suspense>;
      case 'timeline':
      case 'roadmap':
        return <Suspense fallback={<LoadingFallback />}><TimelineSlide {...props} /></Suspense>;
      case 'process-flow':
        return <Suspense fallback={<LoadingFallback />}><ProcessFlowSlide {...props} /></Suspense>;

      // Special types (lazy)
      case 'quote':
        return <Suspense fallback={<LoadingFallback />}><QuoteSlide {...props} /></Suspense>;
      case 'two-column':
      case 'three-column':
        return <Suspense fallback={<LoadingFallback />}><MultiColumnSlide {...props} /></Suspense>;
      case 'stat-card':
        return <Suspense fallback={<LoadingFallback />}><StatCardSlide {...props} /></Suspense>;

      default:
        return <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',color:'#666'}}>Unknown slide type: {slide.type}</div>;
    }
  };

  return (
    <div className={`slide-container ${className}`} style={{
      position: 'relative',
      width: `${width}px`,
      height: `${height}px`,
      overflow: 'hidden',
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top left',
      fontFamily: template.typography.fontFamily,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {renderSlide()}
    </div>
  );
};
