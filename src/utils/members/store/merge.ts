import type { MemberEntry } from '../../../types/member';
import {
  membersAreSamePerson,
  preferLinkedMember,
} from '../memberIdentity';

/** 캐시·원격 병합 — 동일 인물은 discordId 연결된 행 하나로 합침 */
export function mergeMemberLists(cache: MemberEntry[], remote: MemberEntry[]): MemberEntry[] {
  const result: MemberEntry[] = [];

  for (const m of [...cache, ...remote]) {
    const dupIdx = result.findIndex(r => membersAreSamePerson(r, m));
    if (dupIdx < 0) {
      result.push(m);
      continue;
    }
    result[dupIdx] = preferLinkedMember(result[dupIdx], m);
  }

  return result;
}
