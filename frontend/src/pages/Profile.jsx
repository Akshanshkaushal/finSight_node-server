import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';

export default function Profile() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loan, setLoan] = useState({
    loanType: 'HOME_LOAN',
    principalAmount: 4000000,
    interestRate: 8.2,
    tenureMonths: 180,
    isFloatingRate: true
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.getProfile(userId);
      setProfile(res.data);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!userId) return;
    setMsg('');
    setLoading(true);
    try {
      await api.updateProfile(userId, {
        income: profile.income,
        expenses: profile.expenses,
        riskAppetite: profile.riskAppetite
      });
      setMsg('Profile saved');
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addLoan = async () => {
    if (!userId) return;
    setMsg('');
    setLoading(true);
    try {
      await api.addLoan(userId, loan);
      setMsg('Loan added');
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

  if (!userId) {
    return <p className="text-sm text-slate-600">Login to manage profile.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {profile && (
        <div className="card space-y-3">
          <FormInput
            label="Income"
            type="number"
            value={profile.income}
            onChange={(e) => setProfile({ ...profile, income: e.target.value })}
          />
          <FormInput
            label="Expenses"
            type="number"
            value={profile.expenses}
            onChange={(e) => setProfile({ ...profile, expenses: e.target.value })}
          />
          <FormInput
            label="Risk Appetite"
            value={profile.riskAppetite}
            onChange={(e) => setProfile({ ...profile, riskAppetite: e.target.value })}
          />
          <button className="btn-primary" onClick={saveProfile} disabled={loading}>
            Save Profile
          </button>
        </div>
      )}
      <div className="card space-y-3">
        <h3 className="font-semibold">Add Loan</h3>
        <FormInput
          label="Loan Type"
          value={loan.loanType}
          onChange={(e) => setLoan({ ...loan, loanType: e.target.value })}
        />
        <FormInput
          label="Principal Amount"
          type="number"
          value={loan.principalAmount}
          onChange={(e) => setLoan({ ...loan, principalAmount: e.target.value })}
        />
        <FormInput
          label="Interest Rate"
          type="number"
          value={loan.interestRate}
          onChange={(e) => setLoan({ ...loan, interestRate: e.target.value })}
        />
        <FormInput
          label="Tenure Months"
          type="number"
          value={loan.tenureMonths}
          onChange={(e) => setLoan({ ...loan, tenureMonths: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={loan.isFloatingRate}
            onChange={(e) => setLoan({ ...loan, isFloatingRate: e.target.checked })}
          />
          Floating Rate
        </label>
        <button className="btn-outline" onClick={addLoan} disabled={loading}>
          Add Loan
        </button>
      </div>
    </div>
  );
}

