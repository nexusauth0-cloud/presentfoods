const BASE = import.meta.env.VITE_API_URL || '/api';

function token(): string | null {
  return localStorage.getItem('pf-token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    signup: (name: string, email: string, password: string, adminCode?: string) => request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password, adminCode }) }),
    me: () => request('/auth/me'),
    updateProfile: (data: { name?: string; phone?: string }) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  meals: {
    list: (category?: string) => request(`/meals${category ? `?category=${category}` : ''}`),
    get: (id: string) => request(`/meals/${id}`),
    categories: () => request('/meals/categories'),
  },
  orders: {
    list: () => request('/orders'),
    get: (id: string) => request(`/orders/${id}`),
    create: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: string) => request(`/orders/${id}/cancel`, { method: 'PATCH' }),
  },
  favorites: {
    list: () => request('/favorites'),
    add: (mealId: string, mealData: any) => request(`/favorites/${mealId}`, { method: 'POST', body: JSON.stringify({ mealData }) }),
    remove: (mealId: string) => request(`/favorites/${mealId}`, { method: 'DELETE' }),
  },
  addresses: {
    list: () => request('/addresses'),
    create: (data: any) => request('/addresses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/addresses/${id}`, { method: 'DELETE' }),
  },
  notifications: {
    list: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
    unreadCount: () => request('/notifications/unread-count'),
  },
  wallet: {
    get: () => request('/wallet'),
    initialize: (amount: number) => request('/wallet/initialize', { method: 'POST', body: JSON.stringify({ amount }) }),
    verify: (ref: string) => request(`/wallet/verify/${ref}`),
  },
  payments: {
    initialize: (email: string, amount: number, callbackUrl?: string) => request('/payments/initialize', { method: 'POST', body: JSON.stringify({ email, amount, callbackUrl }) }),
  },
  admin: {
    createMeal: (data: any) => request('/admin/meals', { method: 'POST', body: JSON.stringify(data) }),
    updateMeal: (id: string, data: any) => request(`/admin/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMeal: (id: string) => request(`/admin/meals/${id}`, { method: 'DELETE' }),
    listOrders: () => request('/admin/orders'),
    updateOrderStatus: (id: string, status: string) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    listUsers: () => request('/admin/users'),
    updateUserRole: (id: string, role: string) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  },
};
