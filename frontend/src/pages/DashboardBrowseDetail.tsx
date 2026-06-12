import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingCart, FiCheck, FiHeart } from 'react-icons/fi';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { Meal } from '../types';

export default function DashboardBrowseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [related, setRelated] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (!id) return;
    api.meals.get(id).then(data => { setMeal(data.meal); setRelated(data.related); }).catch(() => navigate('/dashboard/browse')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!meal) return;
    addItem(meal);
    setAdded(true);
  };

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  const handleToggleFav = async () => {
    if (!meal) return;
    if (isFavorite(meal.id)) {
      await api.favorites.remove(meal.id).catch(() => {});
    } else {
      await api.favorites.add(meal.id, { name: meal.name, price: meal.price, image: meal.image, category: meal.category }).catch(() => {});
    }
    toggleFavorite(meal);
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!meal) return null;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-4xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-800 hover:text-primary transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px]">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {meal.discount > 0 && <div className="absolute top-3 left-3 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">{meal.discount}% OFF</div>}
          </div>
          <div className="p-6 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">{meal.name}</h1>
                <p className="text-gray-500 mt-2 text-sm">{meal.description}</p>
              </div>
              <button onClick={handleToggleFav} className="p-2 rounded-full hover:bg-warm transition-colors shrink-0">
                <FiHeart className={`w-5 h-5 ${isFavorite(meal.id) ? 'fill-danger text-danger' : 'text-gray-400'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-amber-500">
              <FiStar className="w-5 h-5 fill-current" />
              <span className="font-semibold text-neutral-800">{meal.rating}</span>
              <span className="text-gray-400 text-sm">({meal.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <span className="text-3xl font-bold text-primary">₦{meal.price.toLocaleString()}</span>
              {meal.originalPrice && <span className="text-lg text-gray-400 line-through">₦{meal.originalPrice.toLocaleString()}</span>}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleAddToCart} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-md ${added ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}>
                {added ? <><FiCheck className="w-4 h-4" /> Added</> : <><FiShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
              <button onClick={() => { addItem(meal); navigate('/dashboard/cart'); }} className="px-6 py-3 bg-warm text-primary font-semibold rounded-full hover:bg-warm-dark transition-all text-sm">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-neutral-800 mb-4">More {meal.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(m => (
              <div key={m.id} onClick={() => navigate(`/dashboard/browse/${m.id}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="h-32 overflow-hidden"><img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-neutral-800 truncate">{m.name}</h3>
                  <p className="text-primary font-bold text-sm mt-1">₦{m.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
