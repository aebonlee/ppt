import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GenerationProvider, useGeneration } from '../contexts/GenerationContext';
import { colorSchemes, getColorScheme } from '../config/colorSchemes';
import { designTemplates } from '../config/designTemplates';
import { sampleCoverSlide } from '../config/sampleSlides';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import { SlideStrip } from '../components/slides/SlideStrip';
import { extractTextFromFile, isSupported, getFileExtension } from '../services/fileParserService';
import { exportAsHtmlZip, exportAsPdf, exportAsPptx } from '../services/exportService';
import { processEditRequest, type ChatMessage } from '../services/chatEditService';
import ChatPanel from '../components/ChatPanel';
import type { SlideOrientation, DesignTemplateId } from '../types';
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
          <TopicStep />
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
                <label className="config-label">API 키 (선택)</label>
                {gen.hasSavedKey && (
                  <div className="saved-key-indicator">✓ 저장된 API 키 사용 중</div>
                )}
                <input
                  type="password"
                  className="api-key-input"
                  placeholder={gen.hasSavedKey ? '저장된 키를 사용 중입니다 (직접 입력하면 대체)' : '직접 입력하거나 비워두면 플랫폼 키 사용'}
                  value={gen.apiKey}
                  onChange={e => gen.setApiKey(e.target.value)}
                />
                <div className="config-hint">
                  무료 회원은 직접 API 키를 입력해야 합니다.
                  {' '}<Link to="/mypage" className="saved-key-link">MyPage에서 키 관리 →</Link>
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

      {/* Hidden file input - outside click zone to prevent event conflicts */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.pdf,.txt,.md,.docx"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // Reset so same file can be re-selected
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
          {parsing ? '파일을 분석하고 있습니다...' : '참고 자료를 업로드하세요 (선택)'}
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
  // Keep refs for latest values to avoid stale closures in callback
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
      // Use latest presentation and slide index from context/ref
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

      // Update the slide in presentation
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
