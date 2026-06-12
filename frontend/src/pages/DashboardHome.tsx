import { Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Hello, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Welcome to Present Foods — manage your account, orders, and more.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3"><FiShoppingBag className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-neutral-800">0</p>
          <p className="text-gray-500 text-sm">Orders placed</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3"><FiStar className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-neutral-800">0</p>
          <p className="text-gray-500 text-sm">Favorites saved</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-3"><FiHeart className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-neutral-800">20%</p>
          <p className="text-gray-500 text-sm">First order discount</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/dashboard/orders" className="p-4 bg-warm rounded-xl hover:bg-warm-dark transition-colors">
            <p className="font-medium text-neutral-800">View Orders</p>
            <p className="text-sm text-gray-500">Check your order history and status</p>
          </Link>
          <Link to="/dashboard/profile" className="p-4 bg-warm rounded-xl hover:bg-warm-dark transition-colors">
            <p className="font-medium text-neutral-800">Edit Profile</p>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </Link>
          <Link to="/dashboard/addresses" className="p-4 bg-warm rounded-xl hover:bg-warm-dark transition-colors">
            <p className="font-medium text-neutral-800">Manage Addresses</p>
            <p className="text-sm text-gray-500">Add or update delivery addresses</p>
          </Link>
          <Link to="/dashboard/notifications" className="p-4 bg-warm rounded-xl hover:bg-warm-dark transition-colors">
            <p className="font-medium text-neutral-800">Notifications</p>
            <p className="text-sm text-gray-500">View your recent activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
