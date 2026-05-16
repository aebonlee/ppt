/**
 * adminApi.ts — PPT 관리자 전용 API 유틸리티
 */
import getSupabase, { TABLES } from './supabase';

/* ─── Dashboard Stats ─── */

export async function getAdminDashboardStats() {
  const client = getSupabase();
  if (!client) return { presentations: 0, subscriptions: 0, tokens: 0, coupons: 0 };

  const [presRes, subRes, tokenRes, couponRes] = await Promise.all([
    client.from(TABLES.presentations).select('id', { count: 'exact', head: true }),
    client.from(TABLES.subscriptions).select('id', { count: 'exact', head: true }).eq('status', 'active'),
    client.from(TABLES.token_usage).select('tokens_deducted'),
    client.from(TABLES.coupons).select('id', { count: 'exact', head: true }),
  ]);

  const tokens = (tokenRes.data || []).reduce(
    (sum: number, r: Record<string, unknown>) => sum + ((r.tokens_deducted as number) || 0),
    0,
  );

  return {
    presentations: presRes.count || 0,
    subscriptions: subRes.count || 0,
    tokens,
    coupons: couponRes.count || 0,
  };
}

/* ─── Recent Presentations (Dashboard) ─── */

export async function getRecentPresentations(limit = 10) {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLES.presentations)
    .select('id, title, slide_count, orientation, created_at, user_id, user_profiles!inner(email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // fallback without join
    const { data: fallback } = await client
      .from(TABLES.presentations)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return fallback || [];
  }
  return data || [];
}

/* ─── Recent Token Usage (Dashboard) ─── */

export async function getRecentTokenUsage(limit = 10) {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLES.token_usage)
    .select('id, action, engine, slide_count, tokens_deducted, created_at, user_id, user_profiles!inner(email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    const { data: fallback } = await client
      .from(TABLES.token_usage)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return fallback || [];
  }
  return data || [];
}

/* ─── All Presentations (paginated + search) ─── */

export async function getAllPresentations({ page = 1, limit = 20, search = '' } = {}) {
  const client = getSupabase();
  if (!client) return { data: [], total: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from(TABLES.presentations)
    .select('id, title, slide_count, orientation, created_at, user_id, user_profiles!inner(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,user_profiles.email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    // fallback without join
    let fallbackQuery = client
      .from(TABLES.presentations)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (search) {
      fallbackQuery = fallbackQuery.ilike('title', `%${search}%`);
    }
    const { data: fb, count: fc } = await fallbackQuery;
    return { data: fb || [], total: fc || 0 };
  }
  return { data: data || [], total: count || 0 };
}

/* ─── Delete Presentation ─── */

export async function deletePresentation(id: string) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from(TABLES.presentations).delete().eq('id', id);
  if (error) throw error;
}

/* ─── All Subscriptions (paginated + status filter) ─── */

export async function getAllSubscriptions({ page = 1, limit = 20, status = '' } = {}) {
  const client = getSupabase();
  if (!client) return { data: [], total: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = client
    .from(TABLES.subscriptions)
    .select('*, user_profiles!inner(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    let fallbackQuery = client
      .from(TABLES.subscriptions)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (status) fallbackQuery = fallbackQuery.eq('status', status);
    const { data: fb, count: fc } = await fallbackQuery;
    return { data: fb || [], total: fc || 0 };
  }
  return { data: data || [], total: count || 0 };
}

/* ─── All Token Usage (paginated + filters) ─── */

export async function getAllTokenUsage({ page = 1, limit = 20, action = '', engine = '' } = {}) {
  const client = getSupabase();
  if (!client) return { data: [], total: 0, totalTokens: 0, openaiTokens: 0, claudeTokens: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Summary query
  let sumQuery = client.from(TABLES.token_usage).select('tokens_deducted, engine');
  if (action) sumQuery = sumQuery.eq('action', action);
  if (engine) sumQuery = sumQuery.eq('engine', engine);

  const { data: sumData } = await sumQuery;
  const allRows = sumData || [];
  const totalTokens = allRows.reduce((s: number, r: Record<string, unknown>) => s + ((r.tokens_deducted as number) || 0), 0);
  const openaiTokens = allRows.filter((r: Record<string, unknown>) => r.engine === 'openai').reduce((s: number, r: Record<string, unknown>) => s + ((r.tokens_deducted as number) || 0), 0);
  const claudeTokens = allRows.filter((r: Record<string, unknown>) => r.engine === 'claude').reduce((s: number, r: Record<string, unknown>) => s + ((r.tokens_deducted as number) || 0), 0);

  // Paginated query
  let query = client
    .from(TABLES.token_usage)
    .select('*, user_profiles!inner(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (action) query = query.eq('action', action);
  if (engine) query = query.eq('engine', engine);

  const { data, count, error } = await query;

  if (error) {
    let fallbackQuery = client
      .from(TABLES.token_usage)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (action) fallbackQuery = fallbackQuery.eq('action', action);
    if (engine) fallbackQuery = fallbackQuery.eq('engine', engine);
    const { data: fb, count: fc } = await fallbackQuery;
    return { data: fb || [], total: fc || 0, totalTokens, openaiTokens, claudeTokens };
  }
  return { data: data || [], total: count || 0, totalTokens, openaiTokens, claudeTokens };
}

/* ─── Coupons ─── */

export async function getAllCoupons() {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLES.coupons)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllCoupons error:', error);
    return [];
  }
  return data || [];
}

export async function createCoupon(couponData: {
  code: string;
  tokens: number;
  max_uses: number;
  expires_at: string;
  description?: string;
}) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');

  const { data, error } = await client
    .from(TABLES.coupons)
    .insert({
      code: couponData.code,
      tokens: couponData.tokens,
      max_uses: couponData.max_uses,
      expires_at: couponData.expires_at,
      description: couponData.description || '',
      is_active: true,
      used_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');

  const { error } = await client
    .from(TABLES.coupons)
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}
