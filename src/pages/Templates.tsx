import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { designTemplates } from '../config/designTemplates';
import { colorSchemes } from '../config/colorSchemes';
import { sampleCoverSlide } from '../config/sampleSlides';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import type { TemplateCategory } from '../types';
import '../styles/templates.css';

type FilterCategory = 'all' | TemplateCategory;

const categoryLabels: Record<FilterCategory, { ko: string; en: string }> = {
  all: { ko: '전체', en: 'All' },
  business: { ko: '비즈니스', en: 'Business' },
  creative: { ko: '크리에이티브', en: 'Creative' },
  academic: { ko: '학술', en: 'Academic' },
  minimal: { ko: '미니멀', en: 'Minimal' },
};

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [previewColorIds, setPreviewColorIds] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    designTemplates.forEach(dt => { map[dt.id] = 'charcoal-yellow'; });
    return map;
  });

  const filteredTemplates = useMemo(() => {
    if (filter === 'all') return designTemplates;
    return designTemplates.filter(dt => dt.category === filter);
  }, [filter]);

  const handleColorChange = (templateId: string, colorId: string) => {
    setPreviewColorIds(prev => ({ ...prev, [templateId]: colorId }));
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
        {/* Category filter */}
        <div className="template-filter-tabs">
          {(Object.keys(categoryLabels) as FilterCategory[]).map(cat => (
            <button
              key={cat}
              className={`template-filter-tab ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
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

            return (
              <div key={dt.id} className="template-gallery-card">
                {/* Preview area */}
                <div className="template-gallery-preview">
                  <div className="template-gallery-slide-wrapper">
                    <SlideRenderer
                      slide={sampleCoverSlide}
                      colorScheme={cs}
                      width={595}
                      height={842}
                      scale={0.35}
                      designTemplateId={dt.id}
                    />
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
                  onClick={() => navigate(`/generate?template=${dt.id}`)}
                >
                  이 템플릿으로 만들기
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Templates;
