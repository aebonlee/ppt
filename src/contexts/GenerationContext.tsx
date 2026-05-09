import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { GenerateRequest, PresentationData, GenerationProgress, SlideOrientation, SlideData } from '../types';
import { generatePresentation, savePresentation } from '../services/aiService';
import { useAuth } from './AuthContext';
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

  // Generation
  progress: GenerationProgress;
  presentation: PresentationData | null;
  generate: () => Promise<void>;
  reset: () => void;
  updateSlides: (slides: SlideData[]) => void;

  // Save
  savedId: string | null;
  save: () => Promise<void>;

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
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(15);
  const [orientation, setOrientation] = useState<SlideOrientation>('portrait');
  const [colorSchemeId, setColorSchemeId] = useState('charcoal-yellow');
  const [aiEngine, setAiEngine] = useState<'openai' | 'claude'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [referenceContent, setReferenceContent] = useState('');
  const [progress, setProgress] = useState<GenerationProgress>(defaultProgress);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(false);

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

  const generate = useCallback(async () => {
    const request: GenerateRequest = {
      topic,
      slideCount,
      orientation,
      colorSchemeId,
      language: 'ko',
      aiEngine,
      apiKey: apiKey || undefined,
      additionalInstructions: additionalInstructions || undefined,
      referenceContent: referenceContent || undefined,
    };

    try {
      const result = await generatePresentation(request, setProgress);
      setPresentation(result);
      setStep(3);
    } catch (err: any) {
      setProgress({
        status: 'error',
        progress: 0,
        message: err.message || '생성 실패',
      });
    }
  }, [topic, slideCount, orientation, colorSchemeId, aiEngine, apiKey, additionalInstructions, referenceContent]);

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
    setAiEngine('openai');
    setApiKey('');
    setAdditionalInstructions('');
    setUploadedFile(null);
    setReferenceContent('');
    setProgress(defaultProgress);
    setPresentation(null);
    setSavedId(null);
    setHasSavedKey(false);
  }, []);

  return (
    <GenerationContext.Provider value={{
      step, setStep, topic, setTopic, slideCount, setSlideCount,
      orientation, setOrientation, colorSchemeId, setColorSchemeId,
      aiEngine, setAiEngine, apiKey, setApiKey,
      additionalInstructions, setAdditionalInstructions,
      uploadedFile, setUploadedFile, referenceContent, setReferenceContent,
      progress, presentation, generate, reset, updateSlides,
      savedId, save, hasSavedKey,
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
