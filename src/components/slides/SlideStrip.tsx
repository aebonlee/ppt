import React from 'react';
import type { SlideData, ColorScheme, DesignTemplateId } from '../../types';
import { SlideRenderer } from './SlideRenderer';

interface SlideStripProps {
  slides: SlideData[];
  colorScheme: ColorScheme;
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  width: number;
  height: number;
  designTemplateId?: DesignTemplateId;
}

export const SlideStrip: React.FC<SlideStripProps> = ({
  slides, colorScheme, currentIndex, onSelectSlide, width, height, designTemplateId
}) => {
  const thumbWidth = 120;
  const thumbScale = thumbWidth / width;
  const thumbHeight = height * thumbScale;

  return (
    <div className="slide-strip" style={{
      display: 'flex',
      gap: '8px',
      padding: '12px',
      overflowX: 'auto',
      background: '#f5f5f5',
      borderTop: '1px solid #ddd',
    }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          onClick={() => onSelectSlide(i)}
          style={{
            flexShrink: 0,
            width: `${thumbWidth}px`,
            height: `${thumbHeight}px`,
            border: i === currentIndex ? '2px solid #0046C8' : '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            background: '#fff',
          }}
        >
          <div style={{ transform: `scale(${thumbScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
            <SlideRenderer slide={slide} colorScheme={colorScheme} width={width} height={height} designTemplateId={designTemplateId} />
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: '9px', textAlign: 'center', padding: '2px',
          }}>
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
};
