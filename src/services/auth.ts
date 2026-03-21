const TOKEN_KEY = 'admin_token';
const ROLE_KEY = 'admin_role';

function decodeJwt(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

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

  const data = await res.json().catch(() => ({}));
  const token = data.token || null;
  // determine role: prefer explicit response, fallback to token payload
  const role = data.role || (token ? decodeJwt(token)?.role : undefined);

  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);

  return { ...data, token, role };
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored) return stored;
  const token = getToken();
  if (!token) return undefined;
  const decoded = decodeJwt(token);
  return decoded?.role || undefined;
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
