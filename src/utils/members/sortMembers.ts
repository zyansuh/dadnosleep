import type { MemberEntry } from '../../types/member';

export function sortMembersByJoinedDesc(members: MemberEntry[]): MemberEntry[] {
  return [...members].sort(
    (a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime(),
  );
}
