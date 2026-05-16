import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { getAllPresentations, deletePresentation } from '../../utils/adminApi';

const PAGE_SIZE = 20;

const Presentations = (): ReactElement => {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getAllPresentations({ page, limit: PAGE_SIZE, search });
    setData(result.data as Record<string, unknown>[]);
    setTotal(result.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 프레젠테이션을 삭제하시겠습니까?')) return;
    try {
      await deletePresentation(id);
      load();
    } catch (err) {
      alert('삭제 실패: ' + (err as Error).message);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';
  const getUserEmail = (row: Record<string, unknown>) => {
    const profile = row.user_profiles as Record<string, unknown> | undefined;
    return (profile?.email as string) || '-';
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>프레젠테이션 관리</h1>
        <p>전체 사용자 프레젠테이션 목록</p>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>프레젠테이션 ({total}개)</h2>
          <div className="admin-table-actions">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="제목 또는 이메일 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">검색</button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner"></div></div>
        ) : data.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-file-powerpoint"></i>
            <p>프레젠테이션이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>사용자</th>
                    <th>방향</th>
                    <th>슬라이드</th>
                    <th>생성일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p) => (
                    <tr key={p.id as string}>
                      <td>{(p.title as string) || '(제목 없음)'}</td>
                      <td>{getUserEmail(p)}</td>
                      <td>{(p.orientation as string) === 'portrait' ? '세로' : '가로'}</td>
                      <td>{(p.slide_count as number) || 0}</td>
                      <td>{formatDate(p.created_at as string)}</td>
                      <td>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDelete(p.id as string)}
                        >
                          삭제
                        </button>
                      </td>
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

export default Presentations;
