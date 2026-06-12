import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { api } from '../../api/client';
import { Meal } from '../../types';

export default function FeaturedMeals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    api.meals.list().then(data => setMeals(data.meals.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <section className="py-10 lg:py-14 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800">Featured Meals</h2>
            <p className="text-gray-500 mt-1 text-sm">Our most popular dishes</p>
          </div>
          <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:gap-2 transition-all">
            View All Meals <FiArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {meals.map(meal => (
            <div key={meal.id} onClick={() => navigate('/login')} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                {meal.discount > 0 && <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{meal.discount}% OFF</div>}
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-semibold text-neutral-800">{meal.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{meal.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">₦{meal.price.toLocaleString()}</span>
                    {meal.originalPrice && <span className="text-sm text-gray-400 line-through">₦{meal.originalPrice.toLocaleString()}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    <span>★</span><span className="text-gray-500">{meal.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
