/**
 * Settings Service
 * Manages API keys and user preferences in ppt_user_settings table
 */
import getSupabase from '../utils/supabase';

interface UserSettings {
  encrypted_openai_key?: string | null;
  encrypted_claude_key?: string | null;
  preferred_engine?: string;
  default_slide_count?: number;
  default_orientation?: string;
  default_color_scheme?: string;
}

// Base64 encode/decode for minimal obfuscation
function encodeKey(key: string): string {
  return btoa(unescape(encodeURIComponent(key)));
}

function decodeKey(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded)));
}

export async function loadSettings(): Promise<UserSettings | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from('ppt_user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return data as UserSettings;
}

export async function saveApiKey(engine: 'openai' | 'claude', apiKey: string): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const encoded = encodeKey(apiKey);
  const column = engine === 'openai' ? 'encrypted_openai_key' : 'encrypted_claude_key';

  const { error } = await client
    .from('ppt_user_settings')
    .upsert({
      user_id: user.id,
      [column]: encoded,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw new Error('API 키 저장 실패: ' + error.message);
}

export async function getDecryptedKey(engine: 'openai' | 'claude'): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const column = engine === 'openai' ? 'encrypted_openai_key' : 'encrypted_claude_key';

  const { data, error } = await client
    .from('ppt_user_settings')
    .select(column)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  const encoded = (data as any)[column];
  if (!encoded) return null;

  try {
    return decodeKey(encoded);
  } catch {
    return null;
  }
}

export async function deleteApiKey(engine: 'openai' | 'claude'): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const column = engine === 'openai' ? 'encrypted_openai_key' : 'encrypted_claude_key';

  const { error } = await client
    .from('ppt_user_settings')
    .update({
      [column]: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) throw new Error('API 키 삭제 실패: ' + error.message);
}

export async function saveDefaults(settings: {
  preferred_engine?: string;
  default_slide_count?: number;
  default_orientation?: string;
  default_color_scheme?: string;
}): Promise<void> {
  const client = getSupabase();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');

  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await client
    .from('ppt_user_settings')
    .upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw new Error('설정 저장 실패: ' + error.message);
}
