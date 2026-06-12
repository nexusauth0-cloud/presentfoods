import { useState, useEffect } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { api } from '../api/client';
import { Notification } from '../types';

const typeIcons: Record<string, string> = { order: '🛵', promotion: '🎉', discount: '💰', general: '📢', admin_order: '⚡' };

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications.list().then(data => setNotifications(data.notifications)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try { await api.notifications.markRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n)); } catch {}
  };

  const markAllRead = async () => {
    try { await api.notifications.markAllRead(); setNotifications(prev => prev.map(n => ({ ...n, read: 1 }))); } catch {}
  };

  if (loading) return <div className="flex justify-center py-16"><span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm">{unread > 0 ? `${unread} unread` : 'No unread notifications'}</p>
        </div>
        {unread > 0 && <button onClick={markAllRead} className="text-sm text-primary font-medium hover:underline">Mark all as read</button>}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 ${!n.read ? 'border-l-4 border-primary' : ''}`}>
              <span className="text-xl">{typeIcons[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'text-neutral-800' : 'font-semibold text-neutral-800'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors"><FiCheck className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
