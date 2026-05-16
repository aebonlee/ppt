/**
 * Outline Service (Phase 2)
 * Socratic 질문 생성 → 사용자 답변 기반 아웃라인 생성
 */
import type { OutlineQuestion, PresentationOutline, OutlineSlideItem, SlideType } from '../types';
import { callAIDirect, callAIViaEdgeFunction } from './aiService';

const QUESTION_SYSTEM_PROMPT = `You are a presentation planning assistant. Given a topic, generate exactly 5 structured questions that will help create the best presentation outline.

RULES:
1. Return ONLY valid JSON matching the format below. No markdown, no explanation.
2. Questions should cover: purpose/goal, target audience, key arguments, data availability, and desired tone/style.
3. Each question should have 3-4 suggested options for easy selection.
4. Questions and options must be in Korean.

JSON FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "question": "이 프레젠테이션의 주요 목적은 무엇인가요?",
      "hint": "목적에 따라 슬라이드 구성이 달라집니다",
      "options": ["정보 전달/교육", "설득/제안", "보고/분석", "브레인스토밍"]
    }
  ]
}`;

const OUTLINE_SYSTEM_PROMPT = `You are a professional presentation architect. Create a detailed slide outline based on the topic and user's answers to planning questions.

RULES:
1. Return ONLY valid JSON. No markdown, no code fences.
2. Each slide should have a clear title, description, and suggested slide type.
3. Use diverse slide types for visual variety.
4. Slide types available: cover, toc, section-cover, content, diagram, workbook, summary, back-cover, column-chart, line-chart, pie-chart, bubble-chart, kpi-dashboard, comparison-table, bcg-matrix, priority-matrix, assessment-table, org-chart, timeline, roadmap, process-flow, quote, two-column, three-column, stat-card
5. First slide must be "cover", include "toc" if slideCount >= 8, last should be "summary" or "back-cover".
6. All text in Korean.

TYPE SELECTION GUIDANCE:
- Numbers/stats → chart types or stat-card
- Comparisons → comparison-table, two-column, three-column
- Timeline/history → timeline, roadmap
- Processes → process-flow
- Hierarchy → org-chart
- Key metrics → kpi-dashboard
- Quotes/testimonials → quote
- Strategic analysis → bcg-matrix, priority-matrix

JSON FORMAT:
{
  "title": "프레젠테이션 제목",
  "subtitle": "부제목 (optional)",
  "targetAudience": "대상 청중",
  "tone": "톤/스타일",
  "slides": [
    {
      "index": 1,
      "title": "슬라이드 제목",
      "description": "이 슬라이드에서 다룰 내용 설명",
      "suggestedType": "cover",
      "keyPoints": ["핵심 포인트 1", "핵심 포인트 2"]
    }
  ]
}`;

/**
 * 주제 기반 Socratic 질문 5개 생성
 */
export async function generateSocraticQuestions(
  topic: string,
  engine: 'openai' | 'claude',
  apiKey?: string
): Promise<OutlineQuestion[]> {
  const userPrompt = `프레젠테이션 주제: "${topic}"

이 주제에 맞는 5개의 구조화된 기획 질문을 생성해주세요.`;

  let response: any;
  if (apiKey) {
    response = await callAIDirect(engine, apiKey, QUESTION_SYSTEM_PROMPT, userPrompt);
  } else {
    response = await callAIViaEdgeFunction(engine, QUESTION_SYSTEM_PROMPT, userPrompt);
  }

  // response could be the full presentation structure or just questions
  const questions = response.questions || response;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('질문 생성에 실패했습니다. 다시 시도해 주세요.');
  }

  return questions.map((q: any, i: number) => ({
    id: q.id || `q${i + 1}`,
    question: q.question,
    hint: q.hint || undefined,
    options: q.options || undefined,
  }));
}

/**
 * 사용자 답변 기반 아웃라인 생성
 */
