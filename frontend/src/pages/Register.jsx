import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { FormInput } from '../components/FormInput';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({ email, password });
      navigate('/login');
    } catch (err) {
      setError(err.data?.error?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4">
        Already have an account? <Link className="text-indigo-600" to="/login">Login</Link>
      </p>
    </div>
  );
}

