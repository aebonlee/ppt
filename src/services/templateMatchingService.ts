/**
 * Template Matching Service (Phase 2)
 * 아웃라인 기반 슬라이드 유형 자동 매칭 (mckinsey 에이전트 방식)
 */
import type { PresentationOutline, OutlineSlideItem, SlideType } from '../types';
import { callAIDirect, callAIViaEdgeFunction } from './aiService';

const TYPE_MATCHING_SYSTEM_PROMPT = `You are a slide type matching expert. Given a presentation outline, assign the optimal slide type to each slide based on its content.

AVAILABLE SLIDE TYPES:
- cover: Title/opening slide
- toc: Table of contents
- section-cover: Section divider
- content: General text content with sections
- diagram: Visual comparison cards
- workbook: Interactive exercise/worksheet
- summary: Key takeaways recap
- back-cover: Closing/thank you slide
- column-chart: Bar/column chart for category comparisons
- line-chart: Line chart for trends over time
- pie-chart: Pie/donut for proportions
- bubble-chart: Multi-dimensional scatter/bubble
- kpi-dashboard: Key metric cards (3-6 metrics)
- comparison-table: Side-by-side comparison grid
- bcg-matrix: 2x2 strategic matrix (BCG/SWOT style)
- priority-matrix: Priority/impact matrix
- assessment-table: Evaluation scoring table
- org-chart: Organizational hierarchy
- timeline: Chronological events/milestones
- roadmap: Future plan/phases
- process-flow: Step-by-step workflow
- quote: Featured quotation/testimonial
- two-column: Two parallel concepts
- three-column: Three parallel concepts/pillars
- stat-card: Large highlighted statistics

MATCHING RULES:
1. First slide MUST be "cover"
2. Last slide should be "summary" or "back-cover"
3. Include "toc" if total slides >= 8
4. Use "section-cover" before new major sections
5. Numeric data/statistics → chart types or stat-card
6. Comparisons → comparison-table, two-column, three-column
7. Timeline/milestones → timeline, roadmap
8. Processes/steps → process-flow
9. Hierarchy → org-chart
10. Key metrics → kpi-dashboard
11. Quotes → quote
12. Strategic analysis → bcg-matrix, priority-matrix
13. Avoid more than 3 consecutive "content" slides
14. Mix at least 4 different types in any 10-slide span

RULES:
1. Return ONLY valid JSON. No markdown.
2. Return the same slides array with updated "suggestedType" field.
3. Keep the original titles and descriptions.

JSON FORMAT:
{
  "slides": [
    {
      "index": 1,
      "title": "original title",
      "description": "original description",
      "suggestedType": "matched-type",
      "keyPoints": ["point 1"]
    }
  ]
}`;

/**
 * 아웃라인의 각 슬라이드에 최적 유형 자동 배정
 */
export async function matchSlideTypes(
  outline: PresentationOutline,
  engine: 'openai' | 'claude',
  apiKey?: string
): Promise<PresentationOutline> {
  const userPrompt = `프레젠테이션 제목: "${outline.title}"
대상 청중: ${outline.targetAudience || '일반'}
톤: ${outline.tone || '전문적'}
총 슬라이드: ${outline.slides.length}장

현재 아웃라인:
${JSON.stringify(outline.slides, null, 2)}

각 슬라이드에 최적의 슬라이드 유형을 배정해주세요.`;

  let response: any;
  if (apiKey) {
    response = await callAIDirect(engine, apiKey, TYPE_MATCHING_SYSTEM_PROMPT, userPrompt);
  } else {
    response = await callAIViaEdgeFunction(engine, TYPE_MATCHING_SYSTEM_PROMPT, userPrompt);
  }

  if (!response.slides || !Array.isArray(response.slides)) {
    // Fallback: return original outline with rule-based matching
    return { ...outline, slides: applyRuleBasedMatching(outline.slides) };
  }

  const validTypes: SlideType[] = [
    'cover', 'toc', 'section-cover', 'content', 'diagram', 'workbook', 'summary', 'back-cover',
    'column-chart', 'line-chart', 'pie-chart', 'bubble-chart', 'kpi-dashboard',
    'comparison-table', 'bcg-matrix', 'priority-matrix', 'assessment-table',
    'org-chart', 'timeline', 'roadmap', 'process-flow',
    'quote', 'two-column', 'three-column', 'stat-card',
  ];

  const matchedSlides: OutlineSlideItem[] = response.slides.map((s: any, i: number) => ({
    index: s.index || i + 1,
    title: s.title || outline.slides[i]?.title || `슬라이드 ${i + 1}`,
    description: s.description || outline.slides[i]?.description || '',
    suggestedType: validTypes.includes(s.suggestedType) ? s.suggestedType : (outline.slides[i]?.suggestedType || 'content'),
    keyPoints: s.keyPoints || outline.slides[i]?.keyPoints || [],
  }));

  return { ...outline, slides: matchedSlides };
}

/**
 * 규칙 기반 폴백 매칭 (AI 호출 실패 시)
 */
function applyRuleBasedMatching(slides: OutlineSlideItem[]): OutlineSlideItem[] {
  const keywords: Record<string, SlideType> = {
    '비교': 'comparison-table',
    '대비': 'comparison-table',
    'vs': 'comparison-table',
    '차트': 'column-chart',
    '그래프': 'line-chart',
    '통계': 'stat-card',
    '수치': 'stat-card',
    '비율': 'pie-chart',
    '점유율': 'pie-chart',
    '추이': 'line-chart',
    '변화': 'line-chart',
    '타임라인': 'timeline',
    '역사': 'timeline',
    '연혁': 'timeline',
    '로드맵': 'roadmap',
    '계획': 'roadmap',
    '전략': 'bcg-matrix',
    '매트릭스': 'priority-matrix',
    '프로세스': 'process-flow',
    '절차': 'process-flow',
    '단계': 'process-flow',
    '조직': 'org-chart',
    '구조': 'org-chart',
    '인용': 'quote',
    '명언': 'quote',
    'KPI': 'kpi-dashboard',
    '지표': 'kpi-dashboard',
    '성과': 'kpi-dashboard',
    '평가': 'assessment-table',
  };

  return slides.map((slide, i) => {
    // First and last have fixed types
    if (i === 0) return { ...slide, suggestedType: 'cover' as SlideType };
    if (i === slides.length - 1) return { ...slide, suggestedType: 'summary' as SlideType };

    // Check keywords in title and description
    const text = `${slide.title} ${slide.description}`.toLowerCase();
    for (const [keyword, type] of Object.entries(keywords)) {
      if (text.includes(keyword.toLowerCase())) {
        return { ...slide, suggestedType: type };
      }
    }

    return slide;
  });
}

/**
 * 아웃라인 슬라이드 유형 다양성 점수 (0-100)
 */
export function calculateTypeDiversity(slides: OutlineSlideItem[]): number {
  const types = new Set(slides.map(s => s.suggestedType));
  const uniqueTypes = types.size;
  const total = slides.length;

  // Ideal: at least 1 unique type per 3 slides
  const idealUnique = Math.ceil(total / 3);
  return Math.min(100, Math.round((uniqueTypes / idealUnique) * 100));
}
