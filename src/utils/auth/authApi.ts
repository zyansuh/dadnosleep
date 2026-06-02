import type { AuthUser } from '../../types/auth';

const LS_TOKEN = 'dadnosleep-auth-token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(LS_TOKEN);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);
  } catch { /* 무시 */ }
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...init, headers });
  const json = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error(json.error || `요청 실패 (${res.status})`);
  return json;
}

export async function apiRegister(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  return authFetch('/api/auth/register', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
}

export async function apiLogin(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  return authFetch('/api/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
}

export async function apiMe(): Promise<{ user: AuthUser }> {
  return authFetch('/api/auth/me', { method: 'GET' });
}
