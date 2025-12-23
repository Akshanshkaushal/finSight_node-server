import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Subscription() {
  const { userId } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.getSubscription(userId);
      setSubscription(res.data);
    } finally {
      setLoading(false);
    }
  };

  const upgrade = async () => {
    if (!userId) return;
    setMsg('');
    setLoading(true);
    try {
      // create mock payment first
      const pay = await api.createPayment({ amount: 999, paymentMethod: 'credit_card' });
      const paymentId = pay.data.paymentId;
      await api.upgradeSubscription(userId, paymentId);
      setMsg('Upgraded to PREMIUM');
      await load();
    } catch (e) {
      setMsg(e.message);
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
        <h1 className="text-xl font-semibold">Subscription</h1>
        <button className="btn-primary" onClick={upgrade} disabled={loading || !userId}>
          Upgrade to Premium
        </button>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {subscription ? (
        <div className="card">
          <div className="text-sm text-slate-500">Plan</div>
          <div className="text-lg font-semibold">{subscription.plan}</div>
          <div className="text-sm text-slate-500 mt-2">Status: {subscription.status}</div>
          {subscription.expiresAt && (
            <div className="text-sm text-slate-500">Expires: {subscription.expiresAt}</div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600">No subscription info.</p>
      )}
    </div>
  );
}

