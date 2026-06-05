const SS_ADMIN_API_TOKEN = 'dadnosleep-admin-api-token';

export function getAdminApiToken(): string | null {
  try {
    return sessionStorage.getItem(SS_ADMIN_API_TOKEN);
  } catch {
    return null;
  }
}

export function setAdminApiToken(token: string): void {
  try {
    sessionStorage.setItem(SS_ADMIN_API_TOKEN, token);
  } catch { /* 무시 */ }
}

export function clearAdminApiToken(): void {
  try {
    sessionStorage.removeItem(SS_ADMIN_API_TOKEN);
  } catch { /* 무시 */ }
}

export async function fetchPasswordAdminToken(password: string): Promise<string> {
  const res = await fetch('/api/admin/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ password }),
  });
  const data = await res.json() as { token?: string; error?: string };
  if (!res.ok || !data.token) {
    throw new Error(data.error ?? '관리자 인증에 실패했습니다.');
  }
  return data.token;
}

export function adminAuthHeaders(): HeadersInit {
  const token = getAdminApiToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
