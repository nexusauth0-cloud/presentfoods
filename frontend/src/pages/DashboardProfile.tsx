import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCamera, FiPlus, FiX } from 'react-icons/fi';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phones, setPhones] = useState<string[]>([user?.phone || '']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addPhone = () => setPhones([...phones, '']);
  const updatePhone = (i: number, v: string) => setPhones(phones.map((p, j) => j === i ? v : p));
  const removePhone = (i: number) => setPhones(phones.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.auth.updateProfile({ name, phone: phones[0] || '' });
      updateUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border hover:bg-warm transition-colors">
              <FiCamera className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">{name || 'Your Name'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="email" value={user?.email || ''} disabled className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">Phone Numbers</label>
            <div className="space-y-2">
              {phones.map((phone, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="tel" value={phone} onChange={e => updatePhone(i, e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {phones.length > 1 && <button onClick={() => removePhone(i)} className="p-2 text-gray-400 hover:text-danger"><FiX className="w-4 h-4" /></button>}
                </div>
              ))}
              <button onClick={addPhone} className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline">
                <FiPlus className="w-3.5 h-3.5" /> Add Phone Number
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'} disabled:opacity-60`}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
