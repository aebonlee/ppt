import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getAllCoupons, createCoupon, toggleCouponStatus } from '../../utils/adminApi';

const CouponAdmin = (): ReactElement => {
  const [coupons, setCoupons] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [tokens, setTokens] = useState(100);
  const [maxUses, setMaxUses] = useState(50);
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllCoupons();
    setCoupons(data as Record<string, unknown>[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !expiresAt) return;
    setCreating(true);
    try {
      await createCoupon({ code: code.trim().toUpperCase(), tokens, max_uses: maxUses, expires_at: expiresAt, description });
      setCode('');
      setTokens(100);
      setMaxUses(50);
      setExpiresAt('');
      setDescription('');
      load();
    } catch (err) {
      alert('쿠폰 생성 실패: ' + (err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await toggleCouponStatus(id, !currentActive);
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentActive } : c)),
      );
    } catch (err) {
      alert('상태 변경 실패: ' + (err as Error).message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => c.is_active && (c.expires_at as string) >= today).length;

  return (
    <>
      <div className="admin-page-header">
        <h1>쿠폰 관리</h1>
        <p>PPT 쿠폰 발급 및 관리</p>
      </div>

      {/* Create Form */}
      <div className="admin-table-card" style={{ marginBottom: '24px' }}>
        <div className="admin-table-header">
          <h2>새 쿠폰 생성</h2>
        </div>
        <form onSubmit={handleCreate} style={{ padding: '24px' }} className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>쿠폰 코드 *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="예: WELCOME2026"
                required
              />
            </div>
            <div className="admin-form-group">
              <label>토큰 수량 *</label>
              <input
                type="number"
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>최대 사용 횟수 *</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                min={1}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>만료일 *</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label>설명</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="쿠폰 설명 (선택)"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating || !code.trim() || !expiresAt}>
              <i className="fa-solid fa-plus"></i>
              {creating ? '생성 중...' : '쿠폰 생성'}
            </button>
          </div>
        </form>
      </div>

      {/* Coupon List */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>쿠폰 목록 ({totalCount}개, 활성 {activeCount}개)</h2>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : coupons.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-ticket"></i>
            <p>발행된 쿠폰이 없습니다.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>코드</th>
                  <th>토큰</th>
                  <th>사용/최대</th>
                  <th>상태</th>
                  <th>만료일</th>
                  <th>설명</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = (c.expires_at as string) < today;
                  const isActive = c.is_active as boolean;
                  return (
                    <tr key={c.id as string} style={{ opacity: (!isActive || expired) ? 0.6 : 1 }}>
                      <td>
                        <code style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                          {c.code as string}
                        </code>
                      </td>
                      <td>{((c.tokens as number) || 0).toLocaleString()}</td>
                      <td>{(c.used_count as number) || 0} / {(c.max_uses as number) || 0}</td>
                      <td>
                        {expired ? (
                          <span className="admin-badge expired">만료</span>
                        ) : isActive ? (
                          <span className="admin-badge active">활성</span>
                        ) : (
                          <span className="admin-badge disabled">비활성</span>
                        )}
                      </td>
                      <td>{(c.expires_at as string) || '-'}</td>
                      <td>{(c.description as string) || '-'}</td>
                      <td>
                        <button
                          className={`admin-btn admin-btn-sm ${isActive ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                          onClick={() => handleToggle(c.id as string, isActive)}
                          disabled={expired}
                        >
                          {isActive ? '비활성화' : '활성화'}
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

export default CouponAdmin;
