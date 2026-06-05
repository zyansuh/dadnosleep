import type { FriendInvite } from '../../types/community';
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
  // eslint-disable-next-line no-control-regex -- 제어 문자 차단(표시 이름·@username 공통)
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

/** Discord 사용자 ID (숫자 snowflake) — 선택 입력 */
export function validateDiscordId(value: string): string | null {
  const id = value.trim();
  if (!id) return null;
  if (!/^\d{15,20}$/.test(id)) {
    return 'Discord ID는 15~20자리 숫자입니다. (프로필 우클릭 → ID 복사)';
  }
  return null;
}

function profileKeys(profile: MemberProfileRef): string[] {
  const keys: string[] = [];
  const u = profile.username?.trim();
  if (u) keys.push(normalizeMemberKey(u));
  const g = profile.globalName?.trim();
  if (g) keys.push(normalizeMemberKey(g));
  return keys;
}

function entryIdentityFields(entry: MemberEntry): string[] {
  return [entry.username, entry.globalName, entry.nickname]
    .map(v => v?.trim())
    .filter((v): v is string => Boolean(v));
}

/** 명단 행이 Discord 로그인 프로필과 같은 사람인지 (@이름 · 표시 이름 · 닉네임 · ID) */
export function memberEntryMatchesProfile(
  entry: MemberEntry,
  profile: { id: string; username: string; global_name?: string | null },
): boolean {
  if (entry.discordId && entry.discordId === profile.id) return true;
  if (entry.username.trim() === profile.id) return true;

  const profileRef: MemberProfileRef = {
    username:   profile.username,
    globalName: profile.global_name,
  };
  const keys = new Set(profileKeys(profileRef));

  for (const field of entryIdentityFields(entry)) {
    if (memberIdentityMatches(field, profileRef)) return true;
    if (keys.has(normalizeMemberKey(field))) return true;
  }
  return false;
}

/** 동일 인물 중복 행 판별 (대기 + 완료가 같이 있을 때) */
export function membersAreSamePerson(a: MemberEntry, b: MemberEntry): boolean {
  if (a.discordId && b.discordId) return a.discordId === b.discordId;
  if (a.discordId && b.username.trim() === a.discordId) return true;
  if (b.discordId && a.username.trim() === b.discordId) return true;

  const aKeys = getMemberCommunityKeys(a);
  for (const k of getMemberCommunityKeys(b)) {
    if (aKeys.has(k)) return true;
  }
  return false;
}

/** discordId가 있는 쪽을 우선해 한 명으로 합침 */
export function preferLinkedMember(a: MemberEntry, b: MemberEntry): MemberEntry {
  const linked = a.discordId ? a : b.discordId ? b : b;
  const other  = linked === a ? b : a;
  return {
    ...linked,
    nickname:  linked.nickname || other.nickname,
    globalName: linked.globalName || other.globalName,
    isVip:     linked.isVip || other.isVip,
    joinedAt:  linked.joinedAt || other.joinedAt,
  };
}

export function findMemberIndex(
  members: MemberEntry[],
  ref: { discordId?: string; username?: string; globalName?: string | null },
): number {
  if (ref.discordId) {
    const byId = members.findIndex(m => m.discordId === ref.discordId);
    if (byId >= 0) return byId;
    const byStoredId = members.findIndex(m => m.username.trim() === ref.discordId);
    if (byStoredId >= 0) return byStoredId;
  }

  if (ref.discordId || ref.username?.trim() || ref.globalName?.trim()) {
    const profile = {
      id:           ref.discordId ?? '',
      username:     ref.username?.trim() ?? '',
      global_name:  ref.globalName,
    };
    const idx = members.findIndex(m => memberEntryMatchesProfile(m, profile));
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

/** 후기·초대 신고 매칭용 — @username, 표시 이름, 사이트 닉네임 */
export function getMemberCommunityKeys(m: MemberEntry): Set<string> {
  const keys = new Set<string>();
  const add = (v: string | undefined | null) => {
    const t = v?.trim();
    if (t) keys.add(normalizeMemberKey(t));
  };
  add(m.username);
  add(m.globalName);
  add(m.nickname);
  return keys;
}

export function nicknameMatchesMemberKeys(keys: Set<string>, nickname: string): boolean {
  const t = nickname?.trim();
  if (!t) return false;
  return keys.has(normalizeMemberKey(t));
}

export function inviteMatchesMemberKeys(keys: Set<string>, inv: FriendInvite): boolean {
  if (nicknameMatchesMemberKeys(keys, inv.nickname)) return true;
  if (inv.inviteeNickname?.trim() && nicknameMatchesMemberKeys(keys, inv.inviteeNickname)) {
    return true;
  }
  return false;
}
