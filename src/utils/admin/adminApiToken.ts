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

export function adminAuthHeaders(): HeadersInit {
  const token = getAdminApiToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
