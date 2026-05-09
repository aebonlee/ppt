# PPT Generator Site (ppt.dreamitbiz.com) - 구현 계획서

> **작성일**: 2026-05-09
> **프로젝트**: DreamIT Biz 85번째 사이트
> **도메인**: https://ppt.dreamitbiz.com
> **리포지토리**: https://github.com/aebonlee/ppt
> **로컬 경로**: D:\dreamit-web\ppt\

---

## 1. 프로젝트 개요

OpenAI/Claude API를 활용하여 웹 기반 HTML 프레젠테이션을 자동 생성하는 유료 서비스 사이트.
사용자가 주제, 슬라이드 수, 방향, 색상 등을 입력하면 AI가 구조화된 JSON을 생성하고,
프론트엔드가 사전 구축된 React 슬라이드 템플릿으로 렌더링합니다.

### 핵심 특징
- **2단계 생성 방식**: AI → JSON → React 템플릿 렌더링 (토큰 80% 절감)
- **API Key 하이브리드**: 관리자 .env 키 + 사용자 직접 입력 지원
- **내보내기**: HTML(ZIP) + PDF + PPTX 3종
- **결제**: PortOne 연동 유료 서비스 (Free/Basic/Pro)

---

## 2. 아키텍처

```
사용자 입력 (주제, 슬라이드 수, 방향, 색상)
    ↓
React 프론트엔드 (Generate 페이지 위자드)
    ↓
Supabase Edge Function: ppt-generate (API 프록시)
    ↓
OpenAI GPT-4o / Claude claude-sonnet-4-20250514
    ↓
구조화된 JSON 응답 → 프론트엔드로 반환
    ↓
SlideRenderer (JSON → HTML 슬라이드 렌더링)
    ↓
미리보기 / 편집 / 내보내기 (HTML-ZIP, PDF, PPTX)
```

---

## 3. 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 19 + Vite 7.x + TypeScript 5.8 |
| 백엔드 | Supabase (PostgreSQL + Auth + Edge Functions) |
| AI 엔진 | OpenAI GPT-4o / Claude claude-sonnet-4-20250514 |
| 슬라이드 렌더링 | React 컴포넌트 → HTML/CSS (절대 위치 지정) |
| 내보내기 | JSZip (HTML-ZIP), window.print() (PDF), pptxgenjs (PPTX) |
| 결제 | PortOne Browser SDK (KG이니시스) |
| 인증 | Supabase Auth (Email, Google, Kakao OAuth) |
| 배포 | GitHub Pages |

---

## 4. 슬라이드 캔버스 규격

샘플 분석 결과 (construction-ai-textbook):

| 항목 | 값 |
|------|-----|
| **세로 (기본)** | 794px x 1123px (A4 96dpi) |
| **가로** | 1123px x 794px |
| **마진** | 위 35mm(132px) / 좌우·아래 25mm(94.5px) / 머리말 15mm(57px) |
| **레이아웃** | 절대 위치 지정 (position: absolute) |
| **폰트** | 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif |

### CSS 디자인 토큰 (tokens.css 분석)

```css
:root {
  /* 색상 체계 */
  --c-ink:        #1A2332;   /* 차콜 (PART/제목) */
  --c-ink-2:      #2C3849;   /* 본문 깊은 회청 */
  --c-body:       #2D2D2D;   /* 본문 텍스트 */
  --c-mute:       #6B7280;   /* 캡션/번호 */
  --c-rule:       #D6D0C2;   /* 가이드 라인 */
  --c-rule-2:     #E8E4DA;   /* 옅은 라인 */
  --c-bg:         #FFFFFF;
  --c-paper:      #F5F2EC;   /* 오프화이트 */
  --c-yellow:     #F4B400;   /* 안전 옐로우 (액센트 1) */
  --c-orange:     #E8521C;   /* 액센트 오렌지 (액센트 2) */
  --c-warn:       #C0392B;   /* 주의 */
  --c-side:       #1A2332;   /* 사이드 태그 배경 */

  /* 폰트 사이즈 (10pt = 13.3px @ 96dpi) */
  --fs-part:      27px;  /* 20pt — PART/대단원 */
  --fs-mid:       27px;  /* 20pt — 중단원 */
  --fs-sub:       23px;  /* 17pt — 소단원 */
  --fs-key:       20px;  /* 15pt — 핵심주제 */
  --fs-body:      13.3px; /* 10pt — 본문 */
  --fs-foot:      12px;  /* 9pt — 각주 */
  --fs-caption:   11px;
}
```

