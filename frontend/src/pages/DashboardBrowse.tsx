import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiSearch } from 'react-icons/fi';
import { api } from '../api/client';
import { Meal } from '../types';

export default function DashboardBrowse() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.meals.list(), api.meals.categories()]).then(([m, c]) => {
      setMeals(m.meals);
      setCategories(c.categories);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = meals.filter(m => {
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !m.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Browse Meals</h1>
        <p className="text-gray-500 mt-1 text-sm">Discover delicious Nigerian cuisine</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-primary text-white shadow-md' : 'bg-warm text-neutral-800 hover:bg-warm-dark'}`}>All</button>
        {categories.map(cat => (
          <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name ? 'bg-primary text-white shadow-md' : 'bg-warm text-neutral-800 hover:bg-warm-dark'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search meals..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(meal => (
          <div key={meal.id} onClick={() => navigate(`/dashboard/browse/${meal.id}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="relative h-40 overflow-hidden">
              <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              {meal.discount > 0 && <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{meal.discount}% OFF</div>}
              {meal.isNew === 1 && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">New</div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-800 truncate">{meal.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{meal.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-bold">₦{meal.price.toLocaleString()}</span>
                  {meal.originalPrice && <span className="text-xs text-gray-400 line-through">₦{meal.originalPrice.toLocaleString()}</span>}
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <span>★</span><span className="text-neutral-600">{meal.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FiGrid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No meals found</p>
          <p className="text-gray-400 text-sm">Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
}
