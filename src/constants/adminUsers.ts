/** Discord @username 기준 관리자 (코드 상수 — env 미설정 시 사용) */
export const DEFAULT_ADMIN_DISCORD_USERS = ['1000hyehyang1', 'sweet__rain'] as const;

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/** VITE_ADMIN_DISCORD_USERS(쉼표 구분) 또는 DEFAULT 목록 */
export function getAdminDiscordUsernames(): readonly string[] {
  const fromEnv = parseList(import.meta.env.VITE_ADMIN_DISCORD_USERS as string | undefined);
  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_ADMIN_DISCORD_USERS;
}

export function isAdminDiscordUsername(username: string): boolean {
  const key = username.trim().toLowerCase();
  return getAdminDiscordUsernames().some(u => u.toLowerCase() === key);
}
