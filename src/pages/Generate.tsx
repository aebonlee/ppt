import React, { useEffect } from 'react';
import { GenerationProvider, useGeneration } from '../contexts/GenerationContext';
import { colorSchemes } from '../config/colorSchemes';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import { SlideStrip } from '../components/slides/SlideStrip';
import type { SlideOrientation } from '../types';
import '../styles/generate.css';

const GenerateWizard: React.FC = () => {
  const gen = useGeneration();

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">PPT 생성</h1>
          <p className="page-description">AI가 자동으로 전문 프레젠테이션을 만들어 드립니다</p>
        </div>
      </div>
      <div className="container" style={{ padding: '40px' }}>
        {/* Progress Steps */}
        <div className="wizard-steps">
          {['주제 입력', '설정', '생성 중', '결과'].map((label, i) => (
            <div key={i} className={`wizard-step ${gen.step === i ? 'active' : ''} ${gen.step > i ? 'completed' : ''}`}>
              <div className="step-number">{gen.step > i ? '✓' : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Step 0: Topic */}
        {gen.step === 0 && (
          <div className="wizard-panel">
            <h2>프레젠테이션 주제</h2>
            <p className="wizard-desc">어떤 주제로 프레젠테이션을 만들까요?</p>
            <textarea
              className="topic-input"
              placeholder="예: 인공지능의 역사와 미래 발전 방향"
              value={gen.topic}
              onChange={e => gen.setTopic(e.target.value)}
              rows={4}
            />
            <div className="wizard-desc" style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
              구체적으로 작성할수록 더 좋은 결과를 얻을 수 있습니다.
            </div>
            <div className="wizard-actions">
              <button
                className="btn btn-primary"
                disabled={!gen.topic.trim()}
                onClick={() => gen.setStep(1)}
              >
                다음: 설정 →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Config */}
        {gen.step === 1 && (
          <div className="wizard-panel">
            <h2>생성 설정</h2>

            <div className="config-grid">
              {/* Orientation */}
              <div className="config-section">
                <label className="config-label">슬라이드 방향</label>
                <div className="orientation-picker">
                  {(['portrait', 'landscape'] as SlideOrientation[]).map(o => (
                    <button
                      key={o}
                      className={`orientation-btn ${gen.orientation === o ? 'active' : ''}`}
                      onClick={() => gen.setOrientation(o)}
                    >
                      <div className={`orientation-icon ${o}`} />
                      <span>{o === 'portrait' ? '세로 (A4)' : '가로 (와이드)'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide count */}
              <div className="config-section">
                <label className="config-label">슬라이드 수: {gen.slideCount}장</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={gen.slideCount}
                  onChange={e => gen.setSlideCount(Number(e.target.value))}
                  className="slide-count-range"
                />
                <div className="range-labels">
                  <span>5</span><span>15</span><span>30</span><span>50</span>
                </div>
              </div>

              {/* Color scheme */}
              <div className="config-section">
                <label className="config-label">색상 테마</label>
                <div className="color-scheme-grid">
                  {colorSchemes.map(cs => (
                    <button
                      key={cs.id}
                      className={`color-scheme-btn ${gen.colorSchemeId === cs.id ? 'active' : ''}`}
                      onClick={() => gen.setColorSchemeId(cs.id)}
                      title={cs.nameKo}
                    >
                      <div className="color-scheme-preview">
                        <div style={{ flex: 3, background: cs.primary }} />
                        <div style={{ flex: 1, background: cs.accent }} />
                        <div style={{ flex: 1, background: cs.accent2 }} />
                      </div>
                      <span className="color-scheme-name">{cs.nameKo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Engine */}
              <div className="config-section">
                <label className="config-label">AI 엔진</label>
                <div className="engine-picker">
                  <button
                    className={`engine-btn ${gen.aiEngine === 'openai' ? 'active' : ''}`}
                    onClick={() => gen.setAiEngine('openai')}
                  >
                    OpenAI GPT-4o
                  </button>
                  <button
                    className={`engine-btn ${gen.aiEngine === 'claude' ? 'active' : ''}`}
                    onClick={() => gen.setAiEngine('claude')}
                  >
                    Claude Sonnet
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="config-section">
                <label className="config-label">API 키 (선택)</label>
                <input
                  type="password"
                  className="api-key-input"
                  placeholder="직접 입력하거나 비워두면 플랫폼 키 사용"
                  value={gen.apiKey}
                  onChange={e => gen.setApiKey(e.target.value)}
                />
                <div className="config-hint">무료 회원은 직접 API 키를 입력해야 합니다.</div>
              </div>

              {/* Additional instructions */}
              <div className="config-section">
                <label className="config-label">추가 지시사항 (선택)</label>
                <textarea
                  className="additional-input"
                  placeholder="예: 대학생 대상으로 작성해주세요. 각 섹션에 퀴즈를 포함해주세요."
                  value={gen.additionalInstructions}
                  onChange={e => gen.setAdditionalInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="wizard-actions">
              <button className="btn btn-secondary" onClick={() => gen.setStep(0)}>← 이전</button>
              <button className="btn btn-primary" onClick={() => { gen.setStep(2); gen.generate(); }}>
                생성 시작 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generating */}
        {gen.step === 2 && (
          <div className="wizard-panel generation-progress">
            <div className="progress-icon">
              {gen.progress.status === 'error' ? '❌' : '🎨'}
            </div>
            <h2>{gen.progress.status === 'error' ? '오류 발생' : 'AI가 프레젠테이션을 만들고 있습니다'}</h2>
            <p className="progress-message">{gen.progress.message}</p>

            {gen.progress.status !== 'error' && (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${gen.progress.progress}%` }} />
              </div>
            )}

            {gen.progress.status === 'error' && (
              <div className="wizard-actions">
                <button className="btn btn-secondary" onClick={() => gen.setStep(1)}>← 설정으로 돌아가기</button>
                <button className="btn btn-primary" onClick={() => { gen.generate(); }}>다시 시도</button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Result */}
        {gen.step === 3 && gen.presentation && (
          <ResultView />
        )}
      </div>
    </>
  );
};

const ResultView: React.FC = () => {
  const gen = useGeneration();
  const pres = gen.presentation!;
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { width, height } = pres.canvas;

  // Calculate scale to fit in viewport
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40;
        const maxHeight = window.innerHeight - 300;
        const scaleX = containerWidth / width;
        const scaleY = maxHeight / height;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  return (
    <div className="result-view">
      <div className="result-header">
        <h2>{pres.title}</h2>
        <div className="result-info">
          <span>{pres.slides.length}장</span>
          <span>{pres.orientation === 'portrait' ? '세로' : '가로'}</span>
          <span>{pres.colorScheme.nameKo}</span>
        </div>
        <div className="result-actions">
          <button className="btn btn-secondary" onClick={() => gen.save()}>
            {gen.savedId ? '✓ 저장됨' : '저장'}
          </button>
          <button className="btn btn-secondary" onClick={() => window.open(`/preview?data=${encodeURIComponent(JSON.stringify(pres))}`, '_blank')}>
            전체화면
          </button>
          <button className="btn btn-primary" onClick={() => gen.reset()}>
            새로 만들기
          </button>
        </div>
      </div>

      <div ref={containerRef} className="slide-preview-area">
        <div style={{ width: width * scale, height: height * scale, margin: '0 auto' }}>
          <SlideRenderer
            slide={pres.slides[currentSlide]}
            colorScheme={pres.colorScheme}
            width={width}
            height={height}
            scale={scale}
          />
        </div>
        <div className="slide-nav">
          <button disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}>← 이전</button>
          <span>{currentSlide + 1} / {pres.slides.length}</span>
          <button disabled={currentSlide === pres.slides.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}>다음 →</button>
        </div>
      </div>

      <SlideStrip
        slides={pres.slides}
        colorScheme={pres.colorScheme}
        currentIndex={currentSlide}
        onSelectSlide={setCurrentSlide}
        width={width}
        height={height}
      />
    </div>
  );
};

const Generate: React.FC = () => (
  <GenerationProvider>
    <GenerateWizard />
  </GenerationProvider>
);

export default Generate;
