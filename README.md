# DreamIT Biz 하위 사이트 템플릿

본사이트(www.dreamitbiz.com)의 핵심 인프라(인증, 결제, 테마, 다국어)를 상속받는 하위 사이트 템플릿입니다.

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 Supabase, PortOne 등 키를 입력하세요

# 3. 개발 서버 시작
npm run dev
```

## 사이트 커스터마이징

### 1. 사이트 설정 (`src/config/site.js`)

사이트명, 메뉴, 푸터 링크, Family Site 목록 등을 수정합니다.

```js
const site = {
  name: 'DreamIT Books',        // 사이트명 (영문)
  nameKo: '드림아이티 출판사',     // 사이트명 (한글)
  description: '...',            // 사이트 설명

  brand: {
    parts: [                     // 로고 텍스트 (span 단위)
      { text: 'Dream', className: 'brand-dream' },
      { text: 'IT', className: 'brand-it' },
      { text: 'Books', className: 'brand-biz' }
    ]
  },

  menuItems: [                   // 네비게이션 메뉴
    { path: '/', labelKey: 'nav.home' },
    {
      labelKey: 'site.nav.books',
      path: '/books',
      activePath: '/books',
      dropdown: [
        { path: '/books/it', labelKey: 'site.nav.itBooks' },
        { path: '/books/education', labelKey: 'site.nav.eduBooks' }
      ]
    },
    { path: '/shop', labelKey: 'shop.title', activePath: '/shop' }
  ],

  footerLinks: [...],           // 푸터 바로가기
  familySites: [...]            // Family Site 드롭다운
};
```

### 2. 다국어 (`src/utils/translations.js`)

`site` 키 아래에 사이트 전용 번역을 추가합니다.

```js
// ko
site: {
  nav: { books: '도서', itBooks: 'IT 도서' },
  home: { title: '...', subtitle: '...' }
}
```

### 3. 페이지 추가

1. `src/pages/` 에 새 페이지 컴포넌트 생성
2. `src/layouts/PublicLayout.jsx` 에 Route 추가
3. `src/config/site.js` 의 `menuItems` 에 메뉴 항목 추가

```jsx
// PublicLayout.jsx
const Books = lazy(() => import('../pages/Books'));
// ...
<Route path="/books" element={<Books />} />
```

### 4. 스타일 커스텀

- `src/styles/site.css` — 사이트 전용 스타일
- CSS 변수는 `src/styles/base.css` 에 정의되어 있음
- 다크모드는 `src/styles/dark-mode.css` 에서 자동 처리

## 상속되는 기능

| 기능 | 설명 |
|------|------|
| Supabase 인증 | Google, Kakao, Email 로그인/가입 |
| PortOne 결제 | 카드결제 (아임포트) |
| 테마 시스템 | 다크/라이트/자동 + 5색 컬러 테마 |
| 다국어 | 한국어/영어 전환 |
| 장바구니 | sessionStorage 기반 장바구니 |
| 토스트 알림 | 전역 알림 시스템 |

## 환경변수

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `VITE_PORTONE_STORE_ID` | PortOne 스토어 ID |
| `VITE_PORTONE_CHANNEL_KEY` | PortOne 채널 키 |
| `VITE_SITE_URL` | 배포 도메인 URL |

## 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# GitHub Pages 배포
npm run deploy
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

---

## 2026-04-30 템플릿 업그레이드 v5.1

### 1. 콘텐츠 영역 위치 수정 (base.css)

fixed navbar(80px)로 인해 내부 페이지의 page-header 콘텐츠가 가려지는 문제를 수정했습니다.

- `.page-header` 기본 스타일 추가 — `padding-top: calc(var(--nav-height) + 60px)`
- `.page-title`, `.page-description` 스타일 정의
- 기존 responsive.css의 768px/480px 모바일 오버라이드와 호환

```css
.page-header {
    background: var(--hero-bg);
    padding: calc(var(--nav-height) + 60px) 0 60px;
    text-align: center;
    color: var(--text-white);
}
```

### 2. 다크모드 토글 버튼 가시성 개선 (dark-mode.css)

다크모드에서 Navbar의 테마 전환/컬러 피커/검색 버튼이 보이지 않던 문제를 수정했습니다.

- `.theme-toggle`, `.color-picker-btn`, `.nav-search-btn` 테두리 → `rgba(255,255,255,0.2)`
- SVG 아이콘 색상 → `#D1D5DB` (밝은 회색)
- hover 시 `var(--primary-blue-light)` 색상 강조
- 컬러 피커 툴팁 배경/화살표 → `#1F2937` (다크 그레이)
- `.lang-switcher`, `.cart-icon-link` 다크모드 가시성 추가
- `.color-dot.active` 다크모드 테두리/그림자 수정

