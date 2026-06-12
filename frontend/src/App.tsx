import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/DashboardHome';
import DashboardBrowse from './pages/DashboardBrowse';
import DashboardBrowseDetail from './pages/DashboardBrowseDetail';
import DashboardOrders from './pages/DashboardOrders';
import DashboardOrderDetail from './pages/DashboardOrderDetail';
import DashboardCart from './pages/DashboardCart';
import DashboardFavorites from './pages/DashboardFavorites';
import DashboardWallet from './pages/DashboardWallet';
import DashboardAddresses from './pages/DashboardAddresses';
import DashboardProfile from './pages/DashboardProfile';
import DashboardNotifications from './pages/DashboardNotifications';
import AdminMeals from './pages/AdminMeals';
import AdminOrders from './pages/AdminOrders';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<DashboardHome />} />
              <Route path="browse" element={<DashboardBrowse />} />
              <Route path="browse/:id" element={<DashboardBrowseDetail />} />
              <Route path="orders" element={<DashboardOrders />} />
              <Route path="orders/:id" element={<DashboardOrderDetail />} />
              <Route path="cart" element={<DashboardCart />} />
              <Route path="favorites" element={<DashboardFavorites />} />
              <Route path="wallet" element={<DashboardWallet />} />
              <Route path="addresses" element={<DashboardAddresses />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="admin/meals" element={<AdminMeals />} />
              <Route path="admin/orders" element={<AdminOrders />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
