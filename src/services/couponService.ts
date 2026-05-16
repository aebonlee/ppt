/**
 * Coupon Service
 * 쿠폰 조회, 유효성 검증, 등록(사용) 및 쿠폰 토큰 잔액 관리
 */
import getSupabase, { TABLES } from '../utils/supabase';
import type { Coupon, CouponBalance } from '../types';

/**
 * 쿠폰 코드 유효성 검증
 * - 존재 여부, 만료, 사용 횟수, 상태 체크
 */
export async function validateCoupon(code: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const client = getSupabase();
  if (!client) return { valid: false, error: 'Supabase가 설정되지 않았습니다.' };

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: '쿠폰 코드를 입력해 주세요.' };

  const { data, error } = await client
    .from(TABLES.coupons)
    .select('*')
    .eq('code', trimmed)
    .limit(1);

  if (error) return { valid: false, error: '쿠폰 조회 중 오류가 발생했습니다.' };
  if (!data || data.length === 0) return { valid: false, error: '존재하지 않는 쿠폰 코드입니다.' };

  const row = data[0];
  const coupon: Coupon = {
    id: row.id,
    code: row.code,
    tokenAmount: row.token_amount,
    maxRedemptions: row.max_redemptions,
    currentRedemptions: row.current_redemptions,
    expiresAt: row.expires_at,
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
  };

  // 상태 체크
  if (coupon.status === 'disabled') return { valid: false, error: '비활성화된 쿠폰입니다.' };
  if (coupon.status === 'expired') return { valid: false, error: '만료된 쿠폰입니다.' };
  if (coupon.status === 'used') return { valid: false, error: '이미 모두 사용된 쿠폰입니다.' };

  // 만료일 체크
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: '유효기간이 만료된 쿠폰입니다.' };
  }

  // 사용 횟수 체크
  if (coupon.currentRedemptions >= coupon.maxRedemptions) {
    return { valid: false, error: '사용 가능 횟수를 초과한 쿠폰입니다.' };
  }

  // 현재 사용자가 이미 사용했는지 체크
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { valid: false, error: '로그인이 필요합니다.' };

  const { data: existing } = await client
    .from(TABLES.coupon_redemptions)
    .select('id')
    .eq('coupon_id', coupon.id)
    .eq('user_id', user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return { valid: false, error: '이미 사용한 쿠폰입니다.' };
  }

  return { valid: true, coupon };
}

/**
 * 쿠폰 등록 (사용)
 * - 유효성 검증 후 토큰 부여
 */
export async function redeemCoupon(code: string): Promise<{ success: boolean; tokensGranted?: number; error?: string }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase가 설정되지 않았습니다.' };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  // 유효성 검증
  const { valid, coupon, error: validError } = await validateCoupon(code);
  if (!valid || !coupon) return { success: false, error: validError };

  // 쿠폰 사용 기록 생성
  const { error: redemptionError } = await client
    .from(TABLES.coupon_redemptions)
    .insert({
      coupon_id: coupon.id,
      user_id: user.id,
      tokens_granted: coupon.tokenAmount,
      redeemed_at: new Date().toISOString(),
    });

  if (redemptionError) {
    return { success: false, error: '쿠폰 등록 중 오류가 발생했습니다.' };
  }

  // 쿠폰 사용 횟수 증가
  const newRedemptions = coupon.currentRedemptions + 1;
  const updateData: Record<string, unknown> = {
    current_redemptions: newRedemptions,
  };
  // 최대 사용 횟수에 도달하면 상태 변경
  if (newRedemptions >= coupon.maxRedemptions) {
    updateData.status = 'used';
  }

  await client
    .from(TABLES.coupons)
    .update(updateData)
    .eq('id', coupon.id);

  return { success: true, tokensGranted: coupon.tokenAmount };
}

/**
 * 현재 사용자의 쿠폰 토큰 잔액 조회
 * 부여 받은 총 토큰 - 사용한 토큰
 */
export async function getCouponBalance(): Promise<CouponBalance> {
  const client = getSupabase();
  if (!client) return { totalGranted: 0, totalUsed: 0, remaining: 0 };

  const { data: { user } } = await client.auth.getUser();
  if (!user) return { totalGranted: 0, totalUsed: 0, remaining: 0 };

  // 총 부여 토큰
  const { data: redemptions } = await client
    .from(TABLES.coupon_redemptions)
    .select('tokens_granted')
    .eq('user_id', user.id);

  const totalGranted = (redemptions || []).reduce((sum, r) => sum + (r.tokens_granted || 0), 0);

  // 쿠폰에서 사용한 토큰 (token_usage에서 source='coupon'으로 기록된 것)
  const { data: usageData } = await client
    .from(TABLES.token_usage)
    .select('tokens_deducted')
    .eq('user_id', user.id)
    .eq('source', 'coupon');

  const totalUsed = (usageData || []).reduce((sum, r) => sum + (r.tokens_deducted || 0), 0);

  return {
    totalGranted,
    totalUsed,
    remaining: Math.max(0, totalGranted - totalUsed),
  };
}

/**
 * 쿠폰 토큰으로 생성 가능 여부 확인
 */
export async function canGenerateWithCoupon(
  engine: 'openai' | 'claude',
  slideCount: number
): Promise<{ allowed: boolean; required: number; remaining: number }> {
  const { TOKEN_COST } = await import('../types');
  const required = engine === 'openai'
    ? TOKEN_COST.openai.perSlide * slideCount
    : TOKEN_COST.claude.perSlide * slideCount;

  const balance = await getCouponBalance();

  return {
    allowed: balance.remaining >= required,
    required,
    remaining: balance.remaining,
  };
}

/**
 * 쿠폰 토큰 차감
 */
export async function deductCouponTokens(
  action: 'generate' | 'chat_edit',
  engine: 'openai' | 'claude',
  slideCount: number,
  presentationId?: string
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;

  const { TOKEN_COST } = await import('../types');
  const cost = TOKEN_COST[engine];
  const tokensToDeduct = action === 'generate'
    ? cost.perSlide * slideCount
    : cost.perChatEdit * slideCount;

  // token_usage에 source='coupon'으로 기록
  const { error } = await client
    .from(TABLES.token_usage)
    .insert({
      user_id: user.id,
      subscription_id: null,
      action,
      engine,
      slide_count: slideCount,
      tokens_deducted: tokensToDeduct,
      presentation_id: presentationId || null,
      source: 'coupon',
    });

  return !error;
}

/**
 * 사용자의 쿠폰 사용 이력 조회
 */
export async function getMyRedemptions(): Promise<Array<{ code: string; tokensGranted: number; redeemedAt: string; description?: string }>> {
  const client = getSupabase();
  if (!client) return [];

  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const { data } = await client
    .from(TABLES.coupon_redemptions)
    .select(`*, ${TABLES.coupons}(code, description)`)
    .eq('user_id', user.id)
    .order('redeemed_at', { ascending: false });

  if (!data) return [];

  return data.map((r: any) => ({
    code: r[TABLES.coupons]?.code || '',
    tokensGranted: r.tokens_granted,
    redeemedAt: r.redeemed_at,
    description: r[TABLES.coupons]?.description,
  }));
}
