import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getAllTokenUsage } from '../../utils/adminApi';

const PAGE_SIZE = 20;

const TokenUsage = (): ReactElement => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [openaiTokens, setOpenaiTokens] = useState(0);
  const [claudeTokens, setClaudeTokens] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [engineFilter, setEngineFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllTokenUsage({ page, limit: PAGE_SIZE, action: actionFilter, engine: engineFilter });
    setData(result.data as Record<string, unknown>[]);
    setTotal(result.total);
    setTotalTokens(result.totalTokens);
    setOpenaiTokens(result.openaiTokens);
    setClaudeTokens(result.claudeTokens);
    setLoading(false);
  }, [page, actionFilter, engineFilter]);

  useEffect(() => { load(); }, [load]);

  const handleActionChange = (value: string) => { setPage(1); setActionFilter(value); };
  const handleEngineChange = (value: string) => { setPage(1); setEngineFilter(value); };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';
  const getUserEmail = (row: Record<string, unknown>) => {
    const profile = row.user_profiles as Record<string, unknown> | undefined;
    return (profile?.email as string) || '-';
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>토큰 사용량</h1>
        <p>토큰 소비 분석</p>
      </div>

      {/* Summary */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><i className="fa-solid fa-coins"></i></div>
          <div className="admin-stat-info">
            <h3>{totalTokens.toLocaleString()}</h3>
            <p>총 토큰</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><i className="fa-solid fa-robot"></i></div>
          <div className="admin-stat-info">
            <h3>{openaiTokens.toLocaleString()}</h3>
            <p>OpenAI 토큰</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><i className="fa-solid fa-brain"></i></div>
          <div className="admin-stat-info">
            <h3>{claudeTokens.toLocaleString()}</h3>
            <p>Claude 토큰</p>
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>토큰 사용 로그 ({total}건)</h2>
          <div className="admin-table-actions">
            <select
              className="admin-filter-select"
              value={actionFilter}
              onChange={(e) => handleActionChange(e.target.value)}
            >
              <option value="">전체 액션</option>
              <option value="generate">generate</option>
              <option value="chat_edit">chat_edit</option>
            </select>
            <select
              className="admin-filter-select"
              value={engineFilter}
              onChange={(e) => handleEngineChange(e.target.value)}
            >
              <option value="">전체 엔진</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-coins"></i>
            <p>토큰 사용 기록이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th>액션</th>
                    <th>엔진</th>
                    <th>슬라이드</th>
                    <th>토큰</th>
                    <th>날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t) => (
                    <tr key={t.id as string}>
                      <td>{getUserEmail(t)}</td>
                      <td><span className="admin-badge active">{t.action as string}</span></td>
                      <td>{(t.engine as string) || '-'}</td>
                      <td>{(t.slide_count as number) || '-'}</td>
                      <td>{((t.tokens_deducted as number) || 0).toLocaleString()}</td>
                      <td>{formatDate(t.created_at as string)}</td>
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

export default TokenUsage;
