import type { MemberEntry } from '../../types/member';

/** 명단·로그인 매칭용 (대소문자 무시) */
export function normalizeMemberKey(value: string): string {
  return value.trim().toLocaleLowerCase('en-US');
}

/** @deprecated normalizeMemberKey 사용 */
export const normalizeDiscordUsername = normalizeMemberKey;

const IDENTITY_FORBIDDEN = ['@', '#', ':', '```'] as const;
const IDENTITY_RESERVED = new Set(['everyone', 'here']);

/**
 * 회원 명단 등록 식별자 검증.
 * Discord @사용자명(a-z, 0-9, _, .)뿐 아니라 표시 이름(한글·이모지 등)도 허용합니다.
 */
export function validateMemberIdentity(value: string): string | null {
  const u = value.trim();
  if (u.length < 2) return '식별 이름은 2자 이상이어야 합니다.';
  if (u.length > 32) return '식별 이름은 32자 이하여야 합니다.';
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(u)) {
    return '사용할 수 없는 제어 문자가 포함되어 있습니다.';
  }
  for (const bad of IDENTITY_FORBIDDEN) {
    if (u.includes(bad)) return `${bad} 문자는 사용할 수 없습니다.`;
  }
  if (IDENTITY_RESERVED.has(normalizeMemberKey(u))) {
    return '사용할 수 없는 이름입니다.';
  }
  return null;
}

/** validateMemberIdentity 와 동일 */
export function validateDiscordUsername(value: string): string | null {
  return validateMemberIdentity(value);
}

export interface MemberProfileRef {
  username:   string;
  globalName?: string | null;
}

/** 저장된 명단 값이 로그인 프로필(@username 또는 표시 이름)과 같은 사람인지 */
export function memberIdentityMatches(
  storedKey: string,
  profile: MemberProfileRef,
): boolean {
  const target = normalizeMemberKey(storedKey);
  if (!target) return false;
  if (normalizeMemberKey(profile.username) === target) return true;
  const display = profile.globalName?.trim();
  if (display && normalizeMemberKey(display) === target) return true;
  return false;
}

/** 목록 행 식별자 (React key · 편집 상태) */
export function getMemberRowKey(m: MemberEntry): string {
  if (m.discordId) return `id:${m.discordId}`;
  return `user:${normalizeMemberKey(m.username)}`;
}

export function findMemberIndex(
  members: MemberEntry[],
  ref: { discordId?: string; username?: string; globalName?: string | null },
): number {
  if (ref.discordId) {
    const byId = members.findIndex(m => m.discordId === ref.discordId);
    if (byId >= 0) return byId;
  }

  if (ref.username?.trim() || ref.globalName?.trim()) {
    const profile: MemberProfileRef = {
      username:   ref.username?.trim() ?? '',
      globalName: ref.globalName,
    };
    const idx = members.findIndex(m => memberIdentityMatches(m.username, profile));
    if (idx >= 0) return idx;
  }

  if (ref.username?.trim()) {
    const target = normalizeMemberKey(ref.username);
    return members.findIndex(m => normalizeMemberKey(m.username) === target);
  }

  return -1;
}

export function findMemberIndexForProfile(
  members: MemberEntry[],
  profile: { id: string; username: string; global_name?: string | null },
): number {
  return findMemberIndex(members, {
    discordId:  profile.id,
    username:   profile.username,
    globalName: profile.global_name,
  });
}

export function findMember(
  members: MemberEntry[],
  ref: { discordId?: string; username?: string; globalName?: string | null },
): MemberEntry | undefined {
  const idx = findMemberIndex(members, ref);
  return idx >= 0 ? members[idx] : undefined;
}

export function isWhitelistedMember(
  members: MemberEntry[],
  profile: { id: string; username: string; global_name?: string | null },
): boolean {
  return findMemberIndexForProfile(members, profile) >= 0;
}
