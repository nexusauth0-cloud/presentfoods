import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Meal } from '../types';

export default function AdminMeals() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [form, setForm] = useState<Partial<Meal>>({ name: '', description: '', price: 0, category: 'Main Dishes', image: '', discount: 0, isNew: 0 });
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return <div className="text-center py-16 text-gray-500">Admin access required.</div>;

  const load = () => api.meals.list().then(d => setMeals(d.meals)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ name: '', description: '', price: 0, category: 'Main Dishes', image: '', discount: 0, isNew: 0 }); setEditing(null); setShowForm(false); };

  const save = async () => {
    if (!form.name || !form.description || !form.price || !form.image) return;
    setSaving(true);
    try {
      if (editing) {
        await api.admin.updateMeal(editing.id, form);
      } else {
        await api.admin.createMeal(form);
      }
      resetForm();
      load();
    } catch {}
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this meal?')) return;
    await api.admin.deleteMeal(id).catch(() => {}).then(load);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Manage Meals</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-all">
          <FiPlus className="w-4 h-4" /> Add Meal
        </button>
      </div>

      {loading ? <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-neutral-800">Name</th>
                <th className="text-left p-3 font-medium text-neutral-800 hidden sm:table-cell">Category</th>
                <th className="text-right p-3 font-medium text-neutral-800">Price</th>
                <th className="text-right p-3 font-medium text-neutral-800 hidden sm:table-cell">Discount</th>
                <th className="text-right p-3 font-medium text-neutral-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meals.map(meal => (
                <tr key={meal.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={meal.image} alt="" className="w-8 h-8 rounded-lg object-cover hidden sm:block" />
                      <span className="font-medium text-neutral-800 truncate max-w-[150px] block">{meal.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 hidden sm:table-cell">{meal.category}</td>
                  <td className="p-3 text-right font-medium">₦{meal.price.toLocaleString()}</td>
                  <td className="p-3 text-right hidden sm:table-cell">{meal.discount > 0 ? <span className="text-green-600">{meal.discount}%</span> : <span className="text-gray-400">-</span>}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setForm(meal); setEditing(meal); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-primary"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => remove(meal.id)} className="p-1.5 text-gray-400 hover:text-danger"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meals.length === 0 && <div className="text-center py-10 text-gray-400">No meals yet.</div>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">{editing ? 'Edit Meal' : 'Add Meal'}</h3>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-neutral-800"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Name *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <textarea placeholder="Description *" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price *" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="number" placeholder="Original Price" value={form.originalPrice || ''} onChange={e => setForm({ ...form, originalPrice: Number(e.target.value) || undefined })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>Main Dishes</option><option>Soups</option><option>Grills</option><option>Drinks</option><option>Small Chops</option>
                </select>
                <input type="number" placeholder="Discount %" value={form.discount || 0} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <input type="text" placeholder="Image URL *" value={form.image || ''} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked ? 1 : 0 })} className="rounded text-primary focus:ring-primary" />
                <span>Mark as New</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button onClick={resetForm} className="px-6 py-2.5 text-gray-500 text-sm hover:text-neutral-800">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
