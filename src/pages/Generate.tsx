import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GenerationProvider, useGeneration } from '../contexts/GenerationContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { colorSchemes, getColorScheme } from '../config/colorSchemes';
import { designTemplates } from '../config/designTemplates';
import { sampleCoverSlide } from '../config/sampleSlides';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import { SlideStrip } from '../components/slides/SlideStrip';
import { extractTextFromFile, isSupported, getFileExtension } from '../services/fileParserService';
import { exportAsHtmlZip, exportAsPdf, exportAsPptx } from '../services/exportService';
import { processEditRequest, type ChatMessage } from '../services/chatEditService';
import { estimateTokenCost } from '../services/subscriptionService';
import ChatPanel from '../components/ChatPanel';
import type { SlideOrientation, DesignTemplateId } from '../types';
import { TOKEN_COST } from '../types';
import '../styles/generate.css';

const GenerateWizard: React.FC = () => {
  const gen = useGeneration();
  const location = window.location;

  // Handle ?template=xxx query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const templateParam = params.get('template') as DesignTemplateId | null;
    if (templateParam && designTemplates.some(t => t.id === templateParam)) {
      gen.setDesignTemplateId(templateParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamic step labels based on mode
  const getStepLabels = () => {
    if (gen.generationMode === 'outline') {
      return ['주제 입력', '설정', '생성 중', '결과'];
    }
    return ['주제 입력', '설정', '생성 중', '결과'];
  };

  const stepLabels = getStepLabels();

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
          {stepLabels.map((label, i) => (
            <div key={i} className={`wizard-step ${gen.step === i || (gen.step >= 4 && i === 2) ? 'active' : ''} ${gen.step > i && gen.step < 4 ? 'completed' : ''} ${gen.step === 3 && i < 3 ? 'completed' : ''}`}>
              <div className="step-number">{(gen.step > i && gen.step < 4) || (gen.step === 3 && i < 3) ? '✓' : i + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Step 0: Topic */}
        {gen.step === 0 && <TopicStep />}

        {/* Step 1: Config */}
        {gen.step === 1 && <ConfigStep />}

        {/* Step 2: Generating (both direct and outline) */}
        {gen.step === 2 && <GeneratingStep />}

        {/* Step 3: Result */}
        {gen.step === 3 && gen.presentation && <ResultView />}

        {/* Step 4: Outline Q&A (Phase 2) */}
        {gen.step === 4 && <OutlineQAStep />}

        {/* Step 5: Outline Review (Phase 2) */}
        {gen.step === 5 && <OutlineReviewStep />}
      </div>
    </>
  );
};

const TopicStep: React.FC = () => {
  const gen = useGeneration();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!isSupported(file)) {
      alert('지원하지 않는 파일 형식입니다. (.pptx, .pdf, .txt, .md, .docx)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기가 50MB를 초과합니다.');
      return;
    }
    setParsing(true);
    try {
      const text = await extractTextFromFile(file);
      gen.setUploadedFile(file);
      gen.setReferenceContent(text);
    } catch (err: any) {
      alert('파일 파싱 실패: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setParsing(false);
    }
  }, [gen]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeFile = () => {
    gen.setUploadedFile(null);
    gen.setReferenceContent('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.pdf,.txt,.md,.docx"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {/* File Upload Zone */}
      <div
        className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="file-upload-icon">{parsing ? '⏳' : '📎'}</div>
        <div className="file-upload-text">
          {parsing ? '파일을 분석하고 있습니다...' : '참고 자료를 업���드하세요 (선택)'}
        </div>
        <div className="file-upload-hint">
          .pptx, .pdf, .txt, .md, .docx — 최대 50MB
        </div>
      </div>

      {gen.uploadedFile && (
        <div className="file-upload-selected">
          <span>📄 {gen.uploadedFile.name} ({getFileExtension(gen.uploadedFile).toUpperCase()}, {Math.round(gen.referenceContent.length / 1000)}K자)</span>
          <button onClick={(e) => { e.stopPropagation(); removeFile(); }}>✕</button>
        </div>
      )}

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
  );
};

const ConfigStep: React.FC = () => {
  const gen = useGeneration();
  const { subscription, maxSlides, tokensRemaining, plan, canUsePlatformKey } = useSubscription();

  const estimatedCost = estimateTokenCost(gen.aiEngine, gen.slideCount);
  const isUsingOwnKey = !!gen.apiKey;
  const hasSub = !!subscription && plan !== 'free';
  const tokenInsufficient = hasSub && !isUsingOwnKey && tokensRemaining < estimatedCost;

  return (
    <div className="wizard-panel">
      <h2>생성 설정</h2>

      {/* Token Balance (구독자 전용) */}
      {hasSub && !isUsingOwnKey && (
        <div style={{
          background: tokenInsufficient ? '#FEF2F2' : '#F0F9FF',
          border: `1px solid ${tokenInsufficient ? '#FECACA' : '#BAE6FD'}`,
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokenInsufficient ? '#DC2626' : '#0369A1' }}>
              토큰 잔액
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {tokensRemaining.toLocaleString()} / {subscription!.tokenLimit.toLocaleString()}
            </span>
          </div>
          <div style={{
            height: 6,
            background: '#E5E7EB',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min((tokensRemaining / subscription!.tokenLimit) * 100, 100)}%`,
              background: tokenInsufficient ? '#EF4444' : '#0284C7',
              borderRadius: 3,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            예상 사용: <strong>{estimatedCost.toLocaleString()}</strong> 토큰
            ({gen.slideCount}장 x {TOKEN_COST[gen.aiEngine].perSlide.toLocaleString()}토큰)
          </div>
          {tokenInsufficient && (
            <div style={{ fontSize: 12, color: '#DC2626', marginTop: 6, fontWeight: 600 }}>
              토큰이 부족합니다. 슬라이드 수를 줄이거나 <Link to="/pricing" style={{ color: '#DC2626', textDecoration: 'underline' }}>플랜을 업그레이드</Link>하세요.
            </div>
          )}
        </div>
      )}

      <div className="config-grid">
        {/* Generation Mode (Phase 2) */}
        <div className="config-section">
          <label className="config-label">생성 방식</label>
          <div className="engine-picker">
            <button
              className={`engine-btn ${gen.generationMode === 'direct' ? 'active' : ''}`}
              onClick={() => gen.setGenerationMode('direct')}
            >
              빠른 생성
            </button>
            <button
              className={`engine-btn ${gen.generationMode === 'outline' ? 'active' : ''}`}
              onClick={() => gen.setGenerationMode('outline')}
            >
              아웃라인 모드
            </button>
          </div>
          <div className="config-hint">
            {gen.generationMode === 'direct'
              ? '주제만으로 바로 생성합니다.'
              : 'AI 질문 → 아웃라인 확인 → 최적화된 결과를 얻습니다.'}
          </div>
        </div>

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
                <span>{o === 'portrait' ? '���로 (A4)' : '가로 (와이드)'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slide count */}
        <div className="config-section">
          <label className="config-label">슬라이드 수: {gen.slideCount}장 <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>(최대 {maxSlides}장)</span></label>
          <input
            type="range"
            min={5}
            max={maxSlides}
            value={gen.slideCount}
            onChange={e => gen.setSlideCount(Number(e.target.value))}
            className="slide-count-range"
          />
          <div className="range-labels">
            <span>5</span>
            {maxSlides >= 15 && <span>15</span>}
            {maxSlides >= 30 && <span>30</span>}
            <span>{maxSlides}</span>
          </div>
        </div>

        {/* Design template */}
        <div className="config-section">
          <label className="config-label">디자인 템플릿</label>
          <div className="template-picker-grid">
            {designTemplates.map(dt => {
              const previewColors = getColorScheme(gen.colorSchemeId);
              return (
                <button
                  key={dt.id}
                  className={`template-picker-btn ${gen.designTemplateId === dt.id ? 'active' : ''}`}
                  onClick={() => gen.setDesignTemplateId(dt.id)}
                  title={dt.descriptionKo}
                >
                  <div className="template-picker-preview">
                    <SlideRenderer
                      slide={sampleCoverSlide}
                      colorScheme={previewColors}
                      width={595}
                      height={842}
                      scale={0.13}
                      designTemplateId={dt.id}
                    />
                  </div>
                  <span className="template-picker-name">{dt.nameKo}</span>
                </button>
              );
            })}
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
          <label className="config-label">API 키</label>
          {canUsePlatformKey && hasSub ? (
            <div className="saved-key-indicator" style={{ background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:600, marginBottom:8 }}>
              &#10003; {plan.charAt(0).toUpperCase() + plan.slice(1)} 구독 — 플랫폼 API 키 사용 중 (토큰 차감)
            </div>
          ) : gen.hasSavedKey ? (
            <div className="saved-key-indicator" style={{ background:'#ECFDF5', color:'#059669', border:'1px solid #A7F3D0', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:600, marginBottom:8 }}>
              &#10003; 저장된 {gen.aiEngine === 'openai' ? 'OpenAI' : 'Claude'} API 키 사용 중
            </div>
          ) : (
            <div className="saved-key-indicator" style={{ background:'#FFFBEB', color:'#B45309', border:'1px solid #FDE68A', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:600, marginBottom:8 }}>
              API 키가 필요합니다 &mdash; <Link to="/pricing" style={{ color:'#B45309', textDecoration:'underline' }}>구독하기</Link> 또는 <Link to="/mypage" style={{ color:'#B45309', textDecoration:'underline' }}>MyPage에서 키 저장</Link>
            </div>
          )}
          <input
            type="password"
            className="api-key-input"
            placeholder={gen.hasSavedKey || (canUsePlatformKey && hasSub) ? '직접 입력 시 자체 키 사용 (토큰 차감 없음)' : 'API 키를 입력하세요'}
            value={gen.apiKey}
            onChange={e => gen.setApiKey(e.target.value)}
          />
          <div className="config-hint">
            직접 API 키를 입력하면 토큰이 차감되지 않습니다. <Link to="/mypage" className="saved-key-link">MyPage</Link>에서 키를 저장할 수 있습니다.
          </div>
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
        <button className="btn btn-secondary" onClick={() => gen.setStep(0)}>&#8592; 이전</button>
        {gen.generationMode === 'direct' ? (
          <button
            className="btn btn-primary"
            onClick={() => { gen.setStep(2); gen.generate(); }}
            disabled={tokenInsufficient}
          >
            생성 시작 &#8594;
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => gen.startOutlineMode()}
            disabled={tokenInsufficient}
          >
            아웃라인 생성 &#8594;
          </button>
        )}
      </div>
    </div>
  );
};

/** Step 2: Generation progress (shared for both direct and outline modes) */
const GeneratingStep: React.FC = () => {
  const gen = useGeneration();
  const msProgress = gen.multiStepProgress;
  const isError = gen.progress.status === 'error' || msProgress?.stage === 'error';
  const message = msProgress?.message || gen.progress.message;
  const progressPct = msProgress?.progress || gen.progress.progress;

  return (
    <div className="wizard-panel generation-progress">
      <div className="progress-icon">
        {isError ? '❌' : '🎨'}
      </div>
      <h2>{isError ? '오류 발생' : 'AI가 프레젠테이션을 만들고 있습니다'}</h2>

      {msProgress && !isError && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
          {msProgress.stage === 'questions' && '1/4 질문 생성'}
          {msProgress.stage === 'outline' && '2/4 아웃라인 생성'}
          {msProgress.stage === 'type-matching' && '3/4 유형 매칭'}
          {msProgress.stage === 'content' && '3/4 콘텐츠 생성'}
          {msProgress.stage === 'refinement' && '4/4 최적화'}
        </div>
      )}

      <p className="progress-message">{message}</p>

      {!isError && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {isError && (
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={() => gen.setStep(1)}>← 설정으로 돌아가기</button>
          <button className="btn btn-primary" onClick={() => {
            if (gen.generationMode === 'direct') {
              gen.generate();
            } else {
              gen.startOutlineMode();
            }
          }}>다시 시도</button>
        </div>
      )}
    </div>
  );
};

/** Step 4: Outline Q&A (Phase 2) */
const OutlineQAStep: React.FC = () => {
  const gen = useGeneration();
  const allAnswered = gen.outlineQuestions.every(q => gen.outlineAnswers[q.id]?.trim());

  return (
    <div className="wizard-panel">
      <h2>프레젠테이션 기획</h2>
      <p className="wizard-desc">
        아래 질문에 답변하면 최적의 슬라이드 구성을 만들어 드립니다.
      </p>

      <div className="outline-questions">
        {gen.outlineQuestions.map((q, idx) => (
          <div key={q.id} className="outline-question-item" style={{
            background: 'var(--card-bg, #F9FAFB)',
            border: '1px solid var(--border-color, #E5E7EB)',
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
              {idx + 1}. {q.question}
            </div>
            {q.hint && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                💡 {q.hint}
              </div>
            )}

            {/* Quick select options */}
            {q.options && q.options.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => gen.setOutlineAnswer(q.id, opt)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      borderRadius: 16,
                      border: gen.outlineAnswers[q.id] === opt ? '2px solid var(--primary-color, #0046C8)' : '1px solid #D1D5DB',
                      background: gen.outlineAnswers[q.id] === opt ? 'var(--primary-color, #0046C8)' : 'white',
                      color: gen.outlineAnswers[q.id] === opt ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Text input for custom answer */}
            <input
              type="text"
              value={gen.outlineAnswers[q.id] || ''}
              onChange={e => gen.setOutlineAnswer(q.id, e.target.value)}
              placeholder="직접 입력..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>
        ))}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={() => gen.setStep(1)}>← 설정으로</button>
        <button
          className="btn btn-primary"
          disabled={!allAnswered}
          onClick={() => gen.submitOutlineAnswers()}
        >
          아웃라인 생성 &#8594;
        </button>
      </div>
    </div>
  );
};

/** Step 5: Outline Review (Phase 2) */
const OutlineReviewStep: React.FC = () => {
  const gen = useGeneration();
  const outline = gen.outline;

  if (!outline) return null;

  const typeColors: Record<string, string> = {
    'cover': '#6366F1', 'toc': '#8B5CF6', 'section-cover': '#A855F7', 'content': '#6B7280',
    'diagram': '#14B8A6', 'workbook': '#F59E0B', 'summary': '#10B981', 'back-cover': '#6366F1',
    'column-chart': '#3B82F6', 'line-chart': '#3B82F6', 'pie-chart': '#3B82F6', 'bubble-chart': '#3B82F6',
    'kpi-dashboard': '#EF4444', 'comparison-table': '#F97316', 'bcg-matrix': '#EC4899',
    'priority-matrix': '#EC4899', 'assessment-table': '#F97316', 'org-chart': '#8B5CF6',
    'timeline': '#06B6D4', 'roadmap': '#06B6D4', 'process-flow': '#14B8A6',
    'quote': '#A855F7', 'two-column': '#6B7280', 'three-column': '#6B7280', 'stat-card': '#EF4444',
  };

  return (
    <div className="wizard-panel">
      <h2>아웃라인 검토</h2>
      <p className="wizard-desc">
        아래 구성으로 프레젠테이션을 생성합니다. 확인 후 진행해주세요.
      </p>

      <div style={{
        background: 'var(--card-bg, #F9FAFB)',
        border: '1px solid var(--border-color, #E5E7EB)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{outline.title}</div>
        {outline.subtitle && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{outline.subtitle}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          {outline.targetAudience && <span>👥 {outline.targetAudience}</span>}
          {outline.tone && <span>🎨 {outline.tone}</span>}
          <span>📄 {outline.slides.length}장</span>
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
        {outline.slides.map((slide, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 0',
            borderBottom: idx < outline.slides.length - 1 ? '1px solid var(--border-color, #E5E7EB)' : 'none',
          }}>
            <div style={{
              minWidth: 28, height: 28, borderRadius: '50%',
              background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#6B7280',
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{slide.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{slide.description}</div>
              {slide.keyPoints && slide.keyPoints.length > 0 && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                  {slide.keyPoints.map((p, pi) => <span key={pi} style={{ marginRight: 8 }}>• {p}</span>)}
                </div>
              )}
            </div>
            <div style={{
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 10,
              fontWeight: 600,
              color: 'white',
              background: typeColors[slide.suggestedType] || '#6B7280',
              whiteSpace: 'nowrap',
            }}>
              {slide.suggestedType}
            </div>
          </div>
        ))}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={() => gen.setStep(4)}>← 질문으로</button>
        <button className="btn btn-primary" onClick={() => gen.confirmOutline()}>
          이 아웃라인으로 생성 &#8594;
        </button>
      </div>
    </div>
  );
};

const ExportDropdown: React.FC<{ presentation: any }> = ({ presentation }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="export-dropdown-wrapper" ref={ref}>
      <button className="btn btn-secondary" onClick={() => setOpen(!open)}>
        내보내기 ▾
      </button>
      {open && (
        <div className="export-dropdown">
          <button className="export-option" onClick={() => { exportAsHtmlZip(presentation); setOpen(false); }}>
            📦 HTML (ZIP) <span style={{ fontSize: 11, color: '#999' }}>무료</span>
          </button>
          <button className="export-option" onClick={() => { exportAsPdf(presentation); setOpen(false); }}>
            📄 PDF <span style={{ fontSize: 11, color: '#999' }}>무료</span>
          </button>
          <button className="export-option" onClick={() => { exportAsPptx(presentation); setOpen(false); }}>
            📊 PPTX <span className="pro-tag">Pro</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ResultView: React.FC = () => {
  const gen = useGeneration();
  const pres = gen.presentation!;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatProcessing, setChatProcessing] = useState(false);
  const { width, height } = pres.canvas;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const currentSlideRef = useRef(currentSlide);
  currentSlideRef.current = currentSlide;

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

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatProcessing(true);

    try {
      const currentPres = gen.presentation!;
      const slideIdx = currentSlideRef.current;
      const currentSlideData = currentPres.slides[slideIdx];

      if (!gen.apiKey) {
        throw new Error('채팅 편집에는 API 키가 필요합니다. 설정에서 API 키를 입력하거나 MyPage에서 저장하세요.');
      }

      const result = await processEditRequest(
        message,
        currentSlideData,
        gen.aiEngine,
        gen.apiKey
      );

      const newSlides = [...currentPres.slides];
      newSlides[slideIdx] = result.slide;
      gen.updateSlides(newSlides);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.explanation,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat edit error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `오류: ${err.message || '수정 실패'}`,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatProcessing(false);
    }
  }, [gen]);

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
          <ExportDropdown presentation={pres} />
          <button className="btn btn-secondary" onClick={() => window.open(`/preview?data=${encodeURIComponent(JSON.stringify(pres))}`, '_blank')}>
            전체화면
          </button>
          <button className="btn btn-primary" onClick={() => gen.reset()}>
            새로 만들기
          </button>
        </div>
      </div>

      <div className="result-with-chat">
        <div>
          <div ref={containerRef} className="slide-preview-area">
            <div style={{ width: width * scale, height: height * scale, margin: '0 auto' }}>
              <SlideRenderer
                slide={pres.slides[currentSlide]}
                colorScheme={pres.colorScheme}
                width={width}
                height={height}
                scale={scale}
                designTemplateId={pres.designTemplateId}
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
            designTemplateId={pres.designTemplateId}
          />
        </div>

        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isProcessing={chatProcessing}
        />
      </div>
    </div>
  );
};

const Generate: React.FC = () => (
  <GenerationProvider>
    <GenerateWizard />
  </GenerationProvider>
);

export default Generate;
