import { useState, useEffect, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { updateProfile } from '../utils/auth';
import { saveApiKey, getDecryptedKey, deleteApiKey } from '../services/settingsService';
import { redeemCoupon, getCouponBalance } from '../services/couponService';
import { getMyTokenUsage, type TokenUsageRecord } from '../services/subscriptionService';
import type { CouponBalance } from '../types';
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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState<'success' | 'error'>('success');
  const [couponBalance, setCouponBalance] = useState<CouponBalance | null>(null);

  // Token usage state
  const [tokenUsageHistory, setTokenUsageHistory] = useState<TokenUsageRecord[]>([]);
  const [tokenUsageLoading, setTokenUsageLoading] = useState(false);

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
    // Load coupon balance
    getCouponBalance().then(setCouponBalance).catch(() => {});
    // Load token usage history
    setTokenUsageLoading(true);
    getMyTokenUsage(20).then(setTokenUsageHistory).catch(() => {}).finally(() => setTokenUsageLoading(false));
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

  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage('');
    try {
      const result = await redeemCoupon(couponCode.trim());
      if (result.success) {
        setCouponMessage(`쿠폰이 등록되었습니다! ${result.tokensGranted?.toLocaleString()} 토큰이 추가되었습니다.`);
        setCouponMessageType('success');
        setCouponCode('');
        // Refresh balance
        const balance = await getCouponBalance();
        setCouponBalance(balance);
      } else {
        setCouponMessage(result.error || '쿠폰 등록에 실패했습니다.');
        setCouponMessageType('error');
      }
    } catch (err: any) {
      setCouponMessage(err.message || '오류가 발생했습니다.');
      setCouponMessageType('error');
    } finally {
      setCouponLoading(false);
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
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>토큰 현황</h3>
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
                      충전일: {new Date(subscription.purchasedAt).toLocaleDateString('ko-KR')}
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
                    최대 슬라이드: {maxSlides}장/회 | 토큰 소진 시까지 이용 가능
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  현재 무료 플랜입니다. 토큰을 충전하면 플랫폼 API 키로 편리하게 생성할 수 있습니다.
                  <div style={{ marginTop: 10 }}>
                    <Link to="/pricing" className="board-btn primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                      토큰 충전하기
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Token Usage History */}
            <div style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-color, #E5E7EB)',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>토큰 사용 내역</h3>
              {tokenUsageLoading ? (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>로딩 중...</p>
              ) : tokenUsageHistory.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>아직 사용 내역이 없습니다.</p>
              ) : (
                <>
                  {/* 요약 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    marginBottom: 16,
                  }}>
                    <div style={{ background: '#F0F9FF', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0284C7' }}>
                        {tokenUsageHistory.reduce((s, r) => s + r.tokensDeducted, 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>총 사용 토큰</div>
                    </div>
                    <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>
                        {tokenUsageHistory.filter(r => r.engine === 'openai').length}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>OpenAI 사용</div>
                    </div>
                    <div style={{ background: '#FDF4FF', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#9333EA' }}>
                        {tokenUsageHistory.filter(r => r.engine === 'claude').length}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Claude 사용</div>
                    </div>
                  </div>
                  {/* 테이블 */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color, #E5E7EB)' }}>
                          <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>날짜</th>
                          <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>액션</th>
                          <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>엔진</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>슬라이드</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>차감 토큰</th>
                          <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>소스</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenUsageHistory.map(row => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color, #F3F4F6)' }}>
                            <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                              {new Date(row.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: row.action === 'generate' ? '#DBEAFE' : '#FEF3C7',
                                color: row.action === 'generate' ? '#1D4ED8' : '#92400E',
                              }}>
                                {row.action === 'generate' ? '생성' : '편집'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: row.engine === 'openai' ? '#ECFDF5' : '#F3E8FF',
                                color: row.engine === 'openai' ? '#065F46' : '#6B21A8',
                              }}>
                                {row.engine === 'openai' ? 'GPT-4o' : 'Claude'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 6px', textAlign: 'right' }}>{row.slideCount}장</td>
                            <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                              -{row.tokensDeducted.toLocaleString()}
                            </td>
                            <td style={{ padding: '8px 6px', fontSize: 11, color: '#64748B' }}>
                              {row.source === 'coupon' ? '쿠폰' : '구독'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Coupon Section */}
            <div style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--border-color, #E5E7EB)',
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 16,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>쿠폰 등록</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                쿠폰 코드를 입력하면 토큰이 추가됩니다. 추가된 토큰으로 플랫폼 API 키를 사용하여 PPT를 생성할 수 있습니다.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="쿠폰 코드 입력"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleRedeemCoupon()}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid var(--border-color, #E5E7EB)',
                    borderRadius: 8,
                    fontSize: 14,
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                  }}
                  disabled={couponLoading}
                />
                <button
                  onClick={handleRedeemCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary-blue, #0046C8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: couponCode.trim() && !couponLoading ? 'pointer' : 'not-allowed',
                    opacity: !couponCode.trim() || couponLoading ? 0.5 : 1,
                  }}
                >
                  {couponLoading ? '확인 중...' : '등록'}
                </button>
              </div>
              {couponMessage && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  background: couponMessageType === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: couponMessageType === 'success' ? '#065F46' : '#991B1B',
                  marginBottom: 12,
                }}>
                  {couponMessage}
                </div>
              )}
              {couponBalance && couponBalance.totalGranted > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: '#F0F9FF',
                  borderRadius: 8,
                  border: '1px solid #BAE6FD',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>쿠폰 토큰 잔액</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-blue, #0046C8)' }}>
                      {couponBalance.remaining.toLocaleString()} 토큰
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    총 부여: {couponBalance.totalGranted.toLocaleString()} | 사용: {couponBalance.totalUsed.toLocaleString()}
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
