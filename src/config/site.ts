import type { SiteConfig } from '../types';

const site: SiteConfig = {
  id: 'ppt',
  name: 'DreamIT PPT Generator',
  nameKo: '드림아이티 PPT 생성기',
  description: 'AI 기반 프레젠테이션 자동 생성 서비스 - OpenAI/Claude를 활용한 전문 슬라이드 제작',
  url: 'https://ppt.dreamitbiz.com',
  dbPrefix: 'ppt_',

  parentSite: {
    name: 'DreamIT Biz',
    url: 'https://www.dreamitbiz.com'
  },

  brand: {
    parts: [
      { text: 'Dream', className: 'brand-dream' },
      { text: 'IT', className: 'brand-it' },
      { text: 'PPT', className: 'brand-biz' }
    ]
  },

  themeColor: '#0046C8',

  company: {
    name: '드림아이티비즈(DreamIT Biz)',
    ceo: '이애본',
    bizNumber: '601-45-20154',
    salesNumber: '제2024-수원팔달-0584호',
    publisherNumber: '제2026-000026호',
    address: '경기도 수원시 팔달구 매산로 45, 419호',
    email: 'aebon@dreamitbiz.com',
    phone: '010-3700-0629',
    kakao: 'aebon',
    businessHours: '평일: 09:00 ~ 18:00',
  },

  features: {
    shop: true,
    community: false,
    search: false,
    auth: true,
    license: false,
  },

  colors: [
    { name: 'blue', color: '#0046C8' },
    { name: 'red', color: '#C8102E' },
    { name: 'green', color: '#00855A' },
    { name: 'purple', color: '#8B1AC8' },
    { name: 'orange', color: '#C87200' },
  ],

  menuItems: [
    { path: '/', labelKey: 'nav.home' },
    { path: '/generate', labelKey: 'site.nav.generate' },
    { path: '/templates', labelKey: 'site.nav.templates' },
    { path: '/my-presentations', labelKey: 'site.nav.myPresentations' },
    { path: '/pricing', labelKey: 'site.nav.pricing' },
  ],

  footerLinks: [
    { path: '/', labelKey: 'nav.home' },
    { path: '/generate', labelKey: 'site.nav.generate' },
    { path: '/pricing', labelKey: 'site.nav.pricing' },
  ],

  familySites: [
    { name: 'DreamIT Biz (본사이트)', url: 'https://www.dreamitbiz.com' },
    { name: 'AHP 연구 플랫폼', url: 'https://ahp-basic.dreamitbiz.com' },
    { name: '핵심역량 자가측정', url: 'https://competency.dreamitbiz.com' },
  ]
};

export default site;
