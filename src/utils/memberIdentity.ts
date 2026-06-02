import type { MemberEntry } from '../types/member';

/** Discord username 비교용 (대소문자 무시) */
export function normalizeDiscordUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateDiscordUsername(value: string): string | null {
  const u = value.trim();
  if (u.length < 2) return 'Discord 사용자명은 2자 이상이어야 합니다.';
  if (u.length > 32) return 'Discord 사용자명은 32자 이하여야 합니다.';
  if (!/^[a-zA-Z0-9_.]+$/.test(u)) {
    return 'Discord 사용자명은 영문, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.';
  }
  return null;
}

/** 목록 행 식별자 (React key · 편집 상태) */
export function getMemberRowKey(m: MemberEntry): string {
  if (m.discordId) return `id:${m.discordId}`;
  return `user:${normalizeDiscordUsername(m.username)}`;
}

export function findMemberIndex(
  members: MemberEntry[],
  ref: { discordId?: string; username?: string },
): number {
  if (ref.discordId) {
    const byId = members.findIndex(m => m.discordId === ref.discordId);
    if (byId >= 0) return byId;
  }
  if (ref.username?.trim()) {
    const target = normalizeDiscordUsername(ref.username);
    return members.findIndex(m => normalizeDiscordUsername(m.username) === target);
  }
  return -1;
}

export function findMember(
  members: MemberEntry[],
  ref: { discordId?: string; username?: string },
): MemberEntry | undefined {
  const idx = findMemberIndex(members, ref);
  return idx >= 0 ? members[idx] : undefined;
}

export function isWhitelistedMember(
  members: MemberEntry[],
  profile: { id: string; username: string },
): boolean {
  return findMemberIndex(members, { discordId: profile.id, username: profile.username }) >= 0;
}
