import { useNavigate } from 'react-router-dom';
import { MdRestaurant, MdSetMeal, MdSoupKitchen, MdFlatware, MdLocalDrink, MdCookie } from 'react-icons/md';

const categories = [
  { name: 'Main Dishes', icon: <MdRestaurant className="w-6 h-6 sm:w-7 sm:h-7" />, color: 'from-primary/20 to-primary/5', iconColor: 'text-primary', borderColor: 'border-primary/20' },
  { name: 'Soups', icon: <MdSoupKitchen className="w-6 h-6 sm:w-7 sm:h-7" />, color: 'from-secondary/20 to-secondary/5', iconColor: 'text-secondary', borderColor: 'border-secondary/20' },
  { name: 'Grills', icon: <MdSetMeal className="w-6 h-6 sm:w-7 sm:h-7" />, color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-600', borderColor: 'border-green-500/20' },
  { name: 'Drinks', icon: <MdLocalDrink className="w-6 h-6 sm:w-7 sm:h-7" />, color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-600', borderColor: 'border-blue-500/20' },
  { name: 'Small Chops', icon: <MdCookie className="w-6 h-6 sm:w-7 sm:h-7" />, color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-600', borderColor: 'border-pink-500/20' },
];

export default function CategoriesSection() {
  const navigate = useNavigate();
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800">Browse by Category</h2>
          <p className="text-gray-500 mt-2 text-sm">Find exactly what you're craving</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 lg:gap-4">
          {categories.map((cat, i) => (
            <button key={cat.name} onClick={() => navigate('/login')} className={`flex flex-col items-center gap-2 p-3 sm:p-4 lg:p-5 rounded-2xl bg-gradient-to-b ${cat.color} border ${cat.borderColor} hover:shadow-xl hover:scale-[1.03] transition-all duration-300 group active:scale-95`}>
              <div className={`${cat.iconColor} group-hover:scale-110 transition-transform duration-300`}>{cat.icon}</div>
              <span className="text-[11px] sm:text-sm font-medium text-neutral-800 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
