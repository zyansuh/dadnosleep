import type { MemberEntry, MembersBinRecord } from '../../../types/member';
import { findMemberIndex } from '../memberIdentity';

export function patchMemberAt(
  data: MembersBinRecord,
  ref: { discordId?: string; username?: string },
  patch: Partial<MemberEntry>,
): number {
  const idx = findMemberIndex(data.members, ref);
  if (idx < 0) return -1;
  data.members[idx] = { ...data.members[idx], ...patch };
  return idx;
}
