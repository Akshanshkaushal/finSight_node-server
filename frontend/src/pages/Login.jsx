import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from '../components/FormInput';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      saveSession(res.data.accessToken, res.data.userId);
      navigate('/news');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FormInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4">
        No account? <Link className="text-indigo-600" to="/register">Register</Link>
      </p>
    </div>
  );
}

