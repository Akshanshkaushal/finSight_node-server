import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import News from './pages/News';
import Advisories from './pages/Advisories';
import Notifications from './pages/Notifications';
import Subscription from './pages/Subscription';
import Payments from './pages/Payments';
import './index.css';
import { useAuth } from './hooks/useAuth';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <News />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/news"
                  element={
                    <PrivateRoute>
                      <News />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/advisories"
                  element={
                    <PrivateRoute>
                      <Advisories />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <PrivateRoute>
                      <Subscription />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <PrivateRoute>
                      <Payments />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/news" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

