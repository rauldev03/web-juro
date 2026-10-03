import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/shop/CartDrawer';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Shop Pages
import HomePage from './pages/shop/HomePage';
import CatalogPage from './pages/shop/CatalogPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/shop/CartPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductCreatePage from './pages/admin/AdminProductCreatePage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

// Styles
import './styles/index.css';
import './styles/components.css';
import './styles/admin.css';

// Public Layout wrapper with Header, Footer and Cart slide-over
const PublicLayout: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Store Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/productos" element={<CatalogPage />} />
                <Route path="/producto/:slug" element={<ProductDetailPage />} />
                <Route path="/carrito" element={<CartPage />} />
              </Route>

              {/* Admin Auth */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="productos/nuevo" element={<AdminProductCreatePage />} />
                <Route path="productos/:id/editar" element={<AdminProductEditPage />} />
                <Route path="inventario" element={<AdminInventoryPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
