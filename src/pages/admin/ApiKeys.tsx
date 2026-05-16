import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getApiKeys, saveApiKey, deleteApiKey, toggleApiKeyStatus } from '../../utils/adminApi';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'claude', label: 'Anthropic (Claude)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'other', label: '기타' },
];

const ApiKeys = (): ReactElement => {
  const [keys, setKeys] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  // Form
  const [provider, setProvider] = useState('openai');
  const [keyName, setKeyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [costPerToken, setCostPerToken] = useState(0.5);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getApiKeys();
    if (data.length === 0) {
      // Could be empty table or non-existent table
      setTableExists(true); // optimistic
    }
    setKeys(data as Record<string, unknown>[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim() || !apiKey.trim()) return;
    setSaving(true);
    try {
      await saveApiKey({
        provider,
        key_name: keyName.trim(),
        api_key: apiKey.trim(),
        cost_per_token: costPerToken,
        is_active: true,
      });
      setKeyName('');
      setApiKey('');
      setCostPerToken(0.5);
      setProvider('openai');
      load();
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('relation') && msg.includes('does not exist')) {
        setTableExists(false);
      } else {
        alert('저장 실패: ' + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 API Key를 삭제하시겠습니까?')) return;
    try {
      await deleteApiKey(id);
      load();
    } catch (err) {
      alert('삭제 실패: ' + (err as Error).message);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleApiKeyStatus(id, !current);
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, is_active: !current } : k)));
    } catch (err) {
      alert('상태 변경 실패: ' + (err as Error).message);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const providerLabel = (val: string) => PROVIDERS.find((p) => p.value === val)?.label || val;

  return (
    <>
      <div className="admin-page-header">
        <h1>API Key 관리</h1>
        <p>AI 엔진 API Key를 등록하고 토큰 단가를 설정합니다</p>
      </div>

      {!tableExists && (
        <div className="admin-table-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3 style={{ color: '#dc2626', marginBottom: '12px' }}>테이블 미생성</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '16px' }}>
            <code>ppt_api_keys</code> 테이블이 Supabase에 아직 생성되지 않았습니다. 아래 SQL을 실행해주세요:
          </p>
          <pre style={{
            background: 'var(--bg-light, #f1f5f9)', padding: '16px', borderRadius: '8px',
            fontSize: '13px', overflow: 'auto', lineHeight: 1.6,
          }}>
{`CREATE TABLE ppt_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'openai',
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  cost_per_token NUMERIC(10,4) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ppt_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access" ON ppt_api_keys
  FOR ALL USING (true) WITH CHECK (true);`}
          </pre>
        </div>
      )}

      {/* Register Form */}
      <div className="admin-table-card" style={{ marginBottom: '24px' }}>
        <div className="admin-table-header">
          <h2>API Key 등록</h2>
        </div>
        <form onSubmit={handleSave} style={{ padding: '24px' }} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>AI 엔진 *</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>키 이름 *</label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="예: GPT-4o 메인키"
                required
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>API Key *</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... 또는 키 값 입력"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>토큰당 원가 (원) *</label>
              <input
                type="number"
                value={costPerToken}
                onChange={(e) => setCostPerToken(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                1토큰 소모 시 실제 API 비용 (원화 환산)
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || !keyName.trim() || !apiKey.trim()}>
              <i className="fa-solid fa-plus"></i>
              {saving ? '저장 중...' : 'Key 등록'}
            </button>
          </div>
        </form>
      </div>

      {/* Key List */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>등록된 API Keys ({keys.length}개)</h2>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : keys.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-key"></i>
            <p>등록된 API Key가 없습니다.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>엔진</th>
                  <th>이름</th>
                  <th>API Key</th>
                  <th>토큰 단가</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const isActive = k.is_active as boolean;
                  return (
                    <tr key={k.id as string} style={{ opacity: !isActive ? 0.6 : 1 }}>
                      <td>
                        <span className={`admin-badge ${(k.provider as string) === 'openai' ? 'active' : (k.provider as string) === 'claude' ? 'refunded' : 'pending'}`}>
                          {providerLabel(k.provider as string)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{k.key_name as string}</td>
                      <td>
                        <code style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                          {maskKey(k.api_key as string)}
                        </code>
                      </td>
                      <td>₩{((k.cost_per_token as number) || 0).toFixed(2)}</td>
                      <td>
                        {isActive ? (
                          <span className="admin-badge active">활성</span>
                        ) : (
                          <span className="admin-badge disabled">비활성</span>
                        )}
                      </td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className={`admin-btn admin-btn-sm ${isActive ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                          onClick={() => handleToggle(k.id as string, isActive)}
                        >
                          {isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDelete(k.id as string)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiKeys;
