import type { MemberEntry } from '../../../types/member';
import { normalizeMemberIsVip } from '../memberVip';

export function todayJoinedAt(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEntry(raw: unknown): MemberEntry | null {
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim();
    if (/^\d{17,20}$/.test(s)) {
      return {
        discordId:  s,
        username:   '',
        globalName: '',
        nickname:   '',
        avatar:     '',
        role:       'member',
        joinedAt:   todayJoinedAt(),
        isVip:      true,
      };
    }
    return {
      discordId:  '',
      username:   s,
      globalName: '',
      nickname:   '',
      avatar:     '',
      role:       'member',
      joinedAt:   todayJoinedAt(),
      isVip:      true,
    };
  }
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const discordId = typeof o.discordId === 'string' ? o.discordId.trim() : '';
  const username  = typeof o.username === 'string' ? o.username.trim() : '';
  if (!discordId && !username) return null;

  const globalName = typeof o.globalName === 'string'
    ? o.globalName
    : typeof o.global_name === 'string'
      ? o.global_name
      : '';
  const nickname = typeof o.nickname === 'string' ? o.nickname : '';
  const avatar   = typeof o.avatar === 'string' ? o.avatar : '';
  const joinedAt = typeof o.joinedAt === 'string'
    ? o.joinedAt
    : typeof o.addedAt === 'string'
      ? o.addedAt.slice(0, 10)
      : todayJoinedAt();

  return {
    discordId,
    username,
    globalName,
    nickname,
    avatar,
    role: 'member',
    joinedAt,
    isVip: normalizeMemberIsVip(o),
  };
}

export function normalizeRecord(membersRaw: unknown[]): MemberEntry[] {
  return membersRaw
    .map(normalizeEntry)
    .filter((e): e is MemberEntry => e !== null);
}
