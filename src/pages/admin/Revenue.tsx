import { useState, useEffect, type ReactElement } from 'react';
import { getRevenueAnalysis, getApiKeys } from '../../utils/adminApi';

const Revenue = (): ReactElement => {
  const [data, setData] = useState<{
    revenue: number;
    paidOrders: number;
    payingUsers: number;
    openaiTokens: number;
    claudeTokens: number;
    totalTokens: number;
    orders: Record<string, unknown>[];
  } | null>(null);
  const [costRates, setCostRates] = useState<{ openai: number; claude: number }>({ openai: 0.5, claude: 0.7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRevenueAnalysis(), getApiKeys()]).then(([rev, keys]) => {
      setData(rev);
      // Extract cost_per_token from registered API keys
      const apiKeys = keys as Record<string, unknown>[];
      const openaiKey = apiKeys.find((k) => k.provider === 'openai' && k.is_active);
      const claudeKey = apiKeys.find((k) => k.provider === 'claude' && k.is_active);
      setCostRates({
        openai: (openaiKey?.cost_per_token as number) || 0.5,
        claude: (claudeKey?.cost_per_token as number) || 0.7,
      });
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <>
        <div className="admin-page-header">
          <h1>수익 분석</h1>
          <p>결제 현황 및 수익성 분석</p>
        </div>
        <div className="admin-loading"><div className="loading-spinner"></div></div>
      </>
    );
  }

  const openaiCost = data.openaiTokens * costRates.openai;
  const claudeCost = data.claudeTokens * costRates.claude;
  const totalApiCost = openaiCost + claudeCost;
  const netProfit = data.revenue - totalApiCost;
  const profitMargin = data.revenue > 0 ? ((netProfit / data.revenue) * 100) : 0;

  const formatWon = (v: number) => `₩${Math.round(v).toLocaleString()}`;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ko-KR') : '-';

  // Monthly breakdown
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  data.orders.forEach((o) => {
    const d = new Date(o.created_at as string);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const prev = monthlyMap.get(key) || { revenue: 0, orders: 0 };
    monthlyMap.set(key, {
      revenue: prev.revenue + ((o.total_amount as number) || 0),
      orders: prev.orders + 1,
    });
  });
  const monthlyData = Array.from(monthlyMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12);

  return (
    <>
      <div className="admin-page-header">
        <h1>수익 분석</h1>
        <p>결제 현황 및 수익성 분석 — API Key 관리에서 토큰 단가를 설정하면 자동 반영됩니다</p>
      </div>

      {/* Revenue Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><i className="fa-solid fa-won-sign"></i></div>
          <div className="admin-stat-info">
            <h3>{formatWon(data.revenue)}</h3>
            <p>총 매출</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange"><i className="fa-solid fa-server"></i></div>
          <div className="admin-stat-info">
            <h3>{formatWon(totalApiCost)}</h3>
            <p>API 비용 (추정)</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><i className="fa-solid fa-chart-line"></i></div>
          <div className="admin-stat-info">
            <h3 style={{ color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>{formatWon(netProfit)}</h3>
            <p>순이익 (마진 {profitMargin.toFixed(1)}%)</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><i className="fa-solid fa-users"></i></div>
          <div className="admin-stat-info">
            <h3>{data.payingUsers}</h3>
            <p>결제 회원</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="admin-table-card" style={{ marginBottom: '24px' }}>
        <div className="admin-table-header">
          <h2>비용 상세 분석</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>토큰 수</th>
                  <th>단가 (₩/토큰)</th>
                  <th>비용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="admin-badge active">OpenAI</span></td>
                  <td>{data.openaiTokens.toLocaleString()}</td>
                  <td>₩{costRates.openai.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{formatWon(openaiCost)}</td>
                </tr>
                <tr>
                  <td><span className="admin-badge refunded">Claude</span></td>
                  <td>{data.claudeTokens.toLocaleString()}</td>
                  <td>₩{costRates.claude.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>{formatWon(claudeCost)}</td>
                </tr>
                <tr style={{ background: 'var(--bg-light, #f8fafc)' }}>
                  <td style={{ fontWeight: 700 }}>합계</td>
                  <td style={{ fontWeight: 700 }}>{data.totalTokens.toLocaleString()}</td>
                  <td>-</td>
                  <td style={{ fontWeight: 700, color: '#dc2626' }}>{formatWon(totalApiCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-light, #f8fafc)', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{formatWon(data.revenue)}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>매출</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>- {formatWon(totalApiCost)}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>API 비용</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: netProfit >= 0 ? '#16a34a' : '#dc2626' }}>= {formatWon(netProfit)}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>순이익</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      {monthlyData.length > 0 && (
        <div className="admin-table-card" style={{ marginBottom: '24px' }}>
          <div className="admin-table-header">
            <h2>월별 매출 현황</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>월</th>
                  <th>결제 건수</th>
                  <th>매출</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map(([month, info]) => (
                  <tr key={month}>
                    <td style={{ fontWeight: 600 }}>{month}</td>
                    <td>{info.orders}건</td>
                    <td style={{ fontWeight: 600 }}>{formatWon(info.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paid Orders */}
      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2>결제 완료 주문 ({data.paidOrders}건)</h2>
        </div>
        {data.orders.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-receipt"></i>
            <p>결제 완료된 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객</th>
                  <th>결제금액</th>
                  <th>결제방법</th>
                  <th>결제일</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.slice(0, 50).map((o) => (
                  <tr key={o.id as string}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {(o.order_number as string) || (o.id as string).substring(0, 8)}
                    </td>
                    <td>{(o.user_email as string) || (o.user_name as string) || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{formatWon((o.total_amount as number) || 0)}</td>
                    <td>{(o.payment_method as string) === 'card' ? '카드' : (o.payment_method as string) || '-'}</td>
                    <td>{formatDate((o.paid_at as string) || (o.created_at as string))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Revenue;
