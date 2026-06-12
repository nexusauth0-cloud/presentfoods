import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { Address } from '../types';
import { api } from '../api/client';

export default function DashboardCart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'details' | 'done'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<Partial<Address> | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({ label: 'Home', street: '', city: '', state: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const discount = 0;
  const finalTotal = total - discount;

  const saveAddress = () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.phone) return;
    setDeliveryAddress({ id: 'temp', label: addressForm.label || 'Home', street: addressForm.street, city: addressForm.city, state: addressForm.state, phone: addressForm.phone, isDefault: 1 });
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) { setError('Please add a delivery address'); return; }
    if (!customerName.trim()) { setError('Please enter your name'); return; }
    setPlacing(true);
    setError('');
    try {
      const data = await api.orders.create({
        items: items.map(i => ({ mealId: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        total,
        discount,
        finalTotal,
        deliveryAddress,
        deliveryNote,
        customerName,
        customerEmail,
        customerPhone: deliveryAddress.phone,
      });
      setStep('done');
      clearCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to place order');
    }
    setPlacing(false);
  };

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800">Order Placed!</h2>
        <p className="text-gray-500 text-sm">Your order has been received. The admin will process it shortly.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/dashboard/browse')} className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all text-sm">Order More</button>
          <button onClick={() => navigate('/dashboard/orders')} className="px-6 py-3 bg-warm text-primary rounded-full font-semibold hover:bg-warm-dark transition-all text-sm">View Orders</button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <FiShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">Your cart is empty</p>
        <p className="text-gray-400 text-sm mt-1">Add some meals from the menu.</p>
        <button onClick={() => navigate('/dashboard/browse')} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-all text-sm shadow-md">Browse Meals</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-4xl">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">{step === 'details' ? 'Order Details' : 'Your Cart'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-800 truncate">{item.name}</h3>
                <p className="text-primary font-bold mt-0.5">₦{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-warm rounded-full px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 hover:text-primary"><FiMinus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 hover:text-primary"><FiPlus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-danger"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-neutral-800">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {step === 'cart' && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-neutral-800 mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">₦{total.toLocaleString()}</span></div>
                    {discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="font-medium text-green-600">-₦{discount.toLocaleString()}</span></div>}
                    <div className="border-t pt-2 flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-primary text-lg">₦{finalTotal.toLocaleString()}</span></div>
                  </div>
              </div>
              <button onClick={() => setStep('details')} className="w-full py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md">
                Continue
              </button>
            </>
          )}

          {step === 'details' && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-neutral-800 mb-3">Your Details</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Your name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="email" placeholder="Email (optional)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-neutral-800 mb-3">Delivery Address</h3>
                {deliveryAddress ? (
                  <div className="p-3 bg-warm rounded-xl text-sm break-words">
                    <p className="font-medium">{deliveryAddress.label}</p>
                    <p className="text-gray-500">{deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state}</p>
                    <p className="text-gray-500">{deliveryAddress.phone}</p>
                    <button onClick={() => setDeliveryAddress(null)} className="text-primary text-xs mt-2 hover:underline">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input type="text" placeholder="Label (Home/Work)" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="text" placeholder="Street address *" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="City *" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <input type="text" placeholder="State *" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <input type="tel" placeholder="Phone *" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button onClick={saveAddress} className="w-full py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark">Save Address</button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-neutral-800 mb-3">Delivery Note</h3>
                <textarea value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="Any special instructions?" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} />
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-neutral-800 mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">₦{total.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="font-medium text-green-600">-₦{discount.toLocaleString()}</span></div>}
                  <div className="border-t pt-2 flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-primary">₦{finalTotal.toLocaleString()}</span></div>
                </div>
              </div>

              {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-xl">{error}</div>}

              <div className="flex gap-2">
                <button onClick={() => setStep('cart')} className="flex-1 py-3 text-gray-500 text-sm font-medium hover:text-neutral-800 border border-gray-200 rounded-full">Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="flex-1 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md disabled:opacity-60">
                  {placing ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FiShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} stroke="currentColor" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}
