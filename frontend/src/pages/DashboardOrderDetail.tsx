import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiClock, FiPackage, FiTruck, FiXCircle } from 'react-icons/fi';
import { api } from '../api/client';
import { Order } from '../types';

const statusSteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <FiClock className="w-5 h-5" />,
  confirmed: <FiCheck className="w-5 h-5" />,
  preparing: <FiPackage className="w-5 h-5" />,
  out_for_delivery: <FiTruck className="w-5 h-5" />,
  delivered: <FiCheck className="w-5 h-5" />,
  cancelled: <FiXCircle className="w-5 h-5" />,
};

export default function DashboardOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.orders.get(id).then(data => setOrder(data.order)).catch(() => navigate('/dashboard/orders')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.orders.cancel(id!);
      const data = await api.orders.get(id!);
      setOrder(data.order);
    } catch {}
    setCancelling(false);
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const currentIdx = isCancelled ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-800 hover:text-primary transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{order.id}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {order.status === 'pending' && (
          <button onClick={handleCancel} disabled={cancelling} className="px-4 py-2 bg-danger/10 text-danger text-sm font-medium rounded-full hover:bg-danger/20 transition-all disabled:opacity-60">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">Order Status</h2>
        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <FiXCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-red-600">Order Cancelled</p>
              <p className="text-sm text-red-500">This order has been cancelled.</p>
            </div>
          </div>
        ) : (
          statusSteps.map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= currentIdx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {statusIcons[step]}
                </div>
                {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
              <div className={`pt-1 ${i <= currentIdx ? 'text-neutral-800' : 'text-gray-400'}`}>
                <p className="font-medium text-sm capitalize">{step.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                <div>
                  <p className="font-medium text-neutral-800">{item.name}</p>
                  <p className="text-gray-500">x{item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₦{order.total?.toLocaleString()}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-₦{order.discount?.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-neutral-800 pt-1 border-t"><span>Total</span><span>₦{order.finalTotal?.toLocaleString()}</span></div>
        </div>
      </div>

      {order.deliveryAddress && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800 mb-2">Delivery Address</h2>
          <div className="text-sm text-gray-500">
            <p className="font-medium text-neutral-800">{order.deliveryAddress.label}</p>
            <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
            <p>{order.deliveryAddress.phone}</p>
          </div>
          {order.deliveryNote && (
            <div className="mt-3 p-3 bg-warm rounded-xl text-sm">
              <p className="font-medium text-neutral-800">Note</p>
              <p className="text-gray-500">{order.deliveryNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