---

## 5. 슬라이드 타입 분석 (8종)

### 5.1 CoverSlide (표지 A) — `cover`
- **용도**: 프레젠테이션 메인 표지
- **구조**: 상단 차콜 패널(560px) + 하단 오프화이트 패널
- **요소**: 미세 그리드, 옐로우 코너 마크, 머리말, 카테고리 칩, 메인 헤드라인(42px/800), 부제, 모듈 블록(4개), 챕터 인덱스, 발행 정보
- **참조 파일**: `c1-cover-a.html`

### 5.2 TOCSlide (목차) — `toc`
- **용도**: 전체 PART별 차례
- **구조**: 헤더 라인 + "CONTENTS 차례" 타이틀 + PART별 섹션 (3~4개)
- **요소**: PART 번호(36px/900), 제목(20px/800), 항목 리스트 (번호+제목+페이지)
- **하단**: HOW TO USE 박스 (오프화이트 배경 + 옐로우 사이드바)
- **참조 파일**: `c1-contents.html`

### 5.3 SectionCoverSlide (PART 표지) — `section-cover`
- **용도**: 각 PART의 시작 표지
- **구조**: 헤더 라인 + 기하학 블록 장식 + 대형 PART 번호(200px/900)
- **요소**: 옐로우 구분선, 제목(27px/900), 영문 부제, 챕터 목록 (번호 박스 + 제목 + 설명), 하단 장식 블록, 페이지 번호
- **참조 파일**: `c1-part-01-cover.html`

