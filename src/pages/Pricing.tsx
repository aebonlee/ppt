import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import { requestPayment } from '../utils/portone';
import { createOrder, updateOrderStatus, verifyPayment } from '../utils/supabase';
import { createSubscription } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { PLAN_CONFIGS } from '../types';
import '../styles/pricing.css';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: SubscriptionPlan;
  name: string;
  nameKo: string;
  price: string;
  priceNum: number;
  priceNote: string;
  tokenInfo?: string;
  slideEstimate?: string;
  features: PlanFeature[];
  buttonText: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    nameKo: '무료',
    price: '\u20a90',
    priceNum: 0,
    priceNote: '영구 무료',
    features: [
      { text: '최대 10슬라이드', included: true },
      { text: '사용자 API 키만 사용', included: true },
      { text: 'HTML(ZIP) 내보내기', included: true },
      { text: 'PDF 내보내기', included: true },
      { text: '플랫폼 API 키 사용', included: false },
      { text: 'PPTX 내보내기', included: false },
    ],
    buttonText: '무료로 시작',
  },
  {
    id: 'basic',
    name: 'Basic',
    nameKo: '베이직',
    price: '\u20a99,900',
    priceNum: 9900,
    priceNote: '월',
    tokenInfo: '830,000 토큰 / 월',
    slideEstimate: '약 830장 슬라이드 (GPT-4o 기준)',
    features: [
      { text: '830,000 토큰 / 월', included: true },
      { text: '최대 30슬라이드', included: true },
      { text: '플랫폼 API 키 사용', included: true },
      { text: 'HTML(ZIP) 내보내기', included: true },
      { text: 'PDF 내보내기', included: true },
      { text: '사용자 API 키 사용', included: true },
      { text: 'PPTX 내보내기', included: false },
    ],
    buttonText: '구독하기',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameKo: '프로',
    price: '\u20a929,900',
    priceNum: 29900,
    priceNote: '월',
    tokenInfo: '2,500,000 토큰 / 월',
    slideEstimate: '약 2,500장 슬라이드 (GPT-4o 기준)',
    features: [
      { text: '2,500,000 토큰 / 월', included: true },
      { text: '최대 50슬라이드', included: true },
      { text: '플랫폼 API 키 사용', included: true },
      { text: 'HTML(ZIP) 내보내기', included: true },
      { text: 'PDF 내보내기', included: true },
      { text: '사용자 API 키 사용', included: true },
      { text: 'PPTX 내보내기', included: true },
    ],
    buttonText: '구독하기',
  },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { subscription, plan: currentPlan, refreshSubscription } = useSubscription();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === 'free') {
      navigate('/generate');
      return;
    }

    if (!user) {
      showToast('로그인이 필요합니다.', 'warning');
      navigate('/login');
      return;
    }

    // 이미 같은 플랜 구독 중
    if (subscription && currentPlan === plan.id) {
      showToast('이미 해당 플랜을 구독 중입니다.', 'info');
      return;
    }

    setProcessing(plan.id);

    try {
      const orderNumber = `SUB-${plan.id.toUpperCase()}-${Date.now()}`;

      // 1. 주문 생성
      await createOrder({
        order_number: orderNumber,
        user_email: user.email || '',
        user_name: profile?.display_name || user.email || '',
        user_phone: '',
        total_amount: plan.priceNum,
        payment_method: 'CARD',
        items: [{
          product_title: `GenPPT ${plan.nameKo} 구독 (30일)`,
          quantity: 1,
          unit_price: plan.priceNum,
          subtotal: plan.priceNum,
        }],
      });

      // 2. 결제 요청
      const result = await requestPayment({
        orderId: orderNumber,
        orderName: `GenPPT ${plan.nameKo} 구독 (30일)`,
        totalAmount: plan.priceNum,
        payMethod: 'CARD',
        customer: {
          email: user.email || '',
          fullName: profile?.display_name || '',
          phoneNumber: '',
        },
      });

      // 결제 실패/취소
      if ('code' in result) {
        await updateOrderStatus(orderNumber, 'cancelled', undefined, result.message);
        if (result.code !== 'PAYMENT_FAILED') {
          showToast(result.message || '결제가 취소되었습니다.', 'warning');
        }
        return;
      }

      // 3. 결제 검증
      await verifyPayment(result.paymentId, orderNumber);
      await updateOrderStatus(orderNumber, 'paid', result.paymentId);

      // 4. 구독 생성
      await createSubscription(plan.id as 'basic' | 'pro', orderNumber, result.paymentId);

      // 5. 구독 상태 갱신
      await refreshSubscription();

      showToast(`${plan.nameKo} 플랜 구독이 시작되었습니다!`, 'success');
    } catch (err: any) {
      console.error('Subscription error:', err);
      showToast(err.message || '구독 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">요금제</h1>
          <p className="page-description">필요에 맞는 플랜을 선택하세요</p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 40px' }}>
        {/* 현재 구독 배너 */}
        {subscription && (
          <div className="subscription-banner" style={{
            background: 'var(--primary-gradient, linear-gradient(135deg, #0046C8, #4A8FE7))',
            color: '#fff',
            padding: '20px 28px',
            borderRadius: 12,
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <strong style={{ fontSize: 16 }}>
                현재 플랜: {PLAN_CONFIGS[currentPlan].price > 0 ? currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) : 'Free'}
              </strong>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                만료일: {formatDate(subscription.expiresAt)} | 잔여 토큰: {subscription.tokensRemaining.toLocaleString()} / {subscription.tokenLimit.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
            }}>
              구독 중
            </div>
          </div>
        )}

        <div className="pricing-grid">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id && (plan.id === 'free' || !!subscription);
            return (
              <div key={plan.name} className={`pricing-card ${plan.highlighted ? 'highlighted' : ''} ${isCurrent ? 'current-plan' : ''}`}>
                {plan.highlighted && <div className="pricing-badge">인기</div>}
                {isCurrent && plan.id !== 'free' && <div className="pricing-badge" style={{ background: '#059669' }}>현재 플랜</div>}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.nameKo}</h3>
                  <div className="plan-price">{plan.price}</div>
                  <div className="plan-note">/ {plan.priceNote}</div>
                  {plan.slideEstimate && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                      {plan.slideEstimate}
                    </div>
                  )}
                </div>
                <ul className="plan-features">
                  {plan.features.map((feat, i) => (
                    <li key={i} className={feat.included ? 'included' : 'excluded'}>
                      <span className="feature-check">{feat.included ? '\u2713' : '\u00d7'}</span>
                      {feat.text}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'} pricing-btn`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={processing === plan.id || (!!isCurrent && plan.id !== 'free')}
                >
                  {processing === plan.id
                    ? '처리 중...'
                    : isCurrent && plan.id !== 'free'
                      ? '구독 중'
                      : plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pricing-faq">
          <h2 className="section-title">자주 묻는 질문</h2>
          <div className="faq-grid">
            {[
              { q: '무료 플랜으로도 사용할 수 있나요?', a: '네, 무료 플랜에서는 사용자 본인의 API 키를 사용하여 프레젠테이션을 생성할 수 있습니다.' },
              { q: '토큰이란 무엇인가요?', a: 'AI가 텍스트를 처리할 때 사용하는 단위입니다. 슬라이드 1장 생성 시 GPT-4o는 1,000토큰, Claude는 1,500토큰이 차감됩니다.' },
              { q: 'API 키는 어떻게 얻나요?', a: 'OpenAI(platform.openai.com) 또는 Anthropic(console.anthropic.com)에서 API 키를 발급받을 수 있습니다.' },
              { q: '환불 정책은 어떻게 되나요?', a: '결제 후 7일 이내에 환불 요청이 가능합니다. 단, 이미 사용한 토큰에 대해서는 차감됩니다.' },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h4 className="faq-question">{faq.q}</h4>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
