import { lazy, Suspense, useState, type ReactElement } from 'react';
import { Routes, Route, NavLink, Link, Navigate } from 'react-router-dom';
import AdminGuard from '../components/AdminGuard';
import '../styles/admin.css';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Presentations = lazy(() => import('../pages/admin/Presentations'));
const Subscriptions = lazy(() => import('../pages/admin/Subscriptions'));
const TokenUsage = lazy(() => import('../pages/admin/TokenUsage'));
const CouponAdmin = lazy(() => import('../pages/admin/CouponAdmin'));
const Members = lazy(() => import('../pages/admin/Members'));
const ApiKeys = lazy(() => import('../pages/admin/ApiKeys'));
const Revenue = lazy(() => import('../pages/admin/Revenue'));

const Loading = (): ReactElement => (
  <div className="admin-loading">
    <div className="loading-spinner"></div>
  </div>
);

const AdminLayout = (): ReactElement => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="admin-layout">
        <button
          className="admin-mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <h2>GenPPT Admin</h2>
            <p>프레젠테이션 관리</p>
          </div>

          <nav className="admin-sidebar-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-chart-pie"></i>
              대시보드
            </NavLink>
            <NavLink
              to="/admin/members"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-users"></i>
              회원 관리
            </NavLink>
            <NavLink
              to="/admin/presentations"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-file-powerpoint"></i>
              프레젠테이션
            </NavLink>
            <NavLink
              to="/admin/subscriptions"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-credit-card"></i>
              구독 관리
            </NavLink>
            <NavLink
              to="/admin/revenue"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-chart-line"></i>
              수익 분석
            </NavLink>
            <NavLink
              to="/admin/tokens"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-coins"></i>
              토큰 사용량
            </NavLink>
            <NavLink
              to="/admin/api-keys"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-key"></i>
              API Key
            </NavLink>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fa-solid fa-ticket"></i>
              쿠폰 관리
            </NavLink>
          </nav>

          <div className="admin-sidebar-footer">
            <Link to="/" className="admin-back-link">
              <i className="fa-solid fa-arrow-left"></i>
              사이트로 돌아가기
            </Link>
          </div>
        </aside>

        <main className="admin-main">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="presentations" element={<Presentations />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="tokens" element={<TokenUsage />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="coupons" element={<CouponAdmin />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
