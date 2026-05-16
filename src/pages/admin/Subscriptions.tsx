import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getAllSubscriptions } from '../../utils/adminApi';

const PAGE_SIZE = 20;

const Subscriptions = (): ReactElement => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllSubscriptions({ page, limit: PAGE_SIZE, status: statusFilter });
    setData(result.data as Record<string, unknown>[]);
    setTotal(result.total);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (value: string) => {
    setPage(1);
    setStatusFilter(value);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';
  const getUserEmail = (row: Record<string, unknown>) => {
    const profile = row.user_profiles as Record<string, unknown> | undefined;
    return (profile?.email as string) || (row.user_email as string) || '-';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'active',
      expired: 'expired',
      cancelled: 'cancelled',
    };
    return <span className={`admin-badge ${map[status] || 'pending'}`}>{status}</span>;
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>구독 관리</h1>
        <p>사용자 구독 현황</p>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>구독 목록 ({total}개)</h2>
          <div className="admin-table-actions">
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">전체 상태</option>
              <option value="active">활성</option>
              <option value="expired">만료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-credit-card"></i>
            <p>구독 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th>플랜</th>
                    <th>토큰 사용/한도</th>
                    <th>상태</th>
                    <th>구매일</th>
                    <th>만료일</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s) => (
                    <tr key={s.id as string}>
                      <td>{getUserEmail(s)}</td>
                      <td>{(s.plan_name as string) || (s.plan as string) || '-'}</td>
                      <td>
                        {((s.tokens_used as number) || 0).toLocaleString()} / {((s.token_limit as number) || 0).toLocaleString()}
                      </td>
                      <td>{statusBadge((s.status as string) || 'pending')}</td>
                      <td>{formatDate(s.created_at as string)}</td>
                      <td>{formatDate(s.expires_at as string)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>이전</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                      <span key={p}>
                        {showEllipsis && <button disabled>...</button>}
                        <button className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                      </span>
                    );
                  })}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>다음</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Subscriptions;
