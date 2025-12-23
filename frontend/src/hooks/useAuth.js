import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  const saveSession = (t, uid) => {
    api.setToken(t);
    localStorage.setItem('userId', uid);
    setToken(t);
    setUserId(uid);
  };

  const clearSession = () => {
    api.clearToken();
    setToken(null);
    setUserId(null);
  };

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserId(localStorage.getItem('userId'));
  }, []);

  return { token, userId, saveSession, clearSession };
}

