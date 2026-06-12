import { useState, useEffect } from 'react';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { api } from '../api/client';
import { Favorite } from '../types';

export default function DashboardFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.favorites.list().then(data => setFavorites(data.favorites)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const remove = async (mealId: string) => {
    try {
      await api.favorites.remove(mealId);
      setFavorites(prev => prev.filter(f => f.mealId !== mealId));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <FiHeart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No favorites yet</p>
          <p className="text-gray-400 text-sm mt-1">Save your favorite meals for quick access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(fav => (
            <div key={fav.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {fav.mealData?.image && <img src={fav.mealData.image} alt={fav.mealData.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-800 truncate">{fav.mealData?.name || 'Meal'}</p>
                  <p className="text-primary font-bold mt-1">₦{fav.mealData?.price?.toLocaleString()}</p>
                </div>
                <button onClick={() => remove(fav.mealId)} className="p-2 text-gray-400 hover:text-danger transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
