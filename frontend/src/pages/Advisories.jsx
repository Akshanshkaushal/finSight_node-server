import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Advisories() {
  const { userId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.listAdvisories(userId);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setItems(list);
      if (!list.length) {
        setMsg('No advisories yet. Generate advisories via the finance engine or API.');
      } else {
        setMsg('');
      }
    } catch (e) {
      setMsg(e.message || 'Failed to load advisories');
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
        <h1 className="text-xl font-semibold">Advisories</h1>
        <button className="btn-primary" onClick={load} disabled={loading || !userId}>
          Refresh
        </button>
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((a) => (
          <div key={a.advisoryId} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Risk: {a.riskLevel}</h3>
              <span className="text-xs text-slate-500">Score {a.riskScore}</span>
            </div>
            <p className="text-sm text-slate-700 mt-2">{a.advice}</p>
            <div className="text-xs text-slate-500 mt-2">News: {a.newsIds?.join(', ')}</div>
          </div>
        ))}
      </div>
      {!items.length && !loading && <p className="text-sm text-slate-600">No advisories yet.</p>}
    </div>
  );
}

