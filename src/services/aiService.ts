import type { GenerateRequest, PresentationData, SlideData, GenerationProgress, PresentationOutline, MultiStepProgress } from '../types';
import { getColorScheme } from '../config/colorSchemes';
import { buildSystemPrompt, buildUserPrompt, buildOutlineBasedPrompt } from './promptBuilder';
import getSupabase from '../utils/supabase';
import { canGenerate, deductTokens } from './subscriptionService';

interface AIResponse {
  title: string;
  description?: string;
  slides: SlideData[];
}

/** Multi-strategy JSON extraction with fallbacks */
function extractJSON(text: string): any {
  // 1. Direct parse
  try { return JSON.parse(text.trim()); } catch { /* continue */ }

  // 2. Extract from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }

  // 3. Find JSON object/array in surrounding text
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try { return JSON.parse(text.slice(jsonStart, jsonEnd + 1)); } catch { /* continue */ }
  }

  throw new Error('AI 응답에서 유효한 JSON을 추출할 수 없습니다. 다시 시도해 주세요.');
}

export async function generatePresentation(
  request: GenerateRequest,
  onProgress?: (progress: GenerationProgress) => void
): Promise<PresentationData> {
  const colorScheme = getColorScheme(request.colorSchemeId);
  const canvas = request.orientation === 'portrait'
    ? { width: 794, height: 1123 }
    : { width: 1123, height: 794 };

  // Pre-validation
  if (!request.topic?.trim()) {
    const err = new Error('프레젠테이션 주제를 입력해 주세요.');
    onProgress?.({ status: 'error', progress: 0, message: err.message });
    throw err;
  }

  if (!request.apiKey) {
    // No API key — check if Supabase edge function is available
    const client = getSupabase();
    if (!client) {
      const err = new Error('API 키가 필요합니다. 설정에서 API 키를 입력하거나 MyPage에서 저장하세요.');
      onProgress?.({ status: 'error', progress: 0, message: err.message });
      throw err;
    }

    // 플랫폼 키 사용 시 토큰 체크
    try {
      const check = await canGenerate(request.aiEngine, request.slideCount);
      if (!check.allowed) {
        const err = new Error(
          `토큰이 부족합니다. 필요: ${check.required.toLocaleString()}토큰, 잔여: ${check.remaining.toLocaleString()}토큰. 요금제를 업그레이드하거나 직접 API 키를 사용하세요.`
        );
        onProgress?.({ status: 'error', progress: 0, message: err.message });
        throw err;
      }
    } catch (tokenErr: any) {
      if (tokenErr.message?.includes('토큰이 부족합니다')) throw tokenErr;
      // 토큰 체크 실패 시 계속 진행 (edge function 폴백)
    }
  }

  // Step 1: Generate
  onProgress?.({
    status: 'generating',
    progress: 10,
    message: 'AI가 프레젠테이션을 생성하고 있습니다...',
    totalSlides: request.slideCount,
  });

  const systemPrompt = buildSystemPrompt(request);
  const userPrompt = buildUserPrompt(request);

  let aiResponse: AIResponse;

  try {
    if (request.apiKey) {
      aiResponse = await callAIDirect(request.aiEngine, request.apiKey, systemPrompt, userPrompt);
    } else {
      aiResponse = await callAIViaEdgeFunction(request.aiEngine, systemPrompt, userPrompt);
    }
  } catch (error: any) {
    const message = friendlyErrorMessage(error);
    onProgress?.({
      status: 'error',
      progress: 0,
      message,
    });
    throw new Error(message);
  }

  // Step 2: Parse
  onProgress?.({
    status: 'parsing',
    progress: 60,
    message: '응답을 분석하고 있습니다...',
    totalSlides: aiResponse.slides.length,
  });

  // Validate slides
  const validatedSlides = validateSlides(aiResponse.slides);

  // Step 3: Complete
  onProgress?.({
    status: 'rendering',
    progress: 80,
    message: '슬라이드를 렌더링하고 있습니다...',
    totalSlides: validatedSlides.length,
  });

  const presentation: PresentationData = {
    title: aiResponse.title || request.topic,
    description: aiResponse.description,
    orientation: request.orientation,
    colorScheme,
    designTemplateId: request.designTemplateId,
    canvas,
    slides: validatedSlides,
    createdAt: new Date().toISOString(),
  };

  // 플랫폼 키 사용 시 토큰 차감
  if (!request.apiKey) {
    try {
      await deductTokens('generate', request.aiEngine, validatedSlides.length);
    } catch {
      // 토큰 차감 실패해도 생성 결과는 반환
    }
  }

  onProgress?.({
    status: 'complete',
    progress: 100,
    message: '프레젠테이션이 생성되었습니다!',
    totalSlides: validatedSlides.length,
  });

  return presentation;
}

