import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colorSchemes } from '../config/colorSchemes';
import { designTemplates } from '../config/designTemplates';
import { sampleCoverSlide } from '../config/sampleSlides';
import { SlideRenderer } from '../components/slides/SlideRenderer';
import '../styles/home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">AI-Powered Presentation</div>
          <h1 className="hero-title">
            AI로 만드는<br />
            <span className="hero-highlight">전문 프레젠테이션</span>
          </h1>
          <p className="hero-subtitle">
            주제만 입력하면 OpenAI GPT-4o / Claude가<br />
            구조화된 전문 슬라이드를 자동으로 생성합니다
          </p>
          <div className="hero-actions">
            <button className="btn btn-hero-primary" onClick={() => navigate('/generate')}>
              무료로 시작하기
            </button>
            <button className="btn btn-hero-secondary" onClick={() => navigate('/pricing')}>
              요금제 보기
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-number">25</span><span className="stat-label">슬라이드 유형</span></div>
            <div className="stat"><span className="stat-number">12</span><span className="stat-label">디자인 템플릿</span></div>
            <div className="stat"><span className="stat-number">8</span><span className="stat-label">색상 테마</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <h2 className="section-title">왜 GenPPT인가요?</h2>
          <p className="section-subtitle">전문 디자이너 수준의 프레젠테이션을 몇 분 만에</p>
          <div className="features-grid">
            {[
              { icon: 'fa-robot', title: 'AI 자동 생성', desc: 'GPT-4o와 Claude가 주제를 분석하여 구조화된 콘텐츠를 자동 생성합니다.' },
              { icon: 'fa-palette', title: '전문 디자인', desc: '12가지 디자인 템플릿과 8가지 색상 테마로 전문적인 프레젠테이션을 완성합니다.' },
              { icon: 'fa-chart-pie', title: '다양한 슬라이드', desc: '차트, 타임라인, 매트릭스, KPI 대시보드, 조직도 등 25종의 슬라이드 타입을 지원합니다.' },
              { icon: 'fa-file-export', title: '다양한 내보내기', desc: 'HTML(ZIP), PDF, PPTX 3가지 형식으로 내보낼 수 있습니다.' },
              { icon: 'fa-key', title: '유연한 API 사용', desc: '플랫폼 키 또는 직접 API 키를 입력하여 사용할 수 있습니다.' },
              { icon: 'fa-coins', title: '합리적 가격', desc: '5,900원부터 토큰을 충전하여 플랫폼 API 키로 전문 프레젠테이션을 생성할 수 있습니다.' },
            ].map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"><i className={`fa-solid ${feat.icon}`} /></div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-section">
        <div className="container">
          <h2 className="section-title">사용 방법</h2>
          <p className="section-subtitle">3단계로 간단하게</p>
          <div className="steps-grid">
            {[
              { num: '01', title: '주제 입력', desc: '프레젠테이션 주제와 세부 설정을 입력합니다.' },
              { num: '02', title: 'AI 생성', desc: 'AI가 구조화된 콘텐츠를 자동으로 생성합니다.' },
              { num: '03', title: '미리보기 & 내보내기', desc: '결과를 확인하고 원하는 형식으로 다운로드합니다.' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color themes preview */}
      <section className="section themes-section">
        <div className="container">
          <h2 className="section-title">8가지 색상 테마</h2>
          <p className="section-subtitle">프레젠테이션의 분위기에 맞는 테마를 선택하세요</p>
          <div className="themes-grid">
            {colorSchemes.map(cs => (
              <div key={cs.id} className="theme-card">
                <div className="theme-preview">
                  <div className="theme-primary" style={{ background: cs.primary }}>
                    <span className="theme-accent-bar" style={{ background: cs.accent }} />
                  </div>
                  <div className="theme-colors">
                    <span style={{ background: cs.primary }} />
                    <span style={{ background: cs.accent }} />
                    <span style={{ background: cs.accent2 }} />
                    <span style={{ background: cs.background }} />
                  </div>
                </div>
                <div className="theme-name">{cs.nameKo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Templates Preview */}
      <section className="section templates-preview-section">
        <div className="container">
          <h2 className="section-title">12가지 디자인 템플릿</h2>
          <p className="section-subtitle">프레젠테이션 목적에 맞는 디자인 스타일을 선택하세요</p>
          <div className="templates-preview-grid">
            {designTemplates.slice(0, 4).map(dt => (
              <div key={dt.id} className="template-preview-card" onClick={() => navigate(`/generate?template=${dt.id}`)}>
                <div className="template-preview-slide">
                  <div style={{ width: 119, height: 168.4, overflow: 'hidden', position: 'relative' }}>
                    <SlideRenderer
                      slide={sampleCoverSlide}
                      colorScheme={colorSchemes[0]}
                      width={595}
                      height={842}
                      scale={0.2}
                      designTemplateId={dt.id}
                    />
                  </div>
                </div>
                <div className="template-preview-name">{dt.nameKo}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="btn btn-hero-secondary" onClick={() => navigate('/templates')}>
              전체 템플릿 보기
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <h2 className="cta-title">지금 바로 시작하세요</h2>
          <p className="cta-desc">무료 회원은 본인의 API 키로 프레젠테이션을 생성할 수 있습니다</p>
          <button className="btn btn-hero-primary" onClick={() => navigate('/generate')}>
            무료로 시작하기
          </button>
        </div>
      </section>
    </>
  );
};

export default Home;
