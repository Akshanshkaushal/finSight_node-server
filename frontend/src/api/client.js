const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const defaultHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  setToken(token) {
    localStorage.setItem('token', token);
  },
  clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },
  async register(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handle(res);
  },
  async login(payload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handle(res);
  },
  async getProfile(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async updateProfile(userId, payload) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders() },
      body: JSON.stringify(payload)
    });
    return handle(res);
  },
  async addLoan(userId, payload) {
    const res = await fetch(`${API_BASE}/users/${userId}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders() },
      body: JSON.stringify(payload)
    });
    return handle(res);
  },
  async fetchNews() {
    const res = await fetch(`${API_BASE}/news/fetch`, {
      method: 'POST',
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async listNews() {
    const res = await fetch(`${API_BASE}/news?limit=20`, {
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async generateAdvisory(payload) {
    const res = await fetch(`${API_BASE}/advisories/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders() },
      body: JSON.stringify(payload)
    });
    return handle(res);
  },
  async listAdvisories(userId) {
    const res = await fetch(`${API_BASE}/advisories/${userId}`, {
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async listNotifications(userId) {
    const res = await fetch(`${API_BASE}/notifications/${userId}`, {
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async getSubscription(userId) {
    const res = await fetch(`${API_BASE}/subscriptions/${userId}`, {
      headers: { ...defaultHeaders() }
    });
    return handle(res);
  },
  async upgradeSubscription(userId, paymentId) {
    const res = await fetch(`${API_BASE}/subscriptions/${userId}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders() },
      body: JSON.stringify({ paymentId })
    });
    return handle(res);
  },
  async createPayment(payload) {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...defaultHeaders() },
      body: JSON.stringify(payload)
    });
    return handle(res);
  }
};

