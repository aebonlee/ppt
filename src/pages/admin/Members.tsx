import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getAllMembers } from '../../utils/adminApi';

const LIMIT = 20;

const Members = (): ReactElement => {
  const [members, setMembers] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllMembers({ page, limit: LIMIT, search });
    setMembers(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (d: unknown) => d ? new Date(d as string).toLocaleDateString('ko-KR') : '-';

  return (
    <>
      <div className="admin-page-header">
        <h1>회원 관리</h1>
        <p>PPT 사이트에 가입/방문한 회원 목록</p>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>회원 목록 ({total}명)</h2>
          <div className="admin-table-actions">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="이름 또는 이메일 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="admin-btn admin-btn-sm admin-btn-primary">검색</button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : members.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-users"></i>
            <p>회원이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>가입 경로</th>
                    <th>가입일</th>
                    <th>최근 로그인</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id as string}>
                      <td>{(m.display_name as string) || (m.name as string) || '-'}</td>
                      <td>{(m.email as string) || '-'}</td>
                      <td>{(m.provider as string) || '-'}</td>
                      <td>{formatDate(m.created_at)}</td>
                      <td>{formatDate(m.last_sign_in_at)}</td>
                      <td>
                        <span className={`admin-badge ${m.is_active === false ? 'cancelled' : 'active'}`}>
                          {m.is_active === false ? '비활성' : '활성'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button>
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
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>다음</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Members;
