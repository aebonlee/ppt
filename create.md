# 새 사이트 생성 프롬프트 템플릿

아래 `[ ]` 부분을 채워서 Claude에게 전달하면 됩니다.

---

## 프롬프트

```
templete-ref 템플릿 기반으로 새 사이트를 생성해줘.

## 기본 정보
- 사이트 폴더명: [예: coding]
- GitHub 리포지토리: https://github.com/aebonlee/[리포명]
- 도메인: https://[사이트명].dreamitbiz.com
- Supabase 테이블 프리픽스: [예: coding_]

## 사이트 설정 (config/site.ts)
- id: '[폴더명]'
- name: '[영문 사이트명, 예: DreamIT Coding]'
- nameKo: '[한글 사이트명, 예: 드림아이티 코딩]'
- description: '[사이트 설명]'
- themeColor: '[예: #0046C8]'
- brand parts: [예: Dream / IT / Coding]

## 기능 토글
- shop: [true/false]
- community: [true/false]
- search: [true/false]
- auth: [true/false]
- license: [true/false]

## 메뉴 구성
[예:
- 홈 (/)
- 강좌 (/courses)
  - Python (/courses/python)
  - JavaScript (/courses/javascript)
- 커뮤니티 (/community)
]

## 사이트 전용 페이지
[예:
- /courses → 강좌 목록 페이지
- /courses/:category → 카테고리별 강좌
]

## 번역 키 (site 섹션)
[예:
- site.nav.courses: 강좌 / Courses
- site.nav.python: Python / Python
- site.home.title: DreamIT Coding / DreamIT Coding
- site.home.subtitle: 코딩 교육 플랫폼 / Coding Education Platform
]

## 작업 순서
1. D:\dreamit-web\templete-ref 폴더를 D:\dreamit-web\[폴더명]으로 복사
2. config/site.ts 수정 (위 설정 반영)
3. package.json name 변경
4. vite.config.ts base 경로 설정 (base: '/')
5. translations.ts의 site 섹션 수정
6. 사이트 전용 페이지 생성 + PublicLayout.tsx에 라우트 추가
7. .env 파일 생성 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
8. git init → remote 연결 → 커밋 & 푸시
9. npm run build && npx gh-pages -d dist 배포

## 참고
- 템플릿 소스: D:\dreamit-web\templete-ref
- 리포지토리: https://github.com/aebonlee/templete
- Supabase: hcmgdztsgjvzcyxyayaj.supabase.co
- .env 값은 기존 사이트에서 복사 (예: D:\dreamit-web\books\.env)
```

---

## 사용 예시

```
templete-ref 템플릿 기반으로 새 사이트를 생성해줘.

## 기본 정보
- 사이트 폴더명: coding
- GitHub 리포지토리: https://github.com/aebonlee/coding
- 도메인: https://coding.dreamitbiz.com
- Supabase 테이블 프리픽스: coding_

## 사이트 설정 (config/site.ts)
- id: 'coding'
- name: 'DreamIT Coding'
- nameKo: '드림아이티 코딩'
- description: '프로그래밍 학습 플랫폼 - Python, JavaScript, React'
- themeColor: '#00855A'
- brand parts: Dream / IT / Coding

## 기능 토글
- shop: false
- community: true
- search: true
- auth: true
- license: false

## 메뉴 구성
- 홈 (/)
- 강좌 (/courses)
  - Python (/courses/python)
  - JavaScript (/courses/javascript)
  - React (/courses/react)
- 커뮤니티 (/community)

## 사이트 전용 페이지
- /courses → 강좌 목록 페이지
- /courses/:category → 카테고리별 강좌

## 번역 키 (site 섹션)
- site.nav.courses: 강좌 / Courses
- site.nav.python: Python / Python
- site.nav.javascript: JavaScript / JavaScript
- site.nav.react: React / React
- site.home.title: DreamIT Coding / DreamIT Coding
- site.home.subtitle: 실전 프로그래밍 학습 / Practical Programming Learning

## 작업 순서
1~9 전체 수행, 빌드 & 배포까지 완료해줘.

## 참고
- 템플릿 소스: D:\dreamit-web\templete-ref
- .env 값은 D:\dreamit-web\books\.env 에서 복사
```
