import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { api } from '../../api/client';
import { Meal } from '../../types';

export default function HeroSection() {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');

  const handleAiSuggest = () => {
    if (!aiQuery.trim()) return;
    const suggestions = [
      "We recommend our Jollof Rice & Chicken with a side of Zobo Drink!",
      "Try our Egusi Soup & Pounded Yam - a fan favorite!",
      "Perfect for today: Fried Rice & Chicken with Chapman Mocktail!",
      "How about our Pepper Soup with Catfish to warm you up?",
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  return (
    <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/80 to-black/75" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/25 shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Now delivering in your area
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
            Authentic{' '}<span className="text-amber-300">Nigerian Cuisine</span>{' '}Delivered to Your Doorstep
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-100 mt-4 max-w-xl leading-relaxed">
            Experience the rich, bold flavors of Nigeria with every bite. Freshly prepared meals delivered hot and fast.
          </p>
          <div className="flex flex-wrap gap-3 mt-8 sm:mt-10">
            <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-xl text-sm lg:text-base">
              Order Now <FiArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-full hover:bg-white/30 transition-all border border-white/30 shadow-lg text-sm lg:text-base">
              View Menu
            </button>
          </div>
          <div className="mt-8 sm:mt-10 bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 max-w-lg shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <MdAutoAwesome className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium text-xs sm:text-sm">AI Meal Suggestion</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="What are you craving today?" className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={e => e.key === 'Enter' && handleAiSuggest()} />
              </div>
              <button onClick={handleAiSuggest} className="px-5 sm:px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all text-sm font-medium whitespace-nowrap shadow-md">Suggest</button>
            </div>
            {aiSuggestion && <div className="mt-3 bg-white/15 backdrop-blur-sm rounded-xl p-3 text-sm text-white border border-white/10"><span className="text-yellow-300 font-medium">AI: </span>{aiSuggestion}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