export async function generateOutline(
  topic: string,
  answers: Record<string, string>,
  slideCount: number,
  engine: 'openai' | 'claude',
  apiKey?: string,
  referenceContent?: string
): Promise<PresentationOutline> {
  const answersText = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  let userPrompt = `프레젠테이션 주제: "${topic}"
슬라이드 수: ${slideCount}장

사용자 답변:
${answersText}

위 정보를 바탕으로 ${slideCount}장의 슬라이드 아웃라인을 생성해주세요.`;

  if (referenceContent) {
    const trimmed = referenceContent.substring(0, 6000);
    userPrompt += `\n\n참고 자료:\n---\n${trimmed}\n---`;
  }

  let response: any;
  if (apiKey) {
    response = await callAIDirect(engine, apiKey, OUTLINE_SYSTEM_PROMPT, userPrompt);
  } else {
    response = await callAIViaEdgeFunction(engine, OUTLINE_SYSTEM_PROMPT, userPrompt);
  }

  // Validate outline structure
  if (!response.slides || !Array.isArray(response.slides)) {
    throw new Error('아웃라인 생성에 실패했습니다. 다시 시도해 주세요.');
  }

  const validTypes: SlideType[] = [
    'cover', 'toc', 'section-cover', 'content', 'diagram', 'workbook', 'summary', 'back-cover',
    'column-chart', 'line-chart', 'pie-chart', 'bubble-chart', 'kpi-dashboard',
    'comparison-table', 'bcg-matrix', 'priority-matrix', 'assessment-table',
    'org-chart', 'timeline', 'roadmap', 'process-flow',
    'quote', 'two-column', 'three-column', 'stat-card',
  ];

  const slides: OutlineSlideItem[] = response.slides.map((s: any, i: number) => ({
    index: s.index || i + 1,
    title: s.title || `슬라이드 ${i + 1}`,
    description: s.description || '',
    suggestedType: validTypes.includes(s.suggestedType) ? s.suggestedType : 'content',
    keyPoints: s.keyPoints || [],
  }));

  return {
    title: response.title || topic,
    subtitle: response.subtitle,
    targetAudience: response.targetAudience,
    tone: response.tone,
    slides,
  };
}

/**
 * 아웃라인에서 빠른 아웃라인 생성 (질문 없이 직접)
 */
export async function generateQuickOutline(
  topic: string,
  slideCount: number,
  engine: 'openai' | 'claude',
  apiKey?: string,
  referenceContent?: string
): Promise<PresentationOutline> {
  let userPrompt = `프레젠테이션 주제: "${topic}"
슬라이드 수: ${slideCount}장

위 주제로 ${slideCount}장의 전문적인 프레젠테이션 아웃라인을 생성해주세요.
다양한 슬라이드 유형을 활용하여 시각적으로 풍부한 구성을 만들어주세요.`;

  if (referenceContent) {
    const trimmed = referenceContent.substring(0, 6000);
    userPrompt += `\n\n참고 자료:\n---\n${trimmed}\n---`;
  }

  let response: any;
  if (apiKey) {
    response = await callAIDirect(engine, apiKey, OUTLINE_SYSTEM_PROMPT, userPrompt);
  } else {
    response = await callAIViaEdgeFunction(engine, OUTLINE_SYSTEM_PROMPT, userPrompt);
  }

  if (!response.slides || !Array.isArray(response.slides)) {
    throw new Error('아웃라인 생성에 실패했습니다.');
  }

  const validTypes: SlideType[] = [
    'cover', 'toc', 'section-cover', 'content', 'diagram', 'workbook', 'summary', 'back-cover',
    'column-chart', 'line-chart', 'pie-chart', 'bubble-chart', 'kpi-dashboard',
    'comparison-table', 'bcg-matrix', 'priority-matrix', 'assessment-table',
    'org-chart', 'timeline', 'roadmap', 'process-flow',
    'quote', 'two-column', 'three-column', 'stat-card',
  ];

  return {
    title: response.title || topic,
    subtitle: response.subtitle,
    targetAudience: response.targetAudience,
    tone: response.tone,
    slides: response.slides.map((s: any, i: number) => ({
      index: s.index || i + 1,
      title: s.title || `슬라이드 ${i + 1}`,
      description: s.description || '',
      suggestedType: validTypes.includes(s.suggestedType) ? s.suggestedType : 'content',
      keyPoints: s.keyPoints || [],
    })),
  };
}
