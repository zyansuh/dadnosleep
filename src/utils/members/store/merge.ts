import type { MemberEntry } from '../../../types/member';
import { getMemberRowKey } from '../memberIdentity';

/** 캐시·원격 병합 (동일 rowKey는 나중 목록 우선 = 원격 우선) */
export function mergeMemberLists(cache: MemberEntry[], remote: MemberEntry[]): MemberEntry[] {
  const map = new Map<string, MemberEntry>();
  for (const m of cache) map.set(getMemberRowKey(m), m);
  for (const m of remote) map.set(getMemberRowKey(m), m);
  return [...map.values()];
}
