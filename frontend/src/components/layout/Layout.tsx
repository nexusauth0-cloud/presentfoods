import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingBag, FiHeart, FiDollarSign, FiMapPin, FiUser, FiBell, FiMenu, FiLogOut, FiChevronLeft, FiChevronRight, FiShoppingCart, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';
import PermissionPrompt from '../PermissionPrompt';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const location = useLocation();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    api.notifications.unreadCount().then(data => setNotifCount(data.count)).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handler = () => {
      if (window.confirm('Are you sure you want to logout?')) logout();
      else window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [logout]);

  if (!isLoggedIn) return <Navigate to="/" replace />;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Browse', path: '/dashboard/browse', icon: <FiGrid className="w-5 h-5" /> },
    { name: 'Cart', path: '/dashboard/cart', icon: <FiShoppingCart className="w-5 h-5" /> },
    { name: 'Orders', path: '/dashboard/orders', icon: <FiShoppingBag className="w-5 h-5" /> },
    { name: 'Favorites', path: '/dashboard/favorites', icon: <FiHeart className="w-5 h-5" /> },
    { name: 'Wallet', path: '/dashboard/wallet', icon: <FiDollarSign className="w-5 h-5" /> },
    { name: 'Addresses', path: '/dashboard/addresses', icon: <FiMapPin className="w-5 h-5" /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <FiUser className="w-5 h-5" /> },
    { name: 'Notifications', path: '/dashboard/notifications', icon: <FiBell className="w-5 h-5" /> },
    ...(isAdmin ? [
      { name: 'Admin Meals', path: '/dashboard/admin/meals', icon: <FiShield className="w-5 h-5" /> },
      { name: 'Admin Orders', path: '/dashboard/admin/orders', icon: <FiShield className="w-5 h-5" /> },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <PermissionPrompt />
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="h-full flex flex-col">
          <div className={`border-b flex items-center ${collapsed ? 'justify-center p-3' : 'p-4 justify-between'}`}>
            {!collapsed && (
              <div className="min-w-0">
                <Link to="/" className="text-lg font-bold text-primary block truncate">Present Foods</Link>
                <p className="text-[10px] text-gray-400 truncate">{user?.name?.split(' ')[0]}</p>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-neutral-800 transition-all shrink-0">
              {collapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className={`flex-1 overflow-y-auto ${collapsed ? 'p-2 space-y-1' : 'p-3 space-y-1'}`}>
            {sidebarLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-xl font-medium transition-all relative ${collapsed ? 'justify-center p-2.5 text-sm' : 'gap-3 px-3 py-2.5 text-sm'} ${location.pathname === link.path ? 'bg-primary text-white shadow-md' : 'text-neutral-800 hover:bg-warm'}`}
                title={collapsed ? link.name : undefined}
              >
                {link.icon}
                {!collapsed && <span>{link.name}</span>}
                {link.name === 'Cart' && itemCount > 0 && (
                  <span className={`absolute ${collapsed ? 'top-1 right-1' : 'top-1 right-2'} bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold`}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
                {link.name === 'Notifications' && notifCount > 0 && (
                  <span className={`absolute ${collapsed ? 'top-1 right-1' : 'top-1 right-2'} bg-danger text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold`}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className={`border-t ${collapsed ? 'p-2' : 'p-3'}`}>
            <button onClick={logout} className={`flex items-center rounded-xl font-medium text-gray-500 hover:bg-red-50 hover:text-danger transition-all w-full ${collapsed ? 'justify-center p-2.5 text-sm' : 'gap-3 px-3 py-2.5 text-sm'}`} title={collapsed ? 'Sign Out' : undefined}>
              <FiLogOut className="w-5 h-5" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white shadow-sm px-4 lg:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-neutral-800 hover:bg-warm rounded-lg"><FiMenu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link to="/dashboard/cart" className="relative p-2 text-neutral-800 hover:text-primary transition-colors lg:hidden">
              <FiShoppingCart className="w-5 h-5" />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{itemCount}</span>}
            </Link>
            <span className="text-sm text-gray-500 hidden sm:block">Hello, <span className="font-semibold text-neutral-800">{user?.name?.split(' ')[0]}</span></span>
            <Link to="/dashboard/profile" className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t lg:hidden flex justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {sidebarLinks.slice(0, 5).map(link => (
          <Link key={link.path} to={link.path} className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-gray-400'}`}>
            {link.icon}
            <span>{link.name}</span>
            {link.name === 'Cart' && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{itemCount}</span>
            )}
            {link.name === 'Notifications' && notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{notifCount}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
