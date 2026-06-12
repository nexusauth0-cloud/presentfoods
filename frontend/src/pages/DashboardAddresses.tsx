import { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { api } from '../api/client';
import { Address } from '../types';

export default function DashboardAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<Partial<Address>>({ label: 'Home', street: '', city: '', state: '', phone: '' });

  useEffect(() => {
    api.addresses.list().then(data => setAddresses(data.addresses)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ label: 'Home', street: '', city: '', state: '', phone: '' }); setEditing(null); setShowForm(false); };

  const saveAddress = async () => {
    if (!form.street || !form.city || !form.state || !form.phone) return;
    try {
      if (editing) {
        const data = await api.addresses.update(editing.id, form);
        setAddresses(prev => prev.map(a => a.id === editing.id ? data.address : a));
      } else {
        const data = await api.addresses.create(form);
        setAddresses(prev => [...prev, data.address]);
      }
      resetForm();
    } catch {}
  };

  const deleteAddress = async (id: string) => {
    try { await api.addresses.delete(id); setAddresses(prev => prev.filter(a => a.id !== id)); } catch {}
  };

  const setDefault = async (addr: Address) => {
    try {
      const data = await api.addresses.update(addr.id, { ...addr, isDefault: true });
      setAddresses(prev => prev.map(a => a.id === addr.id ? data.address : { ...a, isDefault: 0 }));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">My Addresses</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your delivery addresses</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-all">
          <FiPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <FiMapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No addresses saved</p>
          <p className="text-gray-400 text-sm mt-1">Add a delivery address to start ordering.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-block mt-4 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-all text-sm shadow-md">Add Address</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 bg-warm rounded-xl flex items-center justify-center text-primary shrink-0"><FiMapPin className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 truncate">{addr.label}</h3>
                    {addr.isDefault === 1 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">Default</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 break-words">{addr.street}, {addr.city}, {addr.state}</p>
                  <p className="text-sm text-gray-500 break-words">{addr.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setForm(addr); setEditing(addr); setShowForm(true); }} className="p-2 text-gray-400 hover:text-primary transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteAddress(addr.id)} className="p-2 text-gray-400 hover:text-danger transition-colors"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {!addr.isDefault && <button onClick={() => setDefault(addr)} className="mt-3 text-xs text-primary font-medium hover:underline">Set as Default</button>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-neutral-800 mb-4">{editing ? 'Edit Address' : 'Add New Address'}</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Label (Home/Work)" value={form.label || ''} onChange={e => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="text" placeholder="Street address" value={form.street || ''} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="City" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="text" placeholder="State" value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <input type="tel" placeholder="Phone number" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="flex gap-2">
              <button onClick={saveAddress} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark">{editing ? 'Update' : 'Save'}</button>
              <button onClick={resetForm} className="px-6 py-2.5 text-gray-500 text-sm hover:text-neutral-800">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
