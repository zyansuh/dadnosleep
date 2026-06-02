/** Discord username 기준 관리자 (환경변수 대신 코드 상수) */
export const ADMIN_USERS = ['1000hyehyang1', 'sweet__rain'] as const;

export function isAdminDiscordUsername(username: string): boolean {
  return (ADMIN_USERS as readonly string[]).includes(username);
}
