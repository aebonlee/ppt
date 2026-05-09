import { lazy, Suspense, type ReactElement } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '../components/AuthGuard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import site from '../config/site';

// 페이지 lazy import
const Home = lazy(() => import('../pages/Home'));
const Generate = lazy(() => import('../pages/Generate'));
const MyPresentations = lazy(() => import('../pages/MyPresentations'));
const Preview = lazy(() => import('../pages/Preview'));
const Pricing = lazy(() => import('../pages/Pricing'));
const Templates = lazy(() => import('../pages/Templates'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Auth 페이지 (features.auth로 토글)
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const MyPage = lazy(() => import('../pages/MyPage'));

// Shop 페이지 (features.shop으로 토글)
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const OrderHistory = lazy(() => import('../pages/OrderHistory'));

const Loading = (): ReactElement => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="loading-spinner"></div>
  </div>
);

const PublicLayout = (): ReactElement => {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            {site.features.auth && (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
                <Route path="/mypage/orders" element={<AuthGuard><OrderHistory /></AuthGuard>} />
              </>
            )}

            {/* Shop */}
            {site.features.shop && (
              <>
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
              </>
            )}

            {/* PPT 전용 페이지 */}
            <Route path="/generate" element={<Generate />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/my-presentations" element={<AuthGuard><MyPresentations /></AuthGuard>} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;
