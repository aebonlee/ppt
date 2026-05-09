/**
 * Chat Edit Service
 * Handles AI-based slide editing via chat messages
 */
import type { SlideData } from '../types';
import { callAIDirect, callAIViaEdgeFunction } from './aiService';

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
1. Return ONLY valid JSON matching this format: { "slide": { ...modified slide data... }, "explanation": "what was changed" }
2. Keep the same slide "type" unless the user explicitly asks to change it.
3. Preserve all existing fields that the user did not ask to modify.
4. The explanation should be in Korean, concise (1-2 sentences).
5. Do not wrap in markdown code fences.`;

export async function processEditRequest(
  message: string,
  currentSlide: SlideData,
  engine: 'openai' | 'claude',
  apiKey?: string
): Promise<EditResponse> {
  const userPrompt = `Current slide JSON:
${JSON.stringify(currentSlide, null, 2)}

Edit instruction: ${message}

Return the modified slide JSON with explanation.`;

  let rawResponse: any;

  if (apiKey) {
    rawResponse = await callAIDirect(engine, apiKey, EDIT_SYSTEM_PROMPT, userPrompt);
  } else {
    rawResponse = await callAIViaEdgeFunction(engine, EDIT_SYSTEM_PROMPT, userPrompt);
  }

  // The AI functions already parse JSON, but rawResponse might be the edit format
  // or wrapped differently depending on the response
  const slide = rawResponse.slide || rawResponse;
  const explanation = rawResponse.explanation || '슬라이드가 수정되었습니다.';

  // Preserve original type and pageNumber if missing
  if (!slide.type) slide.type = currentSlide.type;
  if (!slide.pageNumber) slide.pageNumber = currentSlide.pageNumber;

  return { slide, explanation };
}
