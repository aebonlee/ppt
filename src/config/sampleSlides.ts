import type { SlideData } from '../types';

export const sampleCoverSlide: SlideData = {
  type: 'cover',
  headline: '디지털 트랜스포메이션\n전략 가이드',
  subtitle: 'DIGITAL TRANSFORMATION STRATEGY',
  categoryChip: 'BUSINESS STRATEGY',
  partIndex: [
    { partNumber: 'PART 01', title: '현황 분석' },
    { partNumber: 'PART 02', title: '실행 전략' },
    { partNumber: 'PART 03', title: '로드맵' },
  ],
  publisherInfo: { left: 'DreamIT Biz', right: '2026 EDITION' },
};

export const sampleCoverSlideLandscape: SlideData = {
  type: 'cover',
  headline: '디지털 트랜스포메이션\n전략 가이드',
  subtitle: 'DIGITAL TRANSFORMATION STRATEGY',
  categoryChip: 'BUSINESS STRATEGY',
  partIndex: [
    { partNumber: 'PART 01', title: '현황 분석' },
    { partNumber: 'PART 02', title: '실행 전략' },
    { partNumber: 'PART 03', title: '로드맵' },
  ],
  publisherInfo: { left: 'DreamIT Biz', right: '2026 EDITION' },
};

export const sampleContentSlide: SlideData = {
  type: 'content',
  partNumber: 1,
  partTitle: '현황 분석',
  subtitle: 'ANALYSIS',
  chapterNumber: 1,
  chapterTitle: '디지털 전환의 핵심 요소',
  pageNumber: 5,
  sections: [
    {
      subTitle: '클라우드 인프라 전환',
      body: '기업의 디지털 전환에서 가장 중요한 첫 단계는 클라우드 인프라로의 전환입니다. 이를 통해 확장성, 유연성, 비용 효율성을 동시에 확보할 수 있습니다.',
    },
  ],
  footnote: 'Digital Transformation Strategy Guide',
};

export const sampleSummarySlide: SlideData = {
  type: 'summary',
  summaryHeadline: '핵심 요약\n& 결론',
  summaryItems: [
    { partLabel: 'PART 01', title: '현황 분석', description: '현재 디지털 성숙도를 파악하고 개선 기회를 도출합니다.' },
    { partLabel: 'PART 02', title: '실행 전략', description: '단계별 실행 로드맵과 KPI를 수립합니다.' },
  ],
  pageNumber: 15,
};

export const sampleSlides: SlideData[] = [
  sampleCoverSlide,
  sampleContentSlide,
  sampleSummarySlide,
];