export async function callAIDirect(
  engine: 'openai' | 'claude',
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  if (!apiKey?.trim()) {
    throw new Error('API 키가 비어있습니다. MyPage에서 API 키를 입력해 주세요.');
  }

  try {
    if (engine === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 16000,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('OpenAI 응답이 비어있습니다. 다시 시도해 주세요.');
      return extractJSON(content);
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Claude API error: ${res.status}`);
      }
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (!text) throw new Error('Claude 응답이 비어있습니다. 다시 시도해 주세요.');
      return extractJSON(text);
    }
  } catch (err: any) {
    // Re-throw with more context if it's a generic fetch error
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error(`${engine === 'openai' ? 'OpenAI' : 'Claude'} API 서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.`);
    }
    throw err;
  }
}

export async function callAIViaEdgeFunction(
  engine: 'openai' | 'claude',
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다. 환경 변수를 확인해 주세요.');

  try {
    const { data, error } = await client.functions.invoke('ppt-generate', {
      body: { engine, systemPrompt, userPrompt },
    });

    if (error) {
      // Edge Function not found or deployment issue
      const msg = error.message || '';
      if (msg.includes('not found') || msg.includes('404') || msg.includes('Function not found')) {
        throw new Error('서버 AI 기능이 아직 설정되지 않았습니다. MyPage에서 직접 API 키를 입력하고 사용해 주세요.');
      }
      throw new Error(msg || 'Edge Function 호출 실패');
    }

    // Handle error response from the function itself
    if (data?.error) {
      throw new Error(data.error);
    }

    if (!data?.result) throw new Error('AI 응답이 비어있습니다. 다시 시도해 주세요.');

    const raw = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
    return extractJSON(raw);
  } catch (err: any) {
    // Network error or function invocation failure
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error('서버 연결에 실패했습니다. MyPage에서 API 키를 직접 입력하고 사용해 주세요.');
    }
    throw err;
  }
}

/** Convert raw errors to user-friendly messages */
function friendlyErrorMessage(error: any): string {
  const msg = error?.message || '';

  // API key errors
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Invalid API Key') || msg.includes('invalid_api_key')) {
    return 'API 키가 유효하지 않습니다. MyPage에서 올바른 키를 입력해 주세요.';
  }
  if (msg.includes('429') || msg.includes('Rate limit') || msg.includes('rate_limit')) {
    return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (msg.includes('403') || msg.includes('Forbidden')) {
    return 'API 접근이 거부되었습니다. API 키 권한을 확인해 주세요.';
  }
  if (msg.includes('insufficient_quota') || msg.includes('billing')) {
    return 'API 사용량이 초과되었습니다. API 제공자의 결제 설정을 확인해 주세요.';
  }

  // JSON parsing errors
  if (msg.includes('JSON') || msg.includes('SyntaxError') || msg.includes('Unexpected token')) {
    return 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.';
  }

  // Network errors
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
    return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.';
  }

  // Supabase / Edge Function errors
  if (msg.includes('Edge Function') || msg.includes('not found') || msg.includes('Function not found')) {
    return '서버 AI 기능이 설정되지 않았습니다. MyPage에서 직접 API 키를 입력해 주세요.';
  }

  // Pass through our own Korean messages
  if (/[가-힣]/.test(msg)) {
    return msg;
  }

  return `AI 생성 중 오류: ${msg || '알 수 없는 오류가 발생했습니다.'}`;
}

function validateSlides(slides: SlideData[]): SlideData[] {
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('유효한 슬라이드 데이터가 없습니다.');
  }

  return slides.map((slide, i) => ({
    ...slide,
    type: slide.type || 'content',
    pageNumber: slide.pageNumber || i + 1,
  }));
}

// Save presentation to Supabase
export async function savePresentation(presentation: PresentationData): Promise<string> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다. 저장하려면 로그인해 주세요.');

  const { data, error } = await client
    .from('ppt_presentations')
    .insert({
      user_id: user.id,
      title: presentation.title,
      description: presentation.description || '',
      orientation: presentation.orientation,
      color_scheme_id: presentation.colorScheme.id,
      data_json: presentation,
      slide_count: presentation.slides.length,
    })
    .select('id')
    .single();

  if (error) {
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      throw new Error('ppt_presentations 테이블이 없습니다. Supabase에서 마이그레이션 SQL을 실행해 주세요.');
    }
    throw new Error('저장 실패: ' + error.message);
  }
  return data.id;
}

// Load user's presentations
export async function loadPresentations(): Promise<any[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const { data, error } = await client
    .from('ppt_presentations')
    .select('id, title, description, orientation, color_scheme_id, slide_count, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error('로딩 실패: ' + error.message);
  return data || [];
}

// Load single presentation
export async function loadPresentation(id: string): Promise<PresentationData> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data, error } = await client
    .from('ppt_presentations')
    .select('data_json')
    .eq('id', id)
    .single();

  if (error) throw new Error('로딩 실패: ' + error.message);
  return data.data_json as PresentationData;
}

// Delete presentation
export async function deletePresentation(id: string): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { error } = await client
    .from('ppt_presentations')
    .delete()
    .eq('id', id);

  if (error) throw new Error('삭제 실패: ' + error.message);
}

/**
 * Multi-step generation: outline → type matching → content fill
 * Phase 2 고도화 파이프라인
 */
export async function generateFromOutline(
  request: GenerateRequest,
  outline: PresentationOutline,
  onProgress?: (progress: MultiStepProgress) => void
): Promise<PresentationData> {
  const colorScheme = getColorScheme(request.colorSchemeId);
  const canvas = request.orientation === 'portrait'
    ? { width: 794, height: 1123 }
    : { width: 1123, height: 794 };

  // Token check (same as direct generation)
  if (!request.apiKey) {
    const client = getSupabase();
    if (!client) {
      throw new Error('API 키가 필요합니다.');
    }
    try {
      const check = await canGenerate(request.aiEngine, outline.slides.length);
      if (!check.allowed) {
        throw new Error(
          `토큰이 부족합니다. 필요: ${check.required.toLocaleString()}토큰, 잔여: ${check.remaining.toLocaleString()}토큰.`
        );
      }
    } catch (tokenErr: any) {
      if (tokenErr.message?.includes('토큰이 부족합니다')) throw tokenErr;
    }
  }

  // Stage: Content generation from outline
  onProgress?.({
    stage: 'content',
    progress: 40,
    message: '아웃라인을 기반으로 슬라이드 콘텐츠를 생성하고 있습니다...',
    outline,
  });

  const systemPrompt = buildSystemPrompt(request);
  const userPrompt = buildOutlineBasedPrompt(request, outline);

  let aiResponse: { title: string; description?: string; slides: SlideData[] };

  try {
    if (request.apiKey) {
      aiResponse = await callAIDirect(request.aiEngine, request.apiKey, systemPrompt, userPrompt);
    } else {
      aiResponse = await callAIViaEdgeFunction(request.aiEngine, systemPrompt, userPrompt);
    }
  } catch (error: any) {
    onProgress?.({ stage: 'error', progress: 0, message: error.message, outline });
    throw error;
  }

  // Stage: Validate & finalize
  onProgress?.({
    stage: 'refinement',
    progress: 80,
    message: '슬라이드를 최적화하고 있습니다...',
    outline,
  });

  const validatedSlides = validateSlides(aiResponse.slides);

  const presentation: PresentationData = {
    title: aiResponse.title || outline.title,
    description: aiResponse.description,
    orientation: request.orientation,
    colorScheme,
    designTemplateId: request.designTemplateId,
    canvas,
    slides: validatedSlides,
    createdAt: new Date().toISOString(),
  };

  // Token deduction
  if (!request.apiKey) {
    try {
      await deductTokens('generate', request.aiEngine, validatedSlides.length);
    } catch { /* 차감 실패해도 결과 반환 */ }
  }

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: '프레젠테이션이 생성되었습니다!',
    outline,
  });

  return presentation;
}
