import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ToastProvider } from './contexts/ToastContext';
import { lazy, Suspense } from 'react';
import PublicLayout from './layouts/PublicLayout';
import site from './config/site';
import type { ReactElement, ReactNode } from 'react';

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

const ShopWrapper = ({ children }: { children: ReactNode }): ReactElement =>
  site.features.shop ? <CartProvider>{children}</CartProvider> : <>{children}</>;

function App(): ReactElement {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
          <ToastProvider>
            <ShopWrapper>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/admin/*" element={
                      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="loading-spinner"></div></div>}>
                        <AdminLayout />
                      </Suspense>
                    } />
                    <Route path="*" element={<PublicLayout />} />
                  </Routes>
                </div>
              </Router>
            </ShopWrapper>
          </ToastProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
