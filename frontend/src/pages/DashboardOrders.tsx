import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiXCircle } from 'react-icons/fi';
import { api } from '../api/client';
import { Order } from '../types';

const statusSteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const statusLabels: Record<string, string> = {
  pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function DashboardOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders.list().then(data => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.orders.cancel(id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  if (orders.length === 0) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">My Orders</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">Your orders will appear here once you place one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">My Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <Link to={`/dashboard/orders/${order.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-800">{order.id}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <p className="text-sm text-gray-500 mt-1">{order.items?.length || 0} item(s) - ₦{order.finalTotal?.toLocaleString()}</p>
              </Link>
              <div className="text-right shrink-0 ml-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'confirmed' || order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {statusLabels[order.status] || order.status}
                </span>
                {order.status === 'pending' && (
                  <button onClick={e => { e.preventDefault(); handleCancel(order.id); }} className="block mt-2 mx-auto text-xs text-red-500 hover:text-red-700 font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
