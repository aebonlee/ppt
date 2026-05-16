import type { SlideType } from '../types';

export type SlideCategory = 'basic' | 'chart' | 'matrix' | 'structure' | 'special';

export interface SlideTypeMeta {
  type: SlideType;
  name: string;
  nameKo: string;
  category: SlideCategory;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}

export const SLIDE_TYPE_REGISTRY: Record<SlideType, SlideTypeMeta> = {
  // ─── Basic (8종) ───
  'cover': {
    type: 'cover',
    name: 'Cover',
    nameKo: '표지',
    category: 'basic',
    description: 'Title slide with headline, subtitle, and branding',
    requiredFields: ['title', 'headline'],
    optionalFields: ['subtitle', 'categoryChip', 'publisherInfo'],
  },
  'toc': {
    type: 'toc',
    name: 'Table of Contents',
    nameKo: '목차',
    category: 'basic',
    description: 'Overview of presentation structure',
    requiredFields: ['title', 'tocSections'],
    optionalFields: ['howToUse'],
  },
  'section-cover': {
    type: 'section-cover',
    name: 'Section Cover',
    nameKo: '섹션 표지',
    category: 'basic',
    description: 'Divider slide introducing a new part/section',
    requiredFields: ['partNumber', 'partTitle'],
    optionalFields: ['chapters'],
  },
  'content': {
    type: 'content',
    name: 'Content',
    nameKo: '본문',
    category: 'basic',
    description: 'Standard body slide with text, tables, and key points',
    requiredFields: ['sections'],
    optionalFields: ['chapterNumber', 'chapterTitle', 'partNumber', 'partTitle', 'footnote'],
  },
  'diagram': {
    type: 'diagram',
    name: 'Diagram',
    nameKo: '다이어그램',
    category: 'basic',
    description: 'Visual comparison cards with labels and values',
    requiredFields: ['diagramCards'],
    optionalFields: ['chapterTitle', 'sections'],
  },
  'workbook': {
    type: 'workbook',
    name: 'Workbook',
    nameKo: '워크북',
    category: 'basic',
    description: 'Hands-on exercise slide with steps and checklist',
    requiredFields: ['steps'],
    optionalFields: ['learningObjective', 'scenario', 'checklist', 'caution', 'workbookCode'],
  },
  'summary': {
    type: 'summary',
    name: 'Summary',
    nameKo: '요약',
    category: 'basic',
    description: 'Recap slide summarizing key takeaways',
    requiredFields: ['summaryItems'],
    optionalFields: ['summaryHeadline', 'fromHere'],
  },
  'back-cover': {
    type: 'back-cover',
    name: 'Back Cover',
    nameKo: '뒷표지',
    category: 'basic',
    description: 'Closing slide with thank-you or contact info',
    requiredFields: ['title'],
    optionalFields: ['subtitle'],
  },

  // ─── Chart (5종) ───
  'column-chart': {
    type: 'column-chart',
    name: 'Column Chart',
    nameKo: '막대 차트',
    category: 'chart',
    description: 'Vertical bar chart for comparing categorical data',
    requiredFields: ['chartConfig'],
    optionalFields: ['title', 'subtitle', 'footnote'],
  },
  'line-chart': {
    type: 'line-chart',
    name: 'Line Chart',
    nameKo: '꺾은선 차트',
    category: 'chart',
    description: 'Line chart for showing trends over time',
    requiredFields: ['chartConfig'],
    optionalFields: ['title', 'subtitle', 'footnote'],
  },
  'pie-chart': {
    type: 'pie-chart',
    name: 'Pie Chart',
    nameKo: '원형 차트',
    category: 'chart',
    description: 'Pie/donut chart for showing proportions',
    requiredFields: ['chartConfig'],
    optionalFields: ['title', 'subtitle', 'footnote'],
  },
  'bubble-chart': {
    type: 'bubble-chart',
    name: 'Bubble Chart',
    nameKo: '버블 차트',
    category: 'chart',
    description: 'Bubble chart for multi-dimensional data comparison',
    requiredFields: ['chartConfig'],
    optionalFields: ['title', 'subtitle', 'footnote'],
  },
  'kpi-dashboard': {
    type: 'kpi-dashboard',
    name: 'KPI Dashboard',
    nameKo: 'KPI 대시보드',
    category: 'chart',
    description: 'Key metrics display with trend indicators',
    requiredFields: ['kpiMetrics'],
    optionalFields: ['title', 'subtitle'],
  },

  // ─── Matrix (4종) ───
  'comparison-table': {
    type: 'comparison-table',
    name: 'Comparison Table',
    nameKo: '비교 테이블',
    category: 'matrix',
    description: 'Side-by-side comparison of items or options',
    requiredFields: ['comparisonHeaders', 'comparisonRows'],
    optionalFields: ['title', 'subtitle'],
  },
  'bcg-matrix': {
    type: 'bcg-matrix',
    name: 'BCG Matrix',
    nameKo: 'BCG 매트릭스',
    category: 'matrix',
    description: '2x2 strategic matrix (Star/Cash Cow/Question/Dog)',
    requiredFields: ['matrixConfig'],
    optionalFields: ['title', 'subtitle'],
  },
  'priority-matrix': {
    type: 'priority-matrix',
    name: 'Priority Matrix',
    nameKo: '우선순위 매트릭스',
    category: 'matrix',
    description: 'Effort vs Impact or similar 2x2 prioritization grid',
    requiredFields: ['matrixConfig'],
    optionalFields: ['title', 'subtitle'],
  },
  'assessment-table': {
    type: 'assessment-table',
    name: 'Assessment Table',
    nameKo: '평가 테이블',
    category: 'matrix',
    description: 'Scoring/rating table with criteria and scores',
    requiredFields: ['comparisonHeaders', 'comparisonRows'],
    optionalFields: ['title', 'subtitle', 'footnote'],
  },

  // ─── Structure (4종) ───
  'org-chart': {
    type: 'org-chart',
    name: 'Organization Chart',
    nameKo: '조직도',
    category: 'structure',
    description: 'Hierarchical organization or team structure',
    requiredFields: ['orgChart'],
    optionalFields: ['title', 'subtitle'],
  },
  'timeline': {
    type: 'timeline',
    name: 'Timeline',
    nameKo: '타임라인',
    category: 'structure',
    description: 'Chronological sequence of events or milestones',
    requiredFields: ['timelineEvents'],
    optionalFields: ['title', 'subtitle'],
  },
  'roadmap': {
    type: 'roadmap',
    name: 'Roadmap',
    nameKo: '로드맵',
    category: 'structure',
    description: 'Project phases or future plans timeline',
    requiredFields: ['timelineEvents'],
    optionalFields: ['title', 'subtitle'],
  },
  'process-flow': {
    type: 'process-flow',
    name: 'Process Flow',
    nameKo: '프로세스 플로',
    category: 'structure',
    description: 'Step-by-step process or workflow diagram',
    requiredFields: ['processSteps'],
    optionalFields: ['title', 'subtitle'],
  },

  // ─── Special (4종) ───
  'quote': {
    type: 'quote',
    name: 'Quote',
    nameKo: '인용구',
    category: 'special',
    description: 'Featured quote or testimonial',
    requiredFields: ['quote'],
    optionalFields: ['title'],
  },
  'two-column': {
    type: 'two-column',
    name: 'Two Column',
    nameKo: '2단 레이아웃',
    category: 'special',
    description: 'Split content into two equal columns',
    requiredFields: ['columns'],
    optionalFields: ['title', 'subtitle'],
  },
  'three-column': {
    type: 'three-column',
    name: 'Three Column',
    nameKo: '3단 레이아웃',
    category: 'special',
    description: 'Split content into three equal columns',
    requiredFields: ['columns'],
    optionalFields: ['title', 'subtitle'],
  },
  'stat-card': {
    type: 'stat-card',
    name: 'Stat Card',
    nameKo: '통계 카드',
    category: 'special',
    description: 'Large highlighted statistics with context',
    requiredFields: ['statHighlight'],
    optionalFields: ['title', 'subtitle'],
  },
};

export function getSlideTypesByCategory(category: SlideCategory): SlideTypeMeta[] {
  return Object.values(SLIDE_TYPE_REGISTRY).filter(m => m.category === category);
}

export function getAllSlideTypes(): SlideTypeMeta[] {
  return Object.values(SLIDE_TYPE_REGISTRY);
}
