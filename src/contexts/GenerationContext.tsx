import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  GenerateRequest, PresentationData, GenerationProgress, SlideOrientation,
  SlideData, DesignTemplateId, GenerationMode, PresentationOutline,
  OutlineQuestion, MultiStepProgress,
} from '../types';
import { generatePresentation, savePresentation, generateFromOutline } from '../services/aiService';
import { generateSocraticQuestions, generateOutline, generateQuickOutline } from '../services/outlineService';
import { matchSlideTypes } from '../services/templateMatchingService';
import { useAuth } from './AuthContext';
import { useSubscription } from './SubscriptionContext';
import { getDecryptedKey } from '../services/settingsService';

interface GenerationState {
  // Wizard step
  step: number;
  setStep: (step: number) => void;

  // Form data
  topic: string;
  setTopic: (topic: string) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  orientation: SlideOrientation;
  setOrientation: (o: SlideOrientation) => void;
  colorSchemeId: string;
  setColorSchemeId: (id: string) => void;
  designTemplateId: DesignTemplateId;
  setDesignTemplateId: (id: DesignTemplateId) => void;
  aiEngine: 'openai' | 'claude';
  setAiEngine: (e: 'openai' | 'claude') => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  additionalInstructions: string;
  setAdditionalInstructions: (instructions: string) => void;

  // File upload
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  referenceContent: string;
  setReferenceContent: (content: string) => void;

  // Generation mode (Phase 2)
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;

  // Outline mode state
  outlineQuestions: OutlineQuestion[];
  outlineAnswers: Record<string, string>;
  setOutlineAnswer: (questionId: string, answer: string) => void;
  outline: PresentationOutline | null;
  setOutline: (outline: PresentationOutline | null) => void;
  multiStepProgress: MultiStepProgress | null;

  // Generation
  progress: GenerationProgress;
  presentation: PresentationData | null;
  generate: () => Promise<void>;
  generateWithOutline: () => Promise<void>;
  startOutlineMode: () => Promise<void>;
  submitOutlineAnswers: () => Promise<void>;
  confirmOutline: () => Promise<void>;
  reset: () => void;
  updateSlides: (slides: SlideData[]) => void;

  // Save
  savedId: string | null;
  save: () => Promise<void>;

  // Template entry
  fromTemplate: boolean;
  setFromTemplate: (v: boolean) => void;

  // Saved API key
  hasSavedKey: boolean;
}

const defaultProgress: GenerationProgress = {
  status: 'idle',
  progress: 0,
  message: '',
};

const GenerationContext = createContext<GenerationState | null>(null);

