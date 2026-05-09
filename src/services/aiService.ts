import type { GenerateRequest, PresentationData, SlideData, GenerationProgress } from '../types';
import { getColorScheme } from '../config/colorSchemes';
import { buildSystemPrompt, buildUserPrompt } from './promptBuilder';
import getSupabase from '../utils/supabase';

interface AIResponse {
  title: string;
  description?: string;
  slides: SlideData[];
}

export async function generatePresentation(
  request: GenerateRequest,
  onProgress?: (progress: GenerationProgress) => void
): Promise<PresentationData> {
  const colorScheme = getColorScheme(request.colorSchemeId);
  const canvas = request.orientation === 'portrait'
    ? { width: 794, height: 1123 }
    : { width: 1123, height: 794 };

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
      // User-provided API key - call directly from frontend
      aiResponse = await callAIDirect(request.aiEngine, request.apiKey, systemPrompt, userPrompt);
    } else {
      // Platform key - call via Edge Function
      aiResponse = await callAIViaEdgeFunction(request.aiEngine, systemPrompt, userPrompt);
    }
  } catch (error: any) {
    onProgress?.({
      status: 'error',
      progress: 0,
      message: error.message || 'AI 생성 중 오류가 발생했습니다.',
    });
    throw error;
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
    canvas,
    slides: validatedSlides,
    createdAt: new Date().toISOString(),
  };

  onProgress?.({
    status: 'complete',
    progress: 100,
    message: '프레젠테이션이 생성되었습니다!',
    totalSlides: validatedSlides.length,
  });

  return presentation;
}

async function callAIDirect(
  engine: 'openai' | 'claude',
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
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
    return JSON.parse(data.choices[0].message.content);
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
    const text = data.content[0].text;
    // Extract JSON from potential markdown code fences
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    return JSON.parse(jsonMatch[1].trim());
  }
}

async function callAIViaEdgeFunction(
  engine: 'openai' | 'claude',
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data, error } = await client.functions.invoke('ppt-generate', {
    body: { engine, systemPrompt, userPrompt },
  });

  if (error) throw new Error(error.message || 'Edge Function 호출 실패');
  if (!data?.result) throw new Error('AI 응답이 비어있습니다.');

  return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
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
  if (!user) throw new Error('로그인이 필요합니다.');

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

  if (error) throw new Error('저장 실패: ' + error.message);
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
