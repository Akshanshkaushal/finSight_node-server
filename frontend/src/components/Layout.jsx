import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/news', label: 'News' },
  { to: '/advisories', label: 'Advisories' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/subscription', label: 'Subscription' },
  { to: '/payments', label: 'Payments' }
];

export function Layout({ children }) {
  const { token, clearSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const active = (path) => location.pathname.startsWith(path);

  const onLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-indigo-600">FinSight</Link>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium px-3 py-2 rounded-lg ${active(item.to) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {token ? (
              <button onClick={onLogout} className="btn-outline text-sm">Logout</button>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

