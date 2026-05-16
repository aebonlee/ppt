import { useState, useEffect, type ReactElement } from 'react';
import {
  getAdminDashboardStats,
  getRecentPresentations,
  getRecentTokenUsage,
} from '../../utils/adminApi';

const Dashboard = (): ReactElement => {
  const [stats, setStats] = useState({ presentations: 0, subscriptions: 0, tokens: 0, coupons: 0 });
  const [recentPres, setRecentPres] = useState<Record<string, unknown>[]>([]);
  const [recentTokens, setRecentTokens] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminDashboardStats(),
      getRecentPresentations(10),
      getRecentTokenUsage(10),
    ]).then(([s, p, t]) => {
      setStats(s);
      setRecentPres(p as Record<string, unknown>[]);
      setRecentTokens(t as Record<string, unknown>[]);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';
  const getUserEmail = (row: Record<string, unknown>) => {
    const profile = row.user_profiles as Record<string, unknown> | undefined;
    return (profile?.email as string) || (row.user_email as string) || '-';
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>대시보드</h1>
        <p>GenPPT 관리자 현황</p>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="loading-spinner"></div></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon blue"><i className="fa-solid fa-file-powerpoint"></i></div>
              <div className="admin-stat-info">
                <h3>{stats.presentations.toLocaleString()}</h3>
                <p>총 프레젠테이션</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon green"><i className="fa-solid fa-credit-card"></i></div>
              <div className="admin-stat-info">
                <h3>{stats.subscriptions.toLocaleString()}</h3>
                <p>활성 구독</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon purple"><i className="fa-solid fa-coins"></i></div>
              <div className="admin-stat-info">
                <h3>{stats.tokens.toLocaleString()}</h3>
                <p>토큰 사용량</p>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon orange"><i className="fa-solid fa-ticket"></i></div>
              <div className="admin-stat-info">
                <h3>{stats.coupons.toLocaleString()}</h3>
                <p>쿠폰 발급</p>
              </div>
            </div>
          </div>

          {/* 최근 프레젠테이션 */}
          <div className="admin-table-card" style={{ marginBottom: '24px' }}>
            <div className="admin-table-header">
              <h2>최근 프레젠테이션</h2>
            </div>
            {recentPres.length === 0 ? (
              <div className="admin-empty"><p>프레젠테이션이 없습니다.</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>제목</th>
                      <th>사용자</th>
                      <th>슬라이드</th>
                      <th>생성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPres.map((p) => (
                      <tr key={p.id as string}>
                        <td>{(p.title as string) || '(제목 없음)'}</td>
                        <td>{getUserEmail(p)}</td>
                        <td>{(p.slide_count as number) || 0}</td>
                        <td>{formatDate(p.created_at as string)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 최근 토큰 사용 */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <h2>최근 토큰 사용</h2>
            </div>
            {recentTokens.length === 0 ? (
              <div className="admin-empty"><p>토큰 사용 기록이 없습니다.</p></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>사용자</th>
                      <th>액션</th>
                      <th>엔진</th>
                      <th>토큰</th>
                      <th>날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTokens.map((t) => (
                      <tr key={t.id as string}>
                        <td>{getUserEmail(t)}</td>
                        <td><span className="admin-badge active">{t.action as string}</span></td>
                        <td>{(t.engine as string) || '-'}</td>
                        <td>{((t.tokens_deducted as number) || 0).toLocaleString()}</td>
                        <td>{formatDate(t.created_at as string)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
