import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import type { PresentationData } from '../types';

const Preview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        setPresentation(JSON.parse(decodeURIComponent(dataParam)));
      } catch (e) {
        console.error('Failed to parse presentation data');
      }
    }
  }, [searchParams]);

  const updateScale = useCallback(() => {
    if (!presentation) return;
    const { width, height } = presentation.canvas;
    const scaleX = window.innerWidth / width;
    const scaleY = window.innerHeight / height;
    setScale(Math.min(scaleX, scaleY));
  }, [presentation]);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  useEffect(() => {
    if (!presentation) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, presentation.slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        setCurrentSlide(presentation.slides.length - 1);
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [presentation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!presentation) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000', color: '#fff' }}>
        <p>프레젠테이션 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { width, height } = presentation.canvas;

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a1a', cursor: 'pointer', overflow: 'hidden' }}
      onClick={(e) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width / 2) {
          setCurrentSlide(prev => Math.min(prev + 1, presentation.slides.length - 1));
        } else {
          setCurrentSlide(prev => Math.max(prev - 1, 0));
        }
      }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <SlideRenderer
          slide={presentation.slides[currentSlide]}
          colorScheme={presentation.colorScheme}
          width={width}
          height={height}
        />
      </div>

      {/* Controls overlay */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, alignItems: 'center',
        background: 'rgba(0,0,0,0.7)', padding: '8px 20px', borderRadius: 30,
        color: '#fff', fontSize: 14, zIndex: 100,
        opacity: 0.7, transition: 'opacity 0.3s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
      >
        <span>{currentSlide + 1} / {presentation.slides.length}</span>
        <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>
          {isFullscreen ? '축소' : '전체화면'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); window.close(); }}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default Preview;
