const TOKEN_KEY = 'admin_token';
const ROLE_KEY = 'admin_role';

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const data = await res.json();
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.role) localStorage.setItem(ROLE_KEY, data.role);
  }
  return data;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || undefined;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export async function me() {
  const token = getToken();
  if (!token) throw new Error('No token');
  const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Unauthenticated');
  return res.json();
}

export function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } as Record<string,string>;
  return fetch(input, { ...init, headers });
}