### 5.4 ContentSlide (본문) — `content`
- **용도**: 주요 교육 내용 전달
- **구조**: 상단 헤더 + 좌측 사이드바 + 본문 영역
- **요소**:
  - **헤더**: PART명(10px 소문자) + 구분선
  - **사이드바**: 차콜 세로 바(36px) + 옐로우 상단(80px) + 세로 텍스트 (PART명)
  - **챕터 넘버**: 옐로우 박스(54px) + 30px 숫자
  - **소단원 헤더**: 오렌지 도트(8px) + 23px 타이틀
  - **핵심주제**: 옐로우 다이아몬드 + 20px 타이틀
  - **본문**: 13.3px 양쪽정렬
  - **다이어그램 박스**: 오프화이트 배경 + 테두리
  - **KEY POINT 박스**: 옐로우 배경(#FFF6D6) + 옐로우 사이드바
  - **각주**: 하단 구분선 + 9px 각주 + 페이지 번호(11px/800)
- **참조 파일**: `c1-part-01-section-01.html`

### 5.5 DiagramSlide (다이어그램/매트릭스) — `diagram`
- **용도**: 시각적 비교, 매트릭스, 플로우 차트
- **구조**: ContentSlide와 동일한 헤더/사이드바 + 다이어그램 영역
- **요소**: 도메인 카드(4열), 코드 블록(모노스페이스), 표 형태 리스트
- **참조 파일**: `c1-part-02-diagram.html`

### 5.6 WorkbookSlide (실습 워크북) — `workbook`
- **용도**: 실습 활동, 체크리스트, 따라하기
- **구조**: ContentSlide와 동일한 헤더/사이드바 + 워크북 영역
- **요소**:
  - **STEP 블록**: 차콜 90x90 박스 + STEP 번호 + 영문 부제
  - **학습 목표**: 옐로우 배경(#FFF6D6) + 사이드바
  - **시나리오**: 오프화이트 배경 + 차콜 사이드바
  - **따라하기**: 넘버링된 단계별 지시
  - **직접 해보기**: 점선 테두리 박스 + 체크박스
  - **주의 박스**: 핑크 배경(#FFEEE6) + 오렌지 사이드바
  - **코드 블록**: 옐로우 라벨([코드 X-Y]) + 회색 배경 + 차콜 좌측 보더
- **참조 파일**: `c1-part-01-workbook.html`

### 5.7 SummarySlide (요약/정리) — `summary`
- **용도**: PART별 내용 요약, 교재 마무리
- **구조**: 차콜 전체 배경 + 도트 패턴 오버레이
- **요소**: 옐로우 코너 마크, "SUMMARY" 라벨, 대형 마무리 문구(48px), 구분선, PART별 요약 (좌 라벨 + 우 설명), "FROM HERE" 옐로우 박스, 하단 장식 블록
- **참조 파일**: `c1-summary.html`

### 5.8 BackCoverSlide (뒤표지) — `back-cover`
- **용도**: 프레젠테이션 종료 페이지
- **구조**: SummarySlide와 유사 (다크 배경 + 요약 + FROM HERE)
- **색상**: 테마에 따라 배경색 변경 (차콜, 퍼플 등)
- **참조 파일**: `c4-cover-back.html`

---

## 6. 색상 테마 프리셋 (8가지)

AI 생성 시 사용자가 선택할 수 있는 프레젠테이션 색상 테마:

| # | 테마 이름 | Primary | Accent | Background |
|---|----------|---------|--------|------------|
| 1 | Charcoal & Yellow | #1A2332 | #F4B400 | #F5F2EC |
| 2 | Navy & Coral | #1B2A4A | #FF6B6B | #F8F9FA |
| 3 | Forest Green | #1A3C34 | #4CAF50 | #F5F7F5 |
| 4 | Deep Purple | #3D1F5C | #BB86FC | #F8F5FC |
| 5 | Burgundy & Gold | #4A1524 | #FFD700 | #FFF8F0 |
| 6 | Ocean Blue | #0D47A1 | #29B6F6 | #F0F8FF |
| 7 | Warm Terracotta | #5D3A1A | #E07C3E | #FDF6F0 |
| 8 | Midnight & Neon | #0A0E27 | #00FF88 | #F0F5F3 |

---

## 7. 파일 구조 (구현 대상)

```
D:\dreamit-web\ppt\
├── public/
│   └── CNAME                          # ppt.dreamitbiz.com
├── index.html                         # OG/SEO 메타 태그
├── package.json                       # + jszip, pptxgenjs
├── vite.config.ts
├── tsconfig.json
├── .env                               # VITE_OPENAI_API_KEY, VITE_SUPABASE_*
│
├── sample/                            # [기존] 참조용 샘플 파일
│   └── all-project-files/
│       └── construction-ai-textbook.slides/
│           ├── manifest.json
│           ├── assets/tokens.css
│           └── slides/*.html
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                      # CSS 임포트 캐스케이드
    │
    ├── config/
    │   ├── site.ts                    # id='ppt', dbPrefix='ppt_'
    │   ├── admin.ts                   # Superadmin 이메일
    │   └── colorSchemes.ts            # 8가지 프레젠테이션 색상 프리셋
    │
    ├── types/
    │   └── index.ts                   # SlideData, PresentationData 등 타입
    │
    ├── contexts/
    │   ├── AuthContext.tsx             # [템플릿 기반]
    │   ├── ThemeContext.tsx            # [템플릿 기반]
    │   ├── LanguageContext.tsx         # [템플릿 기반]
    │   ├── CartContext.tsx             # [템플릿 기반]
    │   ├── ToastContext.tsx            # [템플릿 기반]
    │   ├── GenerationContext.tsx       # 위자드 상태 관리 (NEW)
    │   └── PresentationContext.tsx     # 편집 상태 관리 (NEW)
    │
    ├── services/
    │   ├── promptBuilder.ts           # 시스템/유저 프롬프트 구성 (NEW)
    │   ├── aiService.ts               # Edge Function 호출 + 재시도 (NEW)
    │   ├── exportService.ts           # 내보내기 통합 (NEW)
    │   ├── htmlSerializer.ts          # React → HTML 문자열 변환 (NEW)
    │   └── pptxExport.ts             # pptxgenjs 매핑 (NEW)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx             # [템플릿 기반]
    │   │   └── Footer.tsx             # [템플릿 기반]
    │   │
    │   └── slides/                    # (NEW) 슬라이드 렌더링 엔진
    │       ├── SlideRenderer.tsx       # 마스터 렌더러 (SlideData → HTML)
    │       ├── SlideStrip.tsx          # 썸네일 내비게이션
    │       ├── SlideEditor.tsx         # 인라인 텍스트 편집
    │       └── templates/
    │           ├── CoverSlide.tsx
    │           ├── TOCSlide.tsx
    │           ├── SectionCoverSlide.tsx
    │           ├── ContentSlide.tsx
    │           ├── DiagramSlide.tsx
    │           ├── WorkbookSlide.tsx
    │           ├── SummarySlide.tsx
    │           └── BackCoverSlide.tsx
    │
    ├── pages/
    │   ├── Home.tsx                   # 랜딩 페이지 (NEW)
    │   ├── Generate.tsx               # 4단계 위자드 (NEW)
    │   ├── Preview.tsx                # 전체화면 뷰어 (NEW)
    │   ├── MyPresentations.tsx        # 내 PT 목록 (NEW)
    │   ├── Pricing.tsx                # 요금제 페이지 (NEW)
    │   ├── Login.tsx                  # [템플릿 기반]
    │   ├── Register.tsx               # [템플릿 기반]
    │   ├── MyPage.tsx                 # [템플릿 기반]
    │   └── NotFound.tsx               # [템플릿 기반]
    │
    ├── layouts/
    │   └── PublicLayout.tsx           # 라우트 정의 (수정)
    │
    ├── utils/
    │   ├── supabase.ts                # [템플릿 기반]
    │   ├── auth.ts                    # [템플릿 기반]
    │   ├── notifications.ts           # [템플릿 기반]
    │   ├── portone.ts                 # [템플릿 기반]
    │   ├── translations.ts            # PPT 전용 번역 키 추가
    │   └── pptxExport.ts             # pptxgenjs 매핑 로직 (NEW)
    │
    └── styles/
        ├── base.css                   # [템플릿 기반]
        ├── navbar.css                 # [템플릿 기반]
        ├── hero.css                   # [템플릿 기반]
        ├── footer.css                 # [템플릿 기반]
        ├── auth.css                   # [템플릿 기반]
        ├── shop.css                   # [템플릿 기반]
        ├── animations.css             # [템플릿 기반]
        ├── dark-mode.css              # [템플릿 기반]
        ├── responsive.css             # [템플릿 기반]
        ├── site.css                   # PPT 전용 CSS (수정)
        └── slides.css                 # 슬라이드 렌더링 CSS (NEW)
```

---

## 8. 타입 정의 (src/types/index.ts 추가분)

```typescript
// === PPT 생성 관련 타입 ===

/** 슬라이드 타입 */
export type SlideType =
  | 'cover'          // 표지
  | 'toc'            // 목차
  | 'section-cover'  // 섹션 표지
  | 'content'        // 본문
  | 'diagram'        // 다이어그램/매트릭스
  | 'workbook'       // 실습 워크북
  | 'summary'        // 요약
  | 'back-cover';    // 뒤표지

/** 슬라이드 방향 */
export type SlideOrientation = 'portrait' | 'landscape';

/** 색상 테마 프리셋 */
export interface ColorScheme {
  id: string;
  name: string;
  nameKo: string;
  primary: string;      // 메인 잉크 컬러
  accent: string;       // 액센트 컬러 (옐로우/골드 등)
  accent2: string;      // 보조 액센트 (오렌지/코럴 등)
  background: string;   // 오프화이트 배경
  mute: string;         // 캡션/보조 텍스트
}

/** 테이블 데이터 */
export interface TableData {
  headers: string[];
  rows: string[][];
}

/** 코드 블록 */
export interface CodeBlock {
  label: string;        // [코드 2-1]
  title: string;        // 코드 블록 제목
  content: string;      // 코드 내용
}

/** 키포인트 박스 */
export interface KeyPoint {
  type: 'key-point' | 'caution' | 'tip';
  title?: string;
  content: string;
}

/** 목차 항목 */
export interface TOCItem {
  number: string;       // ①, ②, ③ 등
  title: string;
  page?: string;
}

/** 챕터 항목 (섹션 표지용) */
export interface ChapterItem {
  number: number;
  title: string;
  description: string;
}

/** 워크북 단계 */
export interface WorkbookStep {
  number: number;
  title: string;
  description: string;
}

/** 체크리스트 항목 */
export interface ChecklistItem {
  label: string;
  options: string[];
}

/** 요약 항목 */
export interface SummaryItem {
  partLabel: string;    // PART 01 등
  title: string;
  description: string;
}

/** 다이어그램 카드 */
export interface DiagramCard {
  title: string;
  headerColor: string;
  items: { label: string; value: string }[];
  difficulty?: string;
}

/** 개별 슬라이드 데이터 */
export interface SlideData {
  type: SlideType;
  // 공통
  title?: string;
  subtitle?: string;
  partNumber?: number;
  partTitle?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  pageNumber?: number;

  // cover
  headline?: string;
  categoryChip?: string;
  modules?: { unitNumber: string; title: string }[];
  partIndex?: { partNumber: string; title: string }[];
  publisherInfo?: { left: string; right: string };

  // toc
  tocSections?: {
    partNumber: string;
    partTitle: string;
    items: TOCItem[];
  }[];
  howToUse?: string;

  // section-cover
  chapters?: ChapterItem[];

  // content
  sections?: {
    subTitle?: string;
    keyTopic?: string;
    body?: string;
    table?: TableData;
    codeBlock?: CodeBlock;
    keyPoint?: KeyPoint;
    diagramCaption?: string;
    diagramContent?: string;
  }[];
  footnote?: string;

  // diagram
  diagramCards?: DiagramCard[];
  listItems?: { label: string; description: string }[];

  // workbook
  stepNumber?: number;
  stepLabel?: string;
  learningObjective?: string;
  scenario?: string;
  steps?: WorkbookStep[];
  checklist?: ChecklistItem[];
  caution?: string;
  workbookCode?: CodeBlock;

  // summary
  summaryHeadline?: string;
  summaryItems?: SummaryItem[];
  fromHere?: string;
}

/** 프레젠테이션 전체 데이터 */
export interface PresentationData {
  id?: string;
  title: string;
  description?: string;
  author?: string;
  orientation: SlideOrientation;
  colorScheme: ColorScheme;
  canvas: { width: number; height: number };
  slides: SlideData[];
  createdAt?: string;
  updatedAt?: string;
}

/** 생성 요청 */
export interface GenerateRequest {
  topic: string;
  slideCount: number;
  orientation: SlideOrientation;
  colorSchemeId: string;
  language: 'ko' | 'en';
  aiEngine: 'openai' | 'claude';
  apiKey?: string;
  additionalInstructions?: string;
}

/** 생성 진행 상태 */
export interface GenerationProgress {
  status: 'idle' | 'generating' | 'parsing' | 'rendering' | 'complete' | 'error';
  progress: number;         // 0~100
  message: string;
  currentSlide?: number;
  totalSlides?: number;
}

/** 구독 플랜 */
export type SubscriptionPlan = 'free' | 'basic' | 'pro';

/** 사용자 구독 정보 */
export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  monthlyLimit: number;
  usedCount: number;
  maxSlides: number;
  canUsePlatformKey: boolean;
  canExportPptx: boolean;
  expiresAt?: string;
}

/** 사용자 설정 */
export interface UserSettings {
  defaultOrientation: SlideOrientation;
  defaultColorScheme: string;
  defaultLanguage: 'ko' | 'en';
  defaultAiEngine: 'openai' | 'claude';
  encryptedApiKey?: string;
}
```

---

## 9. AI 프롬프트 설계 (promptBuilder.ts)

### 시스템 프롬프트 (핵심)

```
You are a professional presentation content architect.
Generate a structured JSON array of slides for a presentation.

CRITICAL RULES:
1. Output ONLY valid JSON — no markdown, no code fences, no explanation.
2. Each slide must have a "type" field matching one of: cover, toc, section-cover, content, diagram, workbook, summary, back-cover
3. Follow the exact field schema for each slide type.
4. Content should be educational, professional, and well-structured.
5. Use Korean (ko) or English (en) based on the language parameter.
6. Generate exactly {slideCount} slides.

SLIDE STRUCTURE:
- Slide 1: cover (표지)
- Slide 2: toc (목차) — if slideCount >= 10
- Slides 3~N-2: section-cover + content + diagram + workbook (반복)
- Slide N-1: summary (요약)
- Slide N: back-cover (뒤표지)
```

### JSON 스키마 강제
- OpenAI: `response_format: { type: 'json_object' }`
- Claude: 시스템 프롬프트에 JSON 스키마 명시 + 응답 파싱

### 토큰 절약 전략
- AI는 슬라이드 내용(텍스트)만 JSON으로 생성
- 레이아웃/스타일/위치는 프론트엔드 React 템플릿이 담당
- 예상 토큰: 10슬라이드 기준 ~2,000 출력 토큰 (HTML 직접 생성 시 ~10,000)

---

## 10. Supabase Edge Function: ppt-generate

```typescript
// supabase/functions/ppt-generate/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { topic, slideCount, orientation, colorSchemeId, language, aiEngine, apiKey } = await req.json()

  // API 키 결정: 사용자 제공 키 우선, 없으면 환경변수
  const openaiKey = apiKey || Deno.env.get('OPENAI_API_KEY')
  const claudeKey = apiKey || Deno.env.get('ANTHROPIC_API_KEY')

  // 프롬프트 구성
  const systemPrompt = buildSystemPrompt(slideCount, language)
  const userPrompt = buildUserPrompt(topic, slideCount, orientation, colorSchemeId)

  let result
  if (aiEngine === 'openai') {
    result = await callOpenAI(openaiKey, systemPrompt, userPrompt)
  } else {
    result = await callClaude(claudeKey, systemPrompt, userPrompt)
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 11. 데이터베이스 (Supabase, ppt_ 접두사)

### 테이블 설계

```sql
-- 프레젠테이션 저장
CREATE TABLE ppt_presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  orientation TEXT DEFAULT 'portrait',
  color_scheme_id TEXT,
  data_json JSONB NOT NULL,
  slide_count INTEGER DEFAULT 0,
  ai_engine TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 사용량 추적
CREATE TABLE ppt_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  year_month TEXT NOT NULL,
  generation_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, year_month)
);

-- 사용자 설정
CREATE TABLE ppt_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  default_orientation TEXT DEFAULT 'portrait',
  default_color_scheme TEXT DEFAULT 'charcoal-yellow',
  default_language TEXT DEFAULT 'ko',
  default_ai_engine TEXT DEFAULT 'openai',
  encrypted_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 구독 플랜
CREATE TABLE ppt_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  plan TEXT DEFAULT 'free',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 결제 기록
CREATE TABLE ppt_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  status TEXT DEFAULT 'pending',
  total_amount INTEGER DEFAULT 0,
  payment_id TEXT,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 결제 상세
CREATE TABLE ppt_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES ppt_orders(id),
  plan TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE ppt_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own data" ON ppt_presentations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own usage" ON ppt_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own settings" ON ppt_user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscription" ON ppt_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders" ON ppt_orders
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own order items" ON ppt_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ppt_orders
      WHERE ppt_orders.id = ppt_order_items.order_id
      AND ppt_orders.user_id::text = auth.uid()::text
    )
  );
