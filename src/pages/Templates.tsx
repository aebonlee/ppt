import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { designTemplates } from '../config/designTemplates';
import { colorSchemes } from '../config/colorSchemes';
import {
  sampleCoverSlide,
  sampleCoverSlideLandscape,
  sampleCoverSlideSquare,
  sampleCoverSlideUltraWide,
  sampleCoverSlideCompact,
  sampleCoverSlideInstaFeed,
  sampleCoverSlideInstaStory,
  sampleCoverSlideFacebook,
  sampleCoverSlideYoutube,
} from '../config/sampleSlides';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import type { TemplateCategory, TemplateOrientation, DesignTemplate, SlideData } from '../types';
import '../styles/templates.css';

type FilterCategory = 'all' | TemplateCategory;
type FilterOrientation = 'portrait' | 'landscape' | 'custom';

const orientationLabels: Record<FilterOrientation, { ko: string; en: string }> = {
  portrait:  { ko: '세로형', en: 'Portrait' },
  landscape: { ko: '가로형', en: 'Landscape' },
  custom:    { ko: '커스텀사이즈', en: 'Custom Size' },
};

const categoryLabels: Record<FilterCategory, { ko: string; en: string }> = {
  all: { ko: '전체', en: 'All' },
  business: { ko: '비즈니스', en: 'Business' },
  creative: { ko: '크리에이티브', en: 'Creative' },
  academic: { ko: '학술', en: 'Academic' },
  minimal: { ko: '미니멀', en: 'Minimal' },
};

function getTemplateOrientation(dt: { orientation?: TemplateOrientation }): FilterOrientation {
  return (dt.orientation as FilterOrientation) || 'portrait';
}

function getCanvasSize(dt: { orientation?: TemplateOrientation; canvasSize?: { width: number; height: number } }): { width: number; height: number } {
  if (dt.canvasSize) return dt.canvasSize;
  if (dt.orientation === 'landscape') return { width: 1123, height: 794 };
  return { width: 595, height: 842 };
}

// 프리뷰 영역에 맞게 스케일을 동적 계산
const PREVIEW_MAX_W = 300; // 프리뷰 박스 내 최대 폭
const PREVIEW_MAX_H = 280; // 프리뷰 박스 내 최대 높이

function computePreviewScale(canvasW: number, canvasH: number): number {
  const scaleW = PREVIEW_MAX_W / canvasW;
  const scaleH = PREVIEW_MAX_H / canvasH;
  return Math.min(scaleW, scaleH);
}

