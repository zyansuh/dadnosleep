import type { MemberEntry } from '../../types/member';

/** JSONBin record에서 members 배열 추출 (스키마 호환) */
export function extractMembersFromRecord(record: unknown): MemberEntry[] {
  if (Array.isArray(record)) {
    return record as MemberEntry[];
  }
  if (!record || typeof record !== 'object') return [];
  const o = record as Record<string, unknown>;
  const candidates = [o.members, o.users, o.whitelist];
  for (const raw of candidates) {
    if (Array.isArray(raw)) return raw as MemberEntry[];
  }
  return [];
}
