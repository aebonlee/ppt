import React from 'react';
import type { SlideData, ColorScheme } from '../../types';
import { CoverSlide } from './templates/CoverSlide';
import { TOCSlide } from './templates/TOCSlide';
import { SectionCoverSlide } from './templates/SectionCoverSlide';
import { ContentSlide } from './templates/ContentSlide';
import { DiagramSlide } from './templates/DiagramSlide';
import { WorkbookSlide } from './templates/WorkbookSlide';
import { SummarySlide } from './templates/SummarySlide';
import { BackCoverSlide } from './templates/BackCoverSlide';

interface SlideRendererProps {
  slide: SlideData;
  colorScheme: ColorScheme;
  width: number;
  height: number;
  scale?: number;
  className?: string;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide, colorScheme, width, height, scale = 1, className = ''
}) => {
  const renderSlide = () => {
    const props = { slide, colors: colorScheme, width, height };
    switch (slide.type) {
      case 'cover': return <CoverSlide {...props} />;
      case 'toc': return <TOCSlide {...props} />;
      case 'section-cover': return <SectionCoverSlide {...props} />;
      case 'content': return <ContentSlide {...props} />;
      case 'diagram': return <DiagramSlide {...props} />;
      case 'workbook': return <WorkbookSlide {...props} />;
      case 'summary': return <SummarySlide {...props} />;
      case 'back-cover': return <BackCoverSlide {...props} />;
      default: return <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',color:'#666'}}>Unknown slide type: {slide.type}</div>;
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
      fontFamily: "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      {renderSlide()}
    </div>
  );
};
