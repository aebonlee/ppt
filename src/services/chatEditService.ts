/**
 * Chat Edit Service
 * Handles AI-based slide editing via chat messages
 * Uses dedicated API calls (not shared with generation flow)
 */
import type { SlideData } from '../types';
import getSupabase from '../utils/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface EditResponse {
  slide: SlideData;
  explanation: string;
}

const EDIT_SYSTEM_PROMPT = `You are a presentation slide editor. You receive the current slide data as JSON and a user's edit instruction.

RULES:
1. Return ONLY valid JSON matching this format: { "slide": { ...modified slide data... }, "explanation": "what was changed (in Korean)" }
2. Keep the same slide "type" unless the user explicitly asks to change it.
3. Preserve ALL existing fields that the user did not ask to modify.
4. The "slide" object must contain every field from the original slide, with only the requested changes applied.
5. The "explanation" should be in Korean, concise (1-2 sentences).
6. Do NOT wrap the JSON in markdown code fences. Return raw JSON only.
7. Do NOT add any text before or after the JSON.`;

function extractJSON(text: string): any {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch { /* continue */ }

  // Try extracting from code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch { /* continue */ }
  }

  // Try finding JSON object in text
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch { /* continue */ }
  }

  throw new Error('AI 응답에서 JSON을 추출할 수 없습니다.');
}

async function callOpenAIForEdit(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
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
      temperature: 0.5,
      max_tokens: 4000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }
  const data = await res.json();
  return extractJSON(data.choices[0].message.content);
}

async function callClaudeForEdit(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
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
      max_tokens: 4000,
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
  return extractJSON(text);
}

async function callEdgeFunctionForEdit(
  engine: 'openai' | 'claude',
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data, error } = await client.functions.invoke('ppt-generate', {
    body: { engine, systemPrompt, userPrompt },
  });

  if (error) throw new Error(error.message || 'Edge Function 호출 실패');
  if (!data?.result) throw new Error('AI 응답이 비어있습니다.');

  const raw = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
  return extractJSON(raw);
}

export async function processEditRequest(
  message: string,
  currentSlide: SlideData,
  engine: 'openai' | 'claude',
  apiKey?: string
): Promise<EditResponse> {
  const userPrompt = `Current slide JSON:
${JSON.stringify(currentSlide, null, 2)}

User's edit instruction: "${message}"

Return the modified slide as JSON with format: { "slide": { ...all fields... }, "explanation": "변경 설명" }`;

  let rawResponse: any;

  if (apiKey) {
    if (engine === 'openai') {
      rawResponse = await callOpenAIForEdit(apiKey, EDIT_SYSTEM_PROMPT, userPrompt);
    } else {
      rawResponse = await callClaudeForEdit(apiKey, EDIT_SYSTEM_PROMPT, userPrompt);
    }
  } else {
    rawResponse = await callEdgeFunctionForEdit(engine, EDIT_SYSTEM_PROMPT, userPrompt);
  }

  // Extract slide data - try multiple paths
  let slide: SlideData;
  let explanation: string;

  if (rawResponse.slide && typeof rawResponse.slide === 'object') {
    // Expected format: { slide: {...}, explanation: "..." }
    slide = rawResponse.slide;
    explanation = rawResponse.explanation || '슬라이드가 수정되었습니다.';
  } else if (rawResponse.type) {
    // AI returned the slide directly without wrapper
    slide = rawResponse;
    explanation = '슬라이드가 수정되었습니다.';
  } else {
    // Fallback: merge response into original slide
    slide = { ...currentSlide, ...rawResponse };
    explanation = rawResponse.explanation || '슬라이드가 수정되었습니다.';
  }

  // Always preserve type and pageNumber from original
  slide.type = slide.type || currentSlide.type;
  slide.pageNumber = slide.pageNumber ?? currentSlide.pageNumber;

  return { slide, explanation };
}
