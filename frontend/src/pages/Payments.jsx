import { useState } from 'react';
import { api } from '../api/client';

export default function Payments() {
  const [amount, setAmount] = useState(999);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.createPayment({ amount: Number(amount), paymentMethod: 'card' });
      const sessionUrl = res.data?.sessionUrl;
      if (sessionUrl) {
        window.location.href = sessionUrl; // redirect to Stripe Checkout
      } else {
        setError('No checkout session URL returned');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Payments (Stripe Checkout)</h1>
      <div className="card space-y-3">
        <label className="text-sm text-slate-700">
          Amount (USD)
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button className="btn-primary" onClick={pay} disabled={loading}>
          {loading ? 'Redirecting...' : 'Pay with Stripe'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