```

---

## 12. 요금제 설계

| | Free | Basic (9,900원/월) | Pro (29,900원/월) |
|--|------|-----|-----|
| 월간 생성 횟수 | 3회 | 20회 | 무제한 |
| 최대 슬라이드 수 | 10장 | 30장 | 100장 |
| AI 엔진 | 사용자 키만 | 플랫폼 키 | 플랫폼 키 + 우선 |
| 내보내기 | HTML-ZIP | HTML-ZIP, PDF | HTML-ZIP, PDF, PPTX |
| 저장 | 1개 | 10개 | 무제한 |
| 지원 | - | 이메일 | 이메일 + 카카오톡 |

---

## 13. Generate 페이지 — 4단계 위자드

### Step 1: TopicForm (주제 입력)
- 주제/제목 입력 (textarea)
- 추가 지시사항 (optional textarea)
- 언어 선택 (한국어/영어)

### Step 2: ConfigPanel (설정)
- 방향 선택: 세로(A4) / 가로(16:9)
- 슬라이드 수: 5 / 10 / 15 / 20 / 30
- 색상 테마: 8가지 프리셋 (미리보기 칩)
- AI 엔진: OpenAI GPT-4o / Claude Sonnet
- API 키: 플랫폼 키 사용 / 직접 입력

### Step 3: GenerationProgress (생성 중)
- 프로그레스 바 (0~100%)
- 현재 상태 메시지
- 취소 버튼

### Step 4: ResultView (결과)
- SlideRenderer로 미리보기
- SlideStrip 썸네일 내비게이션
- ExportToolbar (HTML-ZIP / PDF / PPTX)
- 저장 버튼 (Supabase)
- 편집 모드 전환

---

## 14. 내보내기 구현

### HTML-ZIP (JSZip)
```
presentation.zip
├── manifest.json
├── assets/
│   └── tokens.css
└── slides/
    ├── slide-001.html
    ├── slide-002.html
    └── ...
