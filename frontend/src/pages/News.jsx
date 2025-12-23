import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listNews();
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchNow = async () => {
    setMsg('');
    setLoading(true);
    try {
      const res = await api.fetchNews();
      setMsg(res.message || 'Fetched');
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">News</h1>
        <button className="btn-primary" onClick={fetchNow} disabled={loading}>Fetch now</button>
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((n) => (
          <div key={n.newsId || n._id} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{n.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700">{n.category}</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">{n.content}</p>
            <div className="text-xs text-slate-500 mt-2">Impact: {n.impactLevel}</div>
          </div>
        ))}
      </div>
      {!items.length && <p className="text-sm text-slate-600">No news yet.</p>}
    </div>
  );
}

