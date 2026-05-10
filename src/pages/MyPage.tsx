import { useState, useEffect, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { updateProfile } from '../utils/auth';
import { saveApiKey, getDecryptedKey, deleteApiKey } from '../services/settingsService';
import SEOHead from '../components/SEOHead';
import '../styles/auth.css';

const MyPage = (): ReactElement => {
  const { t } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { subscription, plan, tokensRemaining, maxSlides } = useSubscription();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // API Key state
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasClaudeKey, setHasClaudeKey] = useState(false);
  const [keySaving, setKeySaving] = useState<string | null>(null);
  const [keyMessage, setKeyMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.display_name || '',
        avatarUrl: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Load saved API keys status
  useEffect(() => {
    if (!user) return;
    getDecryptedKey('openai').then(k => { if (k) setHasOpenaiKey(true); }).catch(() => {});
    getDecryptedKey('claude').then(k => { if (k) setHasClaudeKey(true); }).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(user!.id, {
        display_name: form.displayName,
        avatar_url: form.avatarUrl
      });
      await refreshProfile();
      setEditing(false);
      setMessage(t('auth.profileUpdated'));
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async (engine: 'openai' | 'claude') => {
    const key = engine === 'openai' ? openaiKey : claudeKey;
    if (!key.trim()) return;
    setKeySaving(engine);
    setKeyMessage('');
    try {
      await saveApiKey(engine, key.trim());
      if (engine === 'openai') { setHasOpenaiKey(true); setOpenaiKey(''); }
      else { setHasClaudeKey(true); setClaudeKey(''); }
      setKeyMessage(`${engine === 'openai' ? 'OpenAI' : 'Claude'} API 키가 저장되었습니다.`);
    } catch (err) {
      setKeyMessage((err as Error).message);
    } finally {
      setKeySaving(null);
    }
  };

  const handleDeleteApiKey = async (engine: 'openai' | 'claude') => {
    setKeySaving(engine);
    setKeyMessage('');
    try {
      await deleteApiKey(engine);
      if (engine === 'openai') setHasOpenaiKey(false);
      else setHasClaudeKey(false);
      setKeyMessage(`${engine === 'openai' ? 'OpenAI' : 'Claude'} API 키가 삭제되었습니다.`);
    } catch (err) {
      setKeyMessage((err as Error).message);
    } finally {
      setKeySaving(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <SEOHead title="마이페이지" path="/mypage" noindex />
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">{t('auth.myPage')}</h1>
        </div>
      </section>

      <section className="auth-section">
        <div className="container">
          <div className="mypage-card">
            <div className="mypage-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} loading="lazy" />
              ) : (
                <div className="mypage-avatar-placeholder">
                  {(profile?.display_name || user?.email || '?')[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="mypage-info">
              {editing ? (
                <div className="mypage-edit-form">
                  <div className="auth-form-group">
                    <label>{t('auth.displayName')}</label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={e => setForm({ ...form, displayName: e.target.value })}
                    />
                  </div>
                  <div className="mypage-edit-actions">
                    <button className="board-btn primary" onClick={handleSave} disabled={saving}>
                      {saving ? t('auth.saving') : t('auth.save')}
                    </button>
                    <button className="board-btn" onClick={() => setEditing(false)}>
                      {t('community.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="mypage-name">{profile?.display_name || t('auth.noName')}</h2>
                  <p className="mypage-email">{user?.email}</p>
                  <p className="mypage-provider">
                    {profile?.provider ? `${t('auth.loginWith')} ${profile.provider}` : t('auth.emailAccount')}
                  </p>
                  {profile?.role === 'admin' && (
                    <span className="mypage-role-badge">{t('auth.admin')}</span>
                  )}
                  <button className="board-btn" onClick={() => setEditing(true)} style={{ marginTop: '16px' }}>
                    {t('auth.editProfile')}
                  </button>
                </>
              )}

              {message && <div className="auth-message">{message}</div>}
            </div>

            {/* Subscription Status */}
            <div style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-color, #E5E7EB)',
              borderRadius: 12,
              padding: '20px 24px',
              marginTop: 24,
              marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>구독 현황</h3>
              {subscription && plan !== 'free' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      background: plan === 'pro' ? '#7C3AED' : '#0284C7',
                      color: '#fff',
                      padding: '3px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      만료일: {new Date(subscription.expiresAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>토큰 잔액</span>
                      <span>{tokensRemaining.toLocaleString()} / {subscription.tokenLimit.toLocaleString()}</span>
                    </div>
                    <div style={{
                      height: 8,
                      background: '#E5E7EB',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((tokensRemaining / subscription.tokenLimit) * 100, 100)}%`,
                        background: tokensRemaining / subscription.tokenLimit > 0.2 ? '#0284C7' : '#EF4444',
                        borderRadius: 4,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    최대 슬라이드: {maxSlides}장/회
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  현재 무료 플랜입니다. 구독하면 플랫폼 API 키로 편리하게 생성할 수 있습니다.
                  <div style={{ marginTop: 10 }}>
                    <Link to="/pricing" className="board-btn primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      구독하기
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* API Key Guide */}
            <div className="api-key-guide">
              <details>
                <summary>API 키 발급 방법 안내</summary>
                <div className="api-key-guide-content">
                  <details>
                    <summary className="api-key-guide-engine">OpenAI (GPT-4o)</summary>
                    <ol>
                      <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a> 접속</li>
                      <li>회원가입 또는 로그인</li>
                      <li>"Create new secret key" 클릭</li>
                      <li>키 복사 (<code>sk-</code>로 시작, 한 번만 표시됨)</li>
                    </ol>
                    <p className="api-key-guide-note">비용: 입력 $2.50 / 출력 $10.00 (1M 토큰당)</p>
                  </details>
                  <details>
                    <summary className="api-key-guide-engine">Anthropic (Claude Sonnet)</summary>
                    <ol>
                      <li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com/settings/keys</a> 접속</li>
                      <li>회원가입 또는 로그인</li>
                      <li>"Create Key" 클릭</li>
                      <li>키 복사 (<code>sk-ant-</code>로 시작, 한 번만 표시됨)</li>
                    </ol>
                    <p className="api-key-guide-note">비용: 입력 $3.00 / 출력 $15.00 (1M 토큰당)</p>
                  </details>
                  <p className="api-key-guide-cost">PPT 1개 생성 시 약 $0.05~0.15 소요</p>
                </div>
              </details>
            </div>

            {/* API Key Management */}
            <div className="api-key-section">
              <h3>API 키 관리</h3>
              <div className="api-key-group">
                <div className="api-key-item">
                  <label>OpenAI</label>
                  {hasOpenaiKey ? (
                    <>
                      <span className="api-key-saved">✓ 저장됨</span>
                      <div className="api-key-actions">
                        <button
                          className="api-key-delete-btn"
                          onClick={() => handleDeleteApiKey('openai')}
                          disabled={keySaving === 'openai'}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={e => setOpenaiKey(e.target.value)}
                      />
                      <div className="api-key-actions">
                        <button
                          className="api-key-save-btn"
                          onClick={() => handleSaveApiKey('openai')}
                          disabled={!openaiKey.trim() || keySaving === 'openai'}
                        >
                          {keySaving === 'openai' ? '...' : '저장'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="api-key-item">
                  <label>Claude</label>
                  {hasClaudeKey ? (
                    <>
                      <span className="api-key-saved">✓ 저장됨</span>
                      <div className="api-key-actions">
                        <button
                          className="api-key-delete-btn"
                          onClick={() => handleDeleteApiKey('claude')}
                          disabled={keySaving === 'claude'}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={claudeKey}
                        onChange={e => setClaudeKey(e.target.value)}
                      />
                      <div className="api-key-actions">
                        <button
                          className="api-key-save-btn"
                          onClick={() => handleSaveApiKey('claude')}
                          disabled={!claudeKey.trim() || keySaving === 'claude'}
                        >
                          {keySaving === 'claude' ? '...' : '저장'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="api-key-hint">
                저장된 키는 PPT 생성 시 자동으로 사용됩니다. 키는 암호화되어 안전하게 보관됩니다.
              </div>
              {keyMessage && <div className="auth-message">{keyMessage}</div>}
            </div>

            <div className="mypage-sections">
              <Link to="/mypage/orders" className="mypage-link-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>{t('auth.orderHistory')}</span>
              </Link>
            </div>

            <div className="mypage-footer">
              <button className="board-btn danger" onClick={handleSignOut}>
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyPage;
