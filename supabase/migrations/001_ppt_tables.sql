-- PPT Generator Tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. ppt_user_settings: API keys and user preferences
CREATE TABLE IF NOT EXISTS ppt_user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_openai_key TEXT,
  encrypted_claude_key TEXT,
  preferred_engine TEXT DEFAULT 'openai',
  default_slide_count INTEGER DEFAULT 15,
  default_orientation TEXT DEFAULT 'portrait',
  default_color_scheme TEXT DEFAULT 'charcoal-yellow',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS for ppt_user_settings
ALTER TABLE ppt_user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON ppt_user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON ppt_user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON ppt_user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON ppt_user_settings
  FOR DELETE USING (auth.uid() = user_id);


-- 2. ppt_presentations: saved presentations
CREATE TABLE IF NOT EXISTS ppt_presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  orientation TEXT DEFAULT 'portrait',
  color_scheme_id TEXT DEFAULT 'charcoal-yellow',
  design_template_id TEXT DEFAULT 'modern-corporate',
  data_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  slide_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for ppt_presentations
ALTER TABLE ppt_presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presentations" ON ppt_presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presentations" ON ppt_presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations" ON ppt_presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" ON ppt_presentations
  FOR DELETE USING (auth.uid() = user_id);


-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_ppt_presentations_user_id ON ppt_presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_ppt_user_settings_user_id ON ppt_user_settings(user_id);