export const GenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { maxSlides, refreshSubscription } = useSubscription();
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(15);
  const [orientation, setOrientation] = useState<SlideOrientation>('portrait');
  const [colorSchemeId, setColorSchemeId] = useState('charcoal-yellow');
  const [designTemplateId, setDesignTemplateId] = useState<DesignTemplateId>('modern-corporate');
  const [aiEngine, setAiEngine] = useState<'openai' | 'claude'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [referenceContent, setReferenceContent] = useState('');
  const [progress, setProgress] = useState<GenerationProgress>(defaultProgress);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [fromTemplate, setFromTemplate] = useState(false);

  // Phase 2: Outline mode state
  const [generationMode, setGenerationMode] = useState<GenerationMode>('direct');
  const [outlineQuestions, setOutlineQuestions] = useState<OutlineQuestion[]>([]);
  const [outlineAnswers, setOutlineAnswers] = useState<Record<string, string>>({});
  const [outline, setOutline] = useState<PresentationOutline | null>(null);
  const [multiStepProgress, setMultiStepProgress] = useState<MultiStepProgress | null>(null);

  // maxSlides 제한 적용
  const handleSetSlideCount = useCallback((count: number) => {
    setSlideCount(Math.min(count, maxSlides));
  }, [maxSlides]);

  // maxSlides 변경 시 현재 값 클램프
  useEffect(() => {
    if (slideCount > maxSlides) {
      setSlideCount(maxSlides);
    }
  }, [maxSlides, slideCount]);

  // Auto-load saved API key when user or aiEngine changes
  useEffect(() => {
    if (!user) return;
    getDecryptedKey(aiEngine).then(key => {
      if (key) {
        setApiKey(key);
        setHasSavedKey(true);
      } else {
        setHasSavedKey(false);
      }
    }).catch(() => setHasSavedKey(false));
  }, [user, aiEngine]);

  const setOutlineAnswer = useCallback((questionId: string, answer: string) => {
    setOutlineAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // Direct generation (기존 방식)
  const generate = useCallback(async () => {
    if (!topic.trim()) {
      setProgress({ status: 'error', progress: 0, message: '주제를 입력해 주세요.' });
      return;
    }

    const request: GenerateRequest = {
      topic,
      slideCount,
      orientation,
      colorSchemeId,
      designTemplateId,
      language: 'ko',
      aiEngine,
      apiKey: apiKey || undefined,
      additionalInstructions: additionalInstructions || undefined,
      referenceContent: referenceContent || undefined,
    };

    try {
      setProgress({ status: 'generating', progress: 5, message: '준비 중...' });
      const result = await generatePresentation(request, setProgress);
      setPresentation(result);
      setStep(3);
      refreshSubscription().catch(() => {});
      // 템플릿에서 진입한 경우 자동 저장
      if (fromTemplate) {
        savePresentation(result).then(id => setSavedId(id)).catch(() => {});
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setProgress({
        status: 'error',
        progress: 0,
        message: err.message || '프레젠테이션 생성 중 오류가 발생했습니다.',
      });
    }
  }, [topic, slideCount, orientation, colorSchemeId, designTemplateId, aiEngine, apiKey, additionalInstructions, referenceContent, refreshSubscription, fromTemplate]);

  // Phase 2: Start outline mode - generate Socratic questions
  const startOutlineMode = useCallback(async () => {
    if (!topic.trim()) {
      setProgress({ status: 'error', progress: 0, message: '주제를 입력해 주세요.' });
      return;
    }

    setMultiStepProgress({ stage: 'questions', progress: 10, message: 'AI가 기획 질문을 생성하고 있습니다...' });
    setStep(2);

    try {
      const questions = await generateSocraticQuestions(topic, aiEngine, apiKey || undefined);
      setOutlineQuestions(questions);
      setMultiStepProgress({ stage: 'questions', progress: 100, message: '질문이 준비되었습니다.' });
      setStep(4); // Outline Q&A step
    } catch (err: any) {
      console.error('Question generation error:', err);
      setMultiStepProgress({ stage: 'error', progress: 0, message: err.message || '질문 생성 실패' });
      setProgress({ status: 'error', progress: 0, message: err.message || '질문 생성 실패' });
    }
  }, [topic, aiEngine, apiKey]);

  // Phase 2: Submit answers → generate outline
  const submitOutlineAnswers = useCallback(async () => {
    setMultiStepProgress({ stage: 'outline', progress: 30, message: '답변을 바탕으로 아웃라인을 생성하고 있습니다...' });
    setStep(2);

    try {
      // Format answers with question text as keys
      const formattedAnswers: Record<string, string> = {};
      outlineQuestions.forEach(q => {
        if (outlineAnswers[q.id]) {
          formattedAnswers[q.question] = outlineAnswers[q.id];
        }
      });

      const rawOutline = await generateOutline(
        topic, formattedAnswers, slideCount, aiEngine, apiKey || undefined, referenceContent || undefined
      );

      // Type matching
      setMultiStepProgress({ stage: 'type-matching', progress: 60, message: '슬라이드 유형을 최적화하고 있습니다...' });
      const matchedOutline = await matchSlideTypes(rawOutline, aiEngine, apiKey || undefined);

      setOutline(matchedOutline);
      setMultiStepProgress({ stage: 'outline', progress: 100, message: '아웃라인이 준비되었습니다.', outline: matchedOutline });
      setStep(5); // Outline review step
    } catch (err: any) {
      console.error('Outline generation error:', err);
      setMultiStepProgress({ stage: 'error', progress: 0, message: err.message || '아웃라인 생성 실패' });
      setProgress({ status: 'error', progress: 0, message: err.message || '아웃라인 생성 실패' });
    }
  }, [topic, slideCount, aiEngine, apiKey, referenceContent, outlineQuestions, outlineAnswers]);

  // Phase 2: Confirm outline → generate full presentation
  const confirmOutline = useCallback(async () => {
    if (!outline) return;

    const request: GenerateRequest = {
      topic,
      slideCount: outline.slides.length,
      orientation,
      colorSchemeId,
      designTemplateId,
      language: 'ko',
      aiEngine,
      apiKey: apiKey || undefined,
      additionalInstructions: additionalInstructions || undefined,
      referenceContent: referenceContent || undefined,
    };

    setStep(2);
    setMultiStepProgress({ stage: 'content', progress: 40, message: '아웃라인을 기반으로 콘텐츠를 생성하고 있습니다...', outline });

    try {
      const result = await generateFromOutline(request, outline, setMultiStepProgress);
      setPresentation(result);
      setStep(3);
      refreshSubscription().catch(() => {});
      if (fromTemplate) {
        savePresentation(result).then(id => setSavedId(id)).catch(() => {});
      }
    } catch (err: any) {
      console.error('Generation from outline error:', err);
      setMultiStepProgress({ stage: 'error', progress: 0, message: err.message || '생성 실패', outline });
      setProgress({ status: 'error', progress: 0, message: err.message || '생성 실패' });
    }
  }, [outline, topic, orientation, colorSchemeId, designTemplateId, aiEngine, apiKey, additionalInstructions, referenceContent, refreshSubscription, fromTemplate]);

  // Phase 2: Quick outline + generate (no Q&A)
  const generateWithOutline = useCallback(async () => {
    if (!topic.trim()) {
      setProgress({ status: 'error', progress: 0, message: '주제를 입력해 주세요.' });
      return;
    }

    setStep(2);
    setMultiStepProgress({ stage: 'outline', progress: 20, message: '아웃라인을 자동 생성하고 있습니다...' });

    try {
      const rawOutline = await generateQuickOutline(topic, slideCount, aiEngine, apiKey || undefined, referenceContent || undefined);

      setMultiStepProgress({ stage: 'type-matching', progress: 40, message: '슬라이드 유형을 최적화하고 있습니다...' });
      const matchedOutline = await matchSlideTypes(rawOutline, aiEngine, apiKey || undefined);
      setOutline(matchedOutline);

      // Generate content from outline
      const request: GenerateRequest = {
        topic,
        slideCount: matchedOutline.slides.length,
        orientation,
        colorSchemeId,
        designTemplateId,
        language: 'ko',
        aiEngine,
        apiKey: apiKey || undefined,
        additionalInstructions: additionalInstructions || undefined,
        referenceContent: referenceContent || undefined,
      };

      setMultiStepProgress({ stage: 'content', progress: 60, message: '콘텐츠를 생성하고 있습니다...', outline: matchedOutline });
      const result = await generateFromOutline(request, matchedOutline, setMultiStepProgress);
      setPresentation(result);
      setStep(3);
      refreshSubscription().catch(() => {});
    } catch (err: any) {
      console.error('Quick outline generation error:', err);
      setMultiStepProgress({ stage: 'error', progress: 0, message: err.message || '생성 실패' });
      setProgress({ status: 'error', progress: 0, message: err.message || '생성 실패' });
    }
  }, [topic, slideCount, orientation, colorSchemeId, designTemplateId, aiEngine, apiKey, additionalInstructions, referenceContent, refreshSubscription]);

  const save = useCallback(async () => {
    if (!presentation) return;
    try {
      const id = await savePresentation(presentation);
      setSavedId(id);
    } catch (err: any) {
      console.error('Save failed:', err);
    }
  }, [presentation]);

  const updateSlides = useCallback((slides: SlideData[]) => {
    setPresentation(prev => prev ? { ...prev, slides, updatedAt: new Date().toISOString() } : prev);
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setTopic('');
    setSlideCount(15);
    setOrientation('portrait');
    setColorSchemeId('charcoal-yellow');
    setDesignTemplateId('modern-corporate');
    setAiEngine('openai');
    setApiKey('');
    setAdditionalInstructions('');
    setUploadedFile(null);
    setReferenceContent('');
    setProgress(defaultProgress);
    setPresentation(null);
    setSavedId(null);
    setHasSavedKey(false);
    // Phase 2 reset
    setGenerationMode('direct');
    setOutlineQuestions([]);
    setOutlineAnswers({});
    setOutline(null);
    setMultiStepProgress(null);
    setFromTemplate(false);
  }, []);

  return (
    <GenerationContext.Provider value={{
      step, setStep, topic, setTopic, slideCount, setSlideCount: handleSetSlideCount,
      orientation, setOrientation, colorSchemeId, setColorSchemeId,
      designTemplateId, setDesignTemplateId,
      aiEngine, setAiEngine, apiKey, setApiKey,
      additionalInstructions, setAdditionalInstructions,
      uploadedFile, setUploadedFile, referenceContent, setReferenceContent,
      generationMode, setGenerationMode,
      outlineQuestions, outlineAnswers, setOutlineAnswer, outline, setOutline, multiStepProgress,
      progress, presentation, generate, generateWithOutline, startOutlineMode, submitOutlineAnswers, confirmOutline,
      reset, updateSlides,
      savedId, save, fromTemplate, setFromTemplate, hasSavedKey,
    }}>
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const ctx = useContext(GenerationContext);
  if (!ctx) throw new Error('useGeneration must be used within GenerationProvider');
  return ctx;
};
