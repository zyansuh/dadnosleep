import type { UserRole } from '../types/role';
import { resolveNickname } from './nickname';

const SS_LOGGED_IN   = 'isLoggedIn';
const SS_DISCORD_ID  = 'discordId';
const SS_USERNAME    = 'username';
const SS_GLOBAL_NAME = 'globalName';
const SS_NICKNAME    = 'nickname';
const SS_AVATAR      = 'avatar';
const SS_ROLE        = 'role';
const SS_ADMIN       = 'isAdmin';

export interface DiscordSessionUser {
  discordId:   string;
  username:    string;
  globalName:  string | null;
  nickname:    string | null;
  avatar:      string | null;
  role:        UserRole;
}

export function discordAvatarUrl(userId: string, avatar: string | null): string {
  if (avatar) {
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=64`;
  }
  const disc = Number(BigInt(userId) >> 22n) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${disc}.png`;
}

function parseRole(raw: string | null): UserRole {
  if (raw === 'admin' || raw === 'member' || raw === 'guest') return raw;
  return 'guest';
}

export function getDiscordSession(): DiscordSessionUser | null {
  try {
    if (sessionStorage.getItem(SS_LOGGED_IN) !== 'true') return null;
    const discordId = sessionStorage.getItem(SS_DISCORD_ID);
    const username  = sessionStorage.getItem(SS_USERNAME);
    if (!discordId || !username) return null;
    const globalName = sessionStorage.getItem(SS_GLOBAL_NAME);
    const nickname   = sessionStorage.getItem(SS_NICKNAME);
    const avatar     = sessionStorage.getItem(SS_AVATAR);
    const role       = parseRole(sessionStorage.getItem(SS_ROLE));
    return {
      discordId,
      username,
      globalName: globalName && globalName !== '' ? globalName : null,
      nickname:   nickname && nickname !== '' ? nickname : null,
      avatar:     avatar && avatar !== '' ? avatar : null,
      role,
    };
  } catch {
    return null;
  }
}

export function getSessionRole(): UserRole {
  const session = getDiscordSession();
  if (session) return session.role;
  return 'guest';
}

export function isDiscordLoggedIn(): boolean {
  return getDiscordSession() !== null;
}

export function saveDiscordSession(
  user: {
    id:           string;
    username:     string;
    global_name?: string | null;
    avatar?:      string | null;
  },
  role: UserRole,
  nickname: string,
): void {
  try {
    sessionStorage.setItem(SS_LOGGED_IN, 'true');
    sessionStorage.setItem(SS_DISCORD_ID, user.id);
    sessionStorage.setItem(SS_USERNAME, user.username);
    sessionStorage.setItem(SS_GLOBAL_NAME, user.global_name ?? '');
    sessionStorage.setItem(SS_NICKNAME, nickname);
    sessionStorage.setItem(SS_AVATAR, user.avatar ?? '');
    sessionStorage.setItem(SS_ROLE, role);
    sessionStorage.setItem(SS_ADMIN, role === 'admin' ? 'true' : 'false');
  } catch { /* 무시 */ }
}

export function setSessionNickname(nickname: string): void {
  try {
    sessionStorage.setItem(SS_NICKNAME, nickname);
  } catch { /* 무시 */ }
}

export function clearDiscordSession(): void {
  try {
    sessionStorage.clear();
  } catch { /* 무시 */ }
}

export function getDisplayName(user: DiscordSessionUser): string {
  return resolveNickname(user.nickname, user.globalName, user.username);
}
