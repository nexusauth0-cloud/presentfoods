import { createContext, useContext, useState, ReactNode } from 'react';
import { Meal } from '../types';

interface FavoritesContextType {
  favorites: Meal[];
  toggleFavorite: (meal: Meal) => void;
  isFavorite: (mealId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Meal[]>([]);

  const toggleFavorite = (meal: Meal) => {
    setFavorites(prev => prev.find(f => f.id === meal.id) ? prev.filter(f => f.id !== meal.id) : [...prev, meal]);
  };

  const isFavorite = (mealId: string) => !!favorites.find(f => f.id === mealId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
