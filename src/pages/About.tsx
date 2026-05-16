import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { ReactElement } from 'react';
import '../styles/about.css';

const NAV_ITEMS = [
  { id: 'intro', label: '서비스 소개', icon: 'fa-circle-info' },
  { id: 'features', label: '핵심 기능', icon: 'fa-star' },
  { id: 'howto', label: '사용 방법', icon: 'fa-list-ol' },
  { id: 'slides', label: '슬라이드 유형', icon: 'fa-layer-group' },
  { id: 'engines', label: 'AI 엔진', icon: 'fa-microchip' },
  { id: 'pricing', label: '요금제', icon: 'fa-tag' },
  { id: 'faq', label: 'FAQ', icon: 'fa-circle-question' },
];

export default function About(): ReactElement {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
      const scrollY = window.scrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollY) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEOHead
        title="서비스 소개 | GenPPT"
        description="GenPPT는 AI 기반 프레젠테이션 자동 생성 서비스입니다. OpenAI GPT-4o와 Claude를 활용하여 전문적인 슬라이드를 자동으로 제작합니다."
      />

      {/* Hero (compact) */}
      <section className="about-hero">
        <div className="container about-hero-content">
          <div className="about-hero-badge">AI-Powered Presentation Generator</div>
          <h1 className="about-hero-title">
            주제만 입력하면,<br />
            <span className="about-hero-highlight">AI가 프레젠테이션을 완성합니다</span>
          </h1>
          <p className="about-hero-desc">
            GenPPT는 OpenAI GPT-4o와 Anthropic Claude를 활용하여<br />
            전문적인 프레젠테이션 슬라이드를 자동으로 생성하는 서비스입니다.
          </p>
          <div className="about-hero-actions">
            <button className="btn btn-hero-primary" onClick={() => navigate('/generate')}>
              지금 바로 만들어보기
            </button>
            <button className="btn btn-hero-secondary" onClick={() => navigate('/pricing')}>
              요금제 보기
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar + Content Layout */}
      <div className="about-layout">
        {/* Left Sidebar Navigation */}
        <aside className="about-sidebar">
          <nav className="about-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`about-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollTo(item.id)}
              >
                <i className={`fa-solid ${item.icon}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="about-content">

          {/* 서비스 소개 */}
          <section id="intro" className="about-block">
            <h2><i className="fa-solid fa-circle-info" /> GenPPT란?</h2>
            <div className="about-intro-text">
              <p>
                GenPPT는 <strong>AI 기반 프레젠테이션 자동 생성 서비스</strong>입니다.
                발표 주제와 원하는 설정을 입력하기만 하면, AI가 내용 구성부터 디자인까지
                전문적인 슬라이드를 자동으로 만들어 드립니다.
              </p>
              <p>
                보고서, 제안서, 교육자료, 연구발표 등 어떤 주제든 상관없습니다.
                AI가 주제를 분석하고, 논리적인 흐름으로 구조화된 콘텐츠를 생성하며,
                전문 디자인 템플릿에 맞춰 완성도 높은 프레젠테이션을 제작합니다.
              </p>
            </div>
            <div className="about-intro-stats">
              <div className="about-intro-stat">
                <strong>25종</strong>
                <span>슬라이드 유형</span>
              </div>
              <div className="about-intro-stat">
                <strong>12+</strong>
                <span>디자인 템플릿</span>
              </div>
              <div className="about-intro-stat">
                <strong>8가지</strong>
                <span>색상 테마</span>
              </div>
              <div className="about-intro-stat">
                <strong>3종</strong>
                <span>내보내기 형식</span>
              </div>
            </div>
          </section>

          {/* 핵심 기능 */}
          <section id="features" className="about-block">
            <h2><i className="fa-solid fa-star" /> 핵심 기능</h2>
            <div className="about-features-grid">
              {[
                { icon: 'fa-wand-magic-sparkles', color: '#0046C8', title: 'AI 자동 생성', desc: '주제만 입력하면 AI가 내용을 분석하고 구조화된 슬라이드를 자동 생성합니다. OpenAI GPT-4o와 Anthropic Claude 중 선택 가능합니다.' },
                { icon: 'fa-palette', color: '#8B1AC8', title: '전문 디자인 템플릿', desc: '모던 기업, 미니멀 클린, 볼드 그라디언트 등 12가지 이상의 전문 디자인 템플릿을 제공합니다.' },
                { icon: 'fa-chart-pie', color: '#00855A', title: '25종 슬라이드 유형', desc: '표지, 목차, 차트(5종), 매트릭스(4종), 타임라인, 조직도, 프로세스 플로우, KPI 대시보드 등을 지원합니다.' },
                { icon: 'fa-comments', color: '#C87200', title: 'AI 대화형 편집', desc: '생성된 슬라이드를 AI와 대화하며 수정할 수 있습니다. 자연어 명령으로 편집합니다.' },
                { icon: 'fa-swatchbook', color: '#C8102E', title: '8가지 색상 테마', desc: '오션 블루, 포레스트 그린, 선셋 오렌지, 로얄 퍼플 등 다양한 색상 테마를 제공합니다.' },
                { icon: 'fa-file-export', color: '#0046C8', title: '다양한 내보내기', desc: 'HTML(ZIP), PDF, PPTX 3가지 형식으로 내보낼 수 있습니다.' },
              ].map((feat, i) => (
                <div key={i} className="about-feature-card">
                  <div className="about-feature-icon" style={{ background: feat.color }}>
                    <i className={`fa-solid ${feat.icon}`} />
                  </div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 사용 방법 */}
          <section id="howto" className="about-block">
            <h2><i className="fa-solid fa-list-ol" /> 사용 방법</h2>
            <div className="about-steps">
              {[
                { num: '01', icon: 'fa-keyboard', title: '주제 입력', desc: '프레젠테이션 주제를 입력하고, 슬라이드 수, 방향(세로/가로), 디자인 템플릿, 색상 테마, AI 엔진을 선택합니다.', details: ['주제를 구체적으로 입력할수록 정확한 결과물', '참고 자료(PDF, PPTX, TXT 등) 첨부 가능', '추가 지시사항으로 세부 요구사항 전달'] },
                { num: '02', icon: 'fa-microchip', title: 'AI 자동 생성', desc: 'AI가 주제를 분석하여 논리적인 흐름의 구조화된 콘텐츠를 생성합니다.', details: ['GPT-4o: 빠른 생성 속도, 다양한 주제', 'Claude: 깊이 있는 분석, 논리적 구조화', '실시간 진행 상태 표시'] },
                { num: '03', icon: 'fa-download', title: '미리보기 & 내보내기', desc: '생성된 프레젠테이션을 미리보고, AI 편집으로 수정한 뒤 다운로드합니다.', details: ['HTML(ZIP): 웹 브라우저에서 바로 실행', 'PDF: 인쇄 및 배포에 최적화', 'PPTX: PowerPoint에서 추가 편집 가능'] },
              ].map((step, i) => (
                <div key={i} className="about-step">
                  <div className="about-step-num">{step.num}</div>
                  <div className="about-step-content">
                    <div className="about-step-header">
                      <i className={`fa-solid ${step.icon}`} />
                      <h3>{step.title}</h3>
                    </div>
                    <p className="about-step-desc">{step.desc}</p>
                    <ul className="about-step-details">
                      {step.details.map((d, j) => <li key={j}>{d}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 슬라이드 유형 */}
          <section id="slides" className="about-block">
            <h2><i className="fa-solid fa-layer-group" /> 지원하는 슬라이드 유형</h2>
            <div className="about-slide-types">
              {[
                { category: '기본 슬라이드', items: ['표지 (Cover)', '목차 (TOC)', '섹션 표지', '콘텐츠', '요약 (Summary)', '마지막 페이지'] },
                { category: '차트 (5종)', items: ['컬럼 차트', '라인 차트', '파이 차트', '버블 차트', 'KPI 대시보드'] },
                { category: '매트릭스 (4종)', items: ['비교 테이블', 'BCG 매트릭스', '우선순위 매트릭스', '평가 테이블'] },
                { category: '구조도 (4종)', items: ['조직도', '타임라인', '로드맵', '프로세스 플로우'] },
                { category: '특수 슬라이드', items: ['인용구 (Quote)', '2단 / 3단 레이아웃', '통계 카드', '워크북 / 실습'] },
              ].map((group, i) => (
                <div key={i} className="about-type-group">
                  <h4>{group.category}</h4>
                  <ul>
                    {group.items.map((item, j) => <li key={j}><i className="fa-solid fa-check" />{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* AI 엔진 */}
          <section id="engines" className="about-block">
            <h2><i className="fa-solid fa-microchip" /> AI 엔진 선택</h2>
            <div className="about-engines">
              <div className="about-engine-card">
                <div className="about-engine-logo" style={{ background: '#10a37f' }}>
                  <i className="fa-solid fa-robot" />
                </div>
                <h3>OpenAI GPT-4o</h3>
                <p className="about-engine-desc">빠르고 다양한 주제에 강한 범용 AI 엔진</p>
                <ul>
                  <li><i className="fa-solid fa-bolt" /> 빠른 생성 속도</li>
                  <li><i className="fa-solid fa-globe" /> 폭넓은 주제 대응</li>
                  <li><i className="fa-solid fa-coins" /> 1장당 약 1,000 토큰</li>
                </ul>
              </div>
              <div className="about-engine-card">
                <div className="about-engine-logo" style={{ background: '#d97706' }}>
                  <i className="fa-solid fa-brain" />
                </div>
                <h3>Anthropic Claude</h3>
                <p className="about-engine-desc">깊이 있는 분석과 논리적 구조화에 강한 AI 엔진</p>
                <ul>
                  <li><i className="fa-solid fa-magnifying-glass-chart" /> 심층 분석 능력</li>
                  <li><i className="fa-solid fa-sitemap" /> 논리적 구조화</li>
                  <li><i className="fa-solid fa-coins" /> 1장당 약 1,500 토큰</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 요금제 */}
          <section id="pricing" className="about-block">
            <h2><i className="fa-solid fa-tag" /> 요금제 안내</h2>
            <div className="about-plans">
              {[
                { name: '무료', price: '₩0', period: '영구 무료', tokens: '-', slides: '자체 API 키 사용', highlight: false, badge: '' },
                { name: '스타터', price: '₩5,900', period: '/1회', tokens: '150,000 토큰', slides: '약 150장 분량', highlight: false, badge: '' },
                { name: '베이직', price: '₩14,900', period: '/1회', tokens: '400,000 토큰', slides: '약 400장 분량', highlight: true, badge: '인기' },
                { name: '프로', price: '₩29,900', period: '/1회', tokens: '800,000 토큰', slides: '약 800장 분량', highlight: false, badge: '' },
              ].map((plan, i) => (
                <div key={i} className={`about-plan-card ${plan.highlight ? 'highlighted' : ''}`}>
                  {plan.badge && <div className="about-plan-badge">{plan.badge}</div>}
                  <h4>{plan.name}</h4>
                  <div className="about-plan-price">{plan.price}<span>{plan.period}</span></div>
                  <div className="about-plan-info">
                    <div><i className="fa-solid fa-coins" /> {plan.tokens}</div>
                    <div><i className="fa-solid fa-file-powerpoint" /> {plan.slides}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={() => navigate('/pricing')} style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}>
                요금제 상세 보기
              </button>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="about-block">
            <h2><i className="fa-solid fa-circle-question" /> 자주 묻는 질문</h2>
            <div className="about-faq">
              {[
                { q: 'GenPPT는 어떤 서비스인가요?', a: 'AI를 활용하여 프레젠테이션 슬라이드를 자동으로 생성하는 웹 서비스입니다. 발표 주제를 입력하면 AI가 구조화된 콘텐츠와 전문 디자인의 슬라이드를 만들어 드립니다.' },
                { q: 'API 키가 꼭 필요한가요?', a: '무료 플랜에서는 사용자 본인의 API 키가 필요합니다. 유료 플랜(스타터 이상)에서는 플랫폼 제공 API 키를 사용할 수 있어 별도 키 없이도 생성 가능합니다.' },
                { q: '토큰은 무엇인가요?', a: 'AI가 텍스트를 처리할 때 사용하는 내부 단위입니다. 슬라이드 1장 생성 시 GPT-4o는 약 1,000 토큰, Claude는 약 1,500 토큰이 차감됩니다.' },
                { q: '생성된 슬라이드를 수정할 수 있나요?', a: 'AI 대화형 편집 기능으로 자유롭게 수정할 수 있습니다. "이 부분을 더 자세하게 작성해줘" 등 자연어로 편집을 요청합니다.' },
                { q: '어떤 형식으로 내보낼 수 있나요?', a: 'HTML(ZIP), PDF, PPTX 3가지 형식을 지원합니다. PPTX는 베이직 이상 플랜에서 사용 가능합니다.' },
                { q: '참고 자료를 첨부할 수 있나요?', a: 'PPTX, PDF, TXT, MD, DOCX, XLSX 파일을 첨부할 수 있습니다(최대 50MB). AI가 내용을 분석하여 맞춤 프레젠테이션을 생성합니다.' },
              ].map((item, i) => (
                <div key={i} className="about-faq-item">
                  <h4>{item.q}</h4>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="about-block about-block-cta">
            <h3>지금 바로 GenPPT를 경험하세요</h3>
            <p>무료 플랜으로 시작하여 AI 프레젠테이션 생성을 체험해보세요</p>
            <div className="about-cta-actions">
              <button className="btn btn-hero-primary" onClick={() => navigate('/generate')}>무료로 시작하기</button>
              <button className="btn btn-hero-secondary" onClick={() => navigate('/templates')}>템플릿 둘러보기</button>
            </div>
          </section>

          {/* 개발사 */}
          <div className="about-company">
            <p className="about-company-label">DEVELOPED BY</p>
            <p className="about-company-name">드림아이티비즈 (DreamIT Biz)</p>
            <p className="about-company-desc">기업과 개인의 실제 니즈를 반영한 맞춤형 에듀테크 플랫폼</p>
            <div className="about-company-links">
              <a href="mailto:aebon@dreamitbiz.com"><i className="fa-solid fa-envelope" /> aebon@dreamitbiz.com</a>
              <a href="https://www.dreamitbiz.com" target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-globe" /> www.dreamitbiz.com</a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
