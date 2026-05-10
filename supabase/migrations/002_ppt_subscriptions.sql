-- =============================================
-- PPT 구독/토큰 시스템 마이그레이션
-- 테이블: ppt_subscriptions, ppt_token_usage
-- =============================================

-- 1. 구독 테이블
CREATE TABLE IF NOT EXISTS ppt_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'pro')),
  token_limit INTEGER NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  order_number TEXT,
  portone_payment_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ppt_subscriptions_user_id ON ppt_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ppt_subscriptions_status ON ppt_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_ppt_subscriptions_expires_at ON ppt_subscriptions(expires_at);

-- 2. 토큰 사용 로그 테이블
CREATE TABLE IF NOT EXISTS ppt_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES ppt_subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('generate', 'chat_edit')),
  engine TEXT NOT NULL CHECK (engine IN ('openai', 'claude')),
  slide_count INTEGER NOT NULL DEFAULT 0,
  tokens_deducted INTEGER NOT NULL DEFAULT 0,
  presentation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ppt_token_usage_user_id ON ppt_token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ppt_token_usage_subscription_id ON ppt_token_usage(subscription_id);

-- 3. RLS 활성화
ALTER TABLE ppt_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppt_token_usage ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 — ppt_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON ppt_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON ppt_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON ppt_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. RLS 정책 — ppt_token_usage
CREATE POLICY "Users can view own token usage"
  ON ppt_token_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token usage"
  ON ppt_token_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);
