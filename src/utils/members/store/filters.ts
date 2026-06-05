import type { MemberEntry } from '../../../types/member';
import { getMemberRowKey, normalizeDiscordUsername } from '../memberIdentity';

export function filterMembersByLink(
  members: MemberEntry[],
  mode: 'all' | 'linked' | 'pending' | 'vip',
): MemberEntry[] {
  if (mode === 'linked') return members.filter(m => Boolean(m.discordId?.trim()));
  if (mode === 'pending') return members.filter(m => !m.discordId?.trim());
  if (mode === 'vip') return members.filter(m => m.isVip);
  return members;
}

export function isUsernameTaken(
  members: MemberEntry[],
  username: string,
  exceptRowKey?: string,
): boolean {
  const target = normalizeDiscordUsername(username);
  return members.some(m => {
    if (exceptRowKey && getMemberRowKey(m) === exceptRowKey) return false;
    return normalizeDiscordUsername(m.username) === target;
  });
}

export function isDiscordIdTaken(
  members: MemberEntry[],
  discordId: string,
  exceptRowKey?: string,
): boolean {
  const id = discordId.trim();
  if (!id) return false;
  return members.some(m => {
    if (exceptRowKey && getMemberRowKey(m) === exceptRowKey) return false;
    return m.discordId === id;
  });
}
