import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Notifications() {
  const { userId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.listNotifications(userId);
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <button className="btn-primary" onClick={load} disabled={loading || !userId}>Refresh</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((n) => (
          <div key={n.notificationId} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{n.subject}</h3>
              <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{n.notificationType}</span>
            </div>
            <p className="text-sm text-slate-700 mt-2">{n.message}</p>
            <div className="text-xs text-slate-500 mt-2">Priority: {n.priority}</div>
            <div className="text-xs text-slate-500">Status: {n.status}</div>
          </div>
        ))}
      </div>
      {!items.length && <p className="text-sm text-slate-600">No notifications yet.</p>}
    </div>
  );
}