```

### PDF (window.print() + @page CSS)
```css
@media print {
  @page {
    size: 794px 1123px;  /* portrait */
    margin: 0;
  }
  .slide-container {
    page-break-after: always;
    page-break-inside: avoid;
  }
}
```

### PPTX (pptxgenjs)
- SlideData의 각 필드를 pptxgenjs API로 매핑
- 텍스트, 테이블, 도형 위치를 inch 단위로 변환
- 색상 테마 적용

---

## 15. 구현 단계별 체크리스트

### 1단계: 프로젝트 초기 설정
- [ ] templete-ref 파일 복사
- [ ] src/config/site.ts 수정 (id='ppt', dbPrefix='ppt_')
- [ ] public/CNAME 확인
- [ ] index.html OG/SEO 메타 태그
- [ ] package.json에 jszip, pptxgenjs 추가
- [ ] src/types/index.ts에 PPT 타입 추가
- [ ] src/utils/translations.ts에 PPT 번역 키 추가

### 2단계: 슬라이드 렌더링 엔진
- [ ] src/config/colorSchemes.ts
- [ ] src/components/slides/SlideRenderer.tsx
- [ ] src/components/slides/templates/ (8종)
- [ ] src/components/slides/SlideStrip.tsx
- [ ] src/styles/slides.css

### 3단계: AI 통합
- [ ] src/services/promptBuilder.ts
- [ ] src/services/aiService.ts
- [ ] src/contexts/GenerationContext.tsx
- [ ] Supabase Edge Function: ppt-generate
- [ ] src/pages/Generate.tsx

### 4단계: 미리보기 & 편집
- [ ] src/pages/Preview.tsx
- [ ] src/components/slides/SlideEditor.tsx
- [ ] src/contexts/PresentationContext.tsx
- [ ] src/pages/MyPresentations.tsx

### 5단계: 내보내기
- [ ] src/services/exportService.ts
- [ ] src/services/htmlSerializer.ts
- [ ] src/utils/pptxExport.ts

### 6단계: 결제 & 구독
- [ ] src/pages/Pricing.tsx
- [ ] Supabase 테이블 생성
- [ ] PortOne 결제 연동

### 7단계: 홈페이지 & 마무리
- [ ] src/pages/Home.tsx
- [ ] 반응형 CSS
- [ ] 에러 핸들링
- [ ] npm run build & deploy

---

## 16. site.ts 설정값

```typescript
const site: SiteConfig = {
  id: 'ppt',
  name: 'DreamIT PPT Generator',
  nameKo: '드림아이티 PPT 생성기',
  description: 'AI 기반 프레젠테이션 자동 생성 서비스 - OpenAI/Claude를 활용한 전문 슬라이드 제작',
  url: 'https://ppt.dreamitbiz.com',
  dbPrefix: 'ppt_',
  parentSite: { name: 'DreamIT Biz', url: 'https://www.dreamitbiz.com' },
  brand: {
    parts: [
      { text: 'Dream', className: 'brand-dream' },
      { text: 'IT', className: 'brand-it' },
      { text: 'PPT', className: 'brand-biz' }
    ]
  },
  themeColor: '#0046C8',
  features: {
    shop: true,
    community: false,
    search: false,
    auth: true,
    license: false,
  },
  menuItems: [
    { path: '/', labelKey: 'nav.home' },
    { path: '/generate', labelKey: 'site.nav.generate' },
    { path: '/my-presentations', labelKey: 'site.nav.myPresentations' },
    { path: '/pricing', labelKey: 'site.nav.pricing' },
  ],
};
```

---

## 17. 의존성

```json
{
  "dependencies": {
    "jszip": "^3.10.1",
    "pptxgenjs": "^3.12.0"
  }
}
```

기존 templete-ref 의존성: react ^19.x, react-dom ^19.x, react-router-dom ^7.x, @supabase/supabase-js ^2.x

---

## 18. 검증 체크리스트

1. `npm run dev` → 홈 페이지 정상 렌더링
2. Generate 페이지 → 테스트 주제로 PT 생성 → JSON 응답 검증
3. SlideRenderer로 샘플 데이터 렌더링 → 샘플 HTML과 시각적 비교
4. 3가지 내보내기 테스트 (HTML-ZIP, PDF, PPTX)
5. 로그인/결제 플로우 테스트
6. `npm run build` → TypeScript 에러 없음
7. `npm run deploy` → GitHub Pages 배포 성공

---

## 19. 참고 파일 목록

| 파일 | 위치 | 용도 |
|------|------|------|
| manifest.json | sample/all-project-files/construction-ai-textbook.slides/ | 슬라이드 플레이리스트 |
| tokens.css | sample/.../assets/ | CSS 디자인 토큰 |
| c1-cover-a.html | sample/.../slides/ | 표지 A 참조 |
| c1-contents.html | sample/.../slides/ | 목차 참조 |
| c1-part-01-cover.html | sample/.../slides/ | PART 표지 참조 |
| c1-part-01-section-01.html | sample/.../slides/ | 본문 참조 |
| c1-part-02-diagram.html | sample/.../slides/ | 다이어그램 참조 |
| c1-part-01-workbook.html | sample/.../slides/ | 워크북 참조 |
| c1-summary.html | sample/.../slides/ | 요약 참조 |
| c4-cover-back.html | sample/.../slides/ | 뒤표지 참조 |

---

**Copyright (c) 2025-2026 DreamIT Biz (Ph.D Aebon Lee). All Rights Reserved.**
