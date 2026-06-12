export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  isDefault: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  finalTotal: number;
  status: string;
  deliveryAddress: Address;
  deliveryNote: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  mealId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Favorite {
  id: number;
  userId: string;
  mealId: string;
  mealData: any;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: number;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  discount: number;
  isNew: number;
}
