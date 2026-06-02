import type { MemberEntry } from '../../../types/member';
import { findMemberIndex } from '../memberIdentity';

export function findMemberByDiscordId(
  members: MemberEntry[],
  discordId: string,
): MemberEntry | undefined {
  const idx = findMemberIndex(members, { discordId });
  return idx >= 0 ? members[idx] : undefined;
}

export function findMemberByUsername(
  members: MemberEntry[],
  username: string,
): MemberEntry | undefined {
  const idx = findMemberIndex(members, { username });
  return idx >= 0 ? members[idx] : undefined;
}

export function isDiscordIdInMembers(discordId: string, members: MemberEntry[]): boolean {
  return findMemberIndex(members, { discordId }) >= 0;
}
