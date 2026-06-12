import { createContext, useContext, useState, ReactNode } from 'react';
import { Meal } from '../types';

interface CartItem extends Meal {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (meal: Meal) => void;
  removeItem: (mealId: string) => void;
  updateQuantity: (mealId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (meal: Meal) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === meal.id);
      if (existing) return prev.map(i => i.id === meal.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...meal, quantity: 1 }];
    });
  };

  const removeItem = (mealId: string) => setItems(prev => prev.filter(i => i.id !== mealId));
  const updateQuantity = (mealId: string, qty: number) => {
    if (qty <= 0) { removeItem(mealId); return; }
    setItems(prev => prev.map(i => i.id === mealId ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