### 3. site.ts 기본 설정 개선

새 사이트 생성 시간을 단축하기 위해 site.ts를 개선했습니다.

- 상단에 **수정 체크리스트** 주석 (8개 필수 + 수정 불필요 항목)
- Books 전용 데이터 → 제네릭 플레이스홀더
- menuItems 최소 구성(홈만) + 드롭다운 예시 주석
- 회사 정보/색상/부모 사이트 = "수정 불필요" 명시
- `.env.example` 실제 Supabase/PortOne 정보 가이드 추가
- `index.html` OG/SEO 메타에 `[수정]` 주석 표시

### 4. OG 이미지 생성 스크립트

`scripts/generate-og-image.mjs` — 소셜 미디어 공유용 OG 이미지(1200x630px) 자동 생성

```bash
# 사전 설치 (1회)
npm i -D sharp

# 이미지 생성
npm run og-image
```

- CONFIG 객체의 `siteName`, `siteNameKo`, `tagline`, `primaryColor`만 수정
- SVG → PNG 변환 (sharp 라이브러리)
- 출력: `public/og-image.png`

### 5. 알림 인프라 (utils/notifications.ts)

모든 DreamIT 사이트에서 공용으로 사용하는 이메일/SMS 발송 유틸리티

```typescript
import { sendEmail, sendSMS, sendBoth } from '../utils/notifications';

// 이메일 (Resend API — noreply@dreamitbiz.com)
await sendEmail({ to: 'user@example.com', subject: '제목', html: '<p>내용</p>' });

// SMS (icode TCP — 90바이트 초과 시 LMS 자동 전환)
await sendSMS({ receiver: '01012345678', message: '안녕하세요' });

// 동시 발송
await sendBoth({ email: {...}, sms: {...} });
```

- `buildEmailHtml()` 브랜드 이메일 템플릿 헬퍼
- Supabase Edge Functions 호출 (별도 백엔드 불필요)

---

## 프로젝트 구조

```
templete-ref/
├── public/           CNAME, favicon.svg, og-image.png, robots.txt, 404.html
├── scripts/          generate-og-image.mjs
├── src/
│   ├── config/       site.ts (사이트 설정)
│   ├── components/   Navbar, Footer, AuthGuard, SearchModal, SEOHead 등
│   ├── contexts/     Auth, Cart, Language, Theme, Toast
│   ├── hooks/        useAOS, useMediaQuery, useToast
│   ├── layouts/      PublicLayout.tsx (라우팅)
│   ├── pages/        Home, Login, Register, Cart, Checkout 등
│   ├── styles/       base, navbar, hero, footer, auth, shop, dark-mode, responsive 등
│   ├── types/        TypeScript 타입 정의
│   └── utils/        auth, supabase, notifications, translations
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

## 색상 테마 (5색)

| 이름 | 기본 | 다크 | 밝은 |
|------|------|------|------|
| blue (기본) | `#0046C8` | `#002E8A` | `#4A8FE7` |
| red | `#C8102E` | `#8A001A` | `#E74A5A` |
| green | `#00855A` | `#005C3E` | `#4AE79A` |
| purple | `#8B1AC8` | `#5E008A` | `#B04AE7` |
| orange | `#C87200` | `#8A4E00` | `#E7A04A` |

---

## License / 라이선스

**저작권 (c) 2025-2026 드림아이티비즈(DreamIT Biz). 모든 권리 보유.**

본 소프트웨어는 저작권법 및 지적재산권법에 의해 보호되는 독점 소프트웨어입니다. 본 프로젝트는 소프트웨어 저작권 등록이 완료되어 법적 보호를 받습니다.

- 본 소프트웨어의 무단 복제, 수정, 배포 또는 사용은 엄격히 금지됩니다.
- 저작권자의 사전 서면 허가 없이 본 소프트웨어의 어떠한 부분도 복제하거나 전송할 수 없습니다.
- 본 소프트웨어는 DreamIT Biz(https://www.dreamitbiz.com) 교육 플랫폼의 일부로 제공됩니다.

라이선스 문의: aebon@dreamitbiz.com

---

**Copyright (c) 2025-2026 DreamIT Biz (Ph.D Aebon Lee). All Rights Reserved.**

This software is proprietary and protected under applicable copyright and intellectual property laws. This project has been registered for software copyright protection.

- Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
- No part of this software may be reproduced or transmitted in any form without prior written permission from the copyright holder.
- This software is provided as part of the DreamIT Biz (https://www.dreamitbiz.com) educational platform.

For licensing inquiries, contact: aebon@dreamitbiz.com

---

**Designed & Developed by Ph.D Aebon Lee**

DreamIT Biz | https://www.dreamitbiz.com

