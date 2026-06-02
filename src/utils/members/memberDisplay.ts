import type { MemberEntry } from '../../types/member';

export function formatJoinedAt(iso: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

export function displayMemberNickname(m: MemberEntry): string {
  return m.nickname?.trim() || m.globalName?.trim() || m.username || '—';
}

export function isMemberLinked(m: MemberEntry): boolean {
  return Boolean(m.discordId?.trim());
}
