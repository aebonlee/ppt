/**
 * Subscription Service
 * 구독 CRUD, 토큰 체크/차감 관리
 */
import getSupabase, { TABLES } from '../utils/supabase';
import type { UserSubscription, SubscriptionPlan } from '../types';
import { PLAN_CONFIGS, TOKEN_COST } from '../types';

/**
 * 활성 구독 조회 — active + expires_at > now()
 * 만료된 구독이 있으면 자동으로 expired 처리
 */
export async function getActiveSubscription(): Promise<UserSubscription | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    const { data, error } = await client
      .from(TABLES.subscriptions)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('purchased_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;

    const sub = data[0];

    // 만료 체크
    if (new Date(sub.expires_at) < new Date()) {
      // 자동 만료 처리
      await client
        .from(TABLES.subscriptions)
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', sub.id);
      return null;
    }

    return {
      id: sub.id,
      userId: sub.user_id,
      plan: sub.plan as SubscriptionPlan,
      tokenLimit: sub.token_limit,
      tokensUsed: sub.tokens_used,
      tokensRemaining: sub.token_limit - sub.tokens_used,
      status: sub.status,
      orderNumber: sub.order_number,
      purchasedAt: sub.purchased_at,
      expiresAt: sub.expires_at,
    };
  } catch {
    return null;
  }
}

/**
 * 예상 토큰 비용 계산
 */
export function estimateTokenCost(
  engine: 'openai' | 'claude',
  slideCount: number,
  action: 'generate' | 'chat_edit' = 'generate'
): number {
  const cost = TOKEN_COST[engine];
  return action === 'generate'
    ? cost.perSlide * slideCount
    : cost.perChatEdit * slideCount;
}

/**
 * 생성 가능 여부 확인
 * 구독 토큰 우선 → 구독 없으면 쿠폰 토큰 체크
 */
export async function canGenerate(
  engine: 'openai' | 'claude',
  slideCount: number
): Promise<{ allowed: boolean; required: number; remaining: number; source: 'subscription' | 'coupon' | 'none' }> {
  const required = estimateTokenCost(engine, slideCount);

  // 1. 구독 토큰 체크
  const sub = await getActiveSubscription();
  if (sub && sub.tokensRemaining >= required) {
    return { allowed: true, required, remaining: sub.tokensRemaining, source: 'subscription' };
  }

  // 2. 쿠폰 토큰 체크 (구독이 없거나 잔여 부족 시)
  try {
    const { canGenerateWithCoupon } = await import('./couponService');
    const couponCheck = await canGenerateWithCoupon(engine, slideCount);
    if (couponCheck.allowed) {
      return { allowed: true, required, remaining: couponCheck.remaining, source: 'coupon' };
    }

    // 둘 다 부족
    const totalRemaining = (sub?.tokensRemaining || 0) + couponCheck.remaining;
    return { allowed: false, required, remaining: totalRemaining, source: 'none' };
  } catch {
    // 쿠폰 서비스 로드 실패 시 구독만으로 판단
    return { allowed: false, required, remaining: sub?.tokensRemaining || 0, source: 'none' };
  }
}

/**
 * 토큰 차감 + 사용 로그 기록
 * source를 지정하면 해당 소스에서 차감 (구독 or 쿠폰)
 * source 미지정 시 자동 판별
 */
export async function deductTokens(
  action: 'generate' | 'chat_edit',
  engine: 'openai' | 'claude',
  slideCount: number,
  presentationId?: string
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;

    const tokensToDeduct = estimateTokenCost(engine, slideCount, action);

    // 구독 우선 차감 시도
    const sub = await getActiveSubscription();
    if (sub && sub.tokensRemaining >= tokensToDeduct) {
      // 구독에서 차감
      const { error: updateError } = await client
        .from(TABLES.subscriptions)
        .update({
          tokens_used: sub.tokensUsed + tokensToDeduct,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);

      if (updateError) {
        console.error('Token deduction failed:', updateError);
        return false;
      }

      // 사용 로그 기록
      try {
        await client
          .from(TABLES.token_usage)
          .insert({
            user_id: user.id,
            subscription_id: sub.id,
            action,
            engine,
            slide_count: slideCount,
            tokens_deducted: tokensToDeduct,
            presentation_id: presentationId || null,
            source: 'subscription',
          });
      } catch { /* 로그 실패 무시 */ }

      return true;
    }

    // 쿠폰 토큰에서 차감
    try {
      const { deductCouponTokens } = await import('./couponService');
      return await deductCouponTokens(action, engine, slideCount, presentationId);
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * 내 토큰 사용 내역 조회 (최근 20건)
 */
export interface TokenUsageRecord {
  id: string;
  action: 'generate' | 'chat_edit';
  engine: 'openai' | 'claude';
  slideCount: number;
  tokensDeducted: number;
  source: 'subscription' | 'coupon';
  createdAt: string;
}

export async function getMyTokenUsage(limit = 20): Promise<TokenUsageRecord[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return [];

    const { data, error } = await client
      .from(TABLES.token_usage)
      .select('id, action, engine, slide_count, tokens_deducted, source, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      action: row.action,
      engine: row.engine,
      slideCount: row.slide_count,
      tokensDeducted: row.tokens_deducted,
      source: row.source || 'subscription',
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * 새 구독 생성
 * 기존 active 구독이 있으면 만료 처리 후 신규 생성
 */
export async function createSubscription(
  plan: 'starter' | 'basic' | 'pro',
  orderNumber: string,
  paymentId: string
): Promise<UserSubscription | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const config = PLAN_CONFIGS[plan];

  // 기존 active 구독 만료 처리
  await client
    .from(TABLES.subscriptions)
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // 신규 구독 생성 (토큰 소진 시까지 유효 — 만료일 10년 후)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);

  const { data, error } = await client
    .from(TABLES.subscriptions)
    .insert({
      user_id: user.id,
      plan,
      token_limit: config.tokenLimit,
      tokens_used: 0,
      status: 'active',
      order_number: orderNumber,
      portone_payment_id: paymentId,
      purchased_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Subscription creation failed:', error);
    throw new Error('구독 생성 실패: ' + error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    plan: data.plan,
    tokenLimit: data.token_limit,
    tokensUsed: 0,
    tokensRemaining: data.token_limit,
    status: 'active',
    orderNumber: data.order_number,
    purchasedAt: data.purchased_at,
    expiresAt: data.expires_at,
  };
}
