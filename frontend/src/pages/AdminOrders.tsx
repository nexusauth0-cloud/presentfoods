import { useState, useEffect } from 'react';
import { FiPackage, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Order } from '../types';

const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAdmin) return <div className="text-center py-16 text-gray-500">Admin access required.</div>;

  const load = () => api.admin.listOrders().then(d => setOrders(d.orders)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.admin.updateOrderStatus(id, status).catch(() => {}).then(load);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Manage Orders</h1>

      {loading ? <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">No orders yet</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-800">{order.id}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'confirmed' || order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{order.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{order.customerName} • {order.customerPhone || order.deliveryAddress?.phone}</p>
                  <p className="text-xs text-gray-400">{order.items?.length} item(s) • ₦{order.finalTotal?.toLocaleString()} • {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {statuses.map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                        order.status === s ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >{s.replace(/_/g, ' ')}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