// 템플릿 ID에 맞는 샘플 슬라이드 선택
function getSampleSlide(dt: DesignTemplate): SlideData {
  const orient = getTemplateOrientation(dt);
  if (orient === 'portrait') return sampleCoverSlide;
  if (orient === 'landscape') return sampleCoverSlideLandscape;
  // custom — ID별 분기
  switch (dt.id) {
    case 'square-sns':        return sampleCoverSlideSquare;
    case 'ultra-wide':        return sampleCoverSlideUltraWide;
    case 'custom-compact':    return sampleCoverSlideCompact;
    case 'letter-us':         return sampleCoverSlideLandscape;
    case 'card-insta-feed':   return sampleCoverSlideInstaFeed;
    case 'card-insta-story':  return sampleCoverSlideInstaStory;
    case 'card-facebook':     return sampleCoverSlideFacebook;
    case 'card-youtube':      return sampleCoverSlideYoutube;
    default:                  return sampleCoverSlide;
  }
}

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [orientationFilter, setOrientationFilter] = useState<FilterOrientation>('portrait');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [previewColorIds, setPreviewColorIds] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    designTemplates.forEach(dt => { map[dt.id] = 'charcoal-yellow'; });
    return map;
  });

  const orientationCounts = useMemo(() => {
    const counts: Record<FilterOrientation, number> = { portrait: 0, landscape: 0, custom: 0 };
    designTemplates.forEach(dt => { counts[getTemplateOrientation(dt)]++; });
    return counts;
  }, []);

  const filteredTemplates = useMemo(() => {
    return designTemplates.filter(dt => {
      const matchOrientation = getTemplateOrientation(dt) === orientationFilter;
      const matchCategory = categoryFilter === 'all' || dt.category === categoryFilter;
      return matchOrientation && matchCategory;
    });
  }, [orientationFilter, categoryFilter]);

  const handleColorChange = (templateId: string, colorId: string) => {
    setPreviewColorIds(prev => ({ ...prev, [templateId]: colorId }));
  };

  const formatSizeLabel = (dt: { orientation?: TemplateOrientation; canvasSize?: { width: number; height: number } }) => {
    const size = getCanvasSize(dt);
    return `${size.width}\u00D7${size.height}`;
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">디자인 템플릿 갤러리</h1>
          <p className="page-description">프레젠테이션에 맞는 디자인을 선택하세요</p>
        </div>
      </div>
      <div className="container" style={{ padding: '40px' }}>
        {/* Orientation tabs (top tier) */}
        <div className="template-orientation-tabs">
          {(Object.keys(orientationLabels) as FilterOrientation[]).map(o => (
            <button
              key={o}
              className={`template-orientation-tab ${orientationFilter === o ? 'active' : ''}`}
              onClick={() => { setOrientationFilter(o); setCategoryFilter('all'); }}
            >
              {orientationLabels[o].ko} ({orientationCounts[o]})
            </button>
          ))}
        </div>

        {/* Category filter (bottom tier) */}
        <div className="template-filter-tabs">
          {(Object.keys(categoryLabels) as FilterCategory[]).map(cat => (
            <button
              key={cat}
              className={`template-filter-tab ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {categoryLabels[cat].ko}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="template-gallery-grid">
          {filteredTemplates.map(dt => {
            const selectedColorId = previewColorIds[dt.id] || 'charcoal-yellow';
            const cs = colorSchemes.find(c => c.id === selectedColorId) || colorSchemes[0];
            const orient = getTemplateOrientation(dt);
            const size = getCanvasSize(dt);
            const scale = computePreviewScale(size.width, size.height);
            const previewSlide = getSampleSlide(dt);
            const renderedW = Math.round(size.width * scale);
            const renderedH = Math.round(size.height * scale);
            const isWide = size.width >= size.height;

            return (
              <div key={dt.id} className={`template-gallery-card ${isWide ? 'landscape' : ''}`}>
                {/* Preview area */}
                <div className={`template-gallery-preview ${isWide ? 'preview-landscape' : 'preview-portrait'}`}>
                  <div
                    className="template-gallery-slide-wrapper"
                    style={{
                      width: `${renderedW}px`,
                      height: `${renderedH}px`,
                    }}
                  >
                    <SlideRenderer
                      slide={previewSlide}
                      colorScheme={cs}
                      width={size.width}
                      height={size.height}
                      scale={scale}
                      designTemplateId={dt.id}
                    />
                  </div>
                  {/* Badges */}
                  <div className="template-badges">
                    <span className={`template-badge badge-${orient}`}>
                      {orient === 'portrait' ? '세로' : orient === 'landscape' ? '가로' : '커스텀'}
                    </span>
                    <span className="template-badge badge-size">{formatSizeLabel(dt)}</span>
                  </div>
                </div>

                {/* Color dots */}
                <div className="template-color-dots">
                  {colorSchemes.map(c => (
                    <button
                      key={c.id}
                      className={`template-color-dot ${selectedColorId === c.id ? 'active' : ''}`}
                      style={{ background: c.primary }}
                      onClick={() => handleColorChange(dt.id, c.id)}
                      title={c.nameKo}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="template-gallery-info">
                  <h3 className="template-gallery-name">{dt.nameKo}</h3>
                  <span className="template-gallery-category">{categoryLabels[dt.category]?.ko}</span>
                  <p className="template-gallery-desc">{dt.descriptionKo}</p>
                </div>

                {/* CTA */}
                <button
                  className="btn btn-primary template-gallery-cta"
                  onClick={() => navigate(`/generate?template=${dt.id}&orientation=${orient}`)}
                >
                  이 템플릿으로 만들기
                </button>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            해당 조건에 맞는 템플릿이 없습니다.
          </div>
        )}
      </div>
    </>
  );
};

export default Templates;
