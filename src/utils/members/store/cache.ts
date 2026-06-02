import type { MemberEntry } from '../../../types/member';
import { LS_MEMBERS_CACHE } from './constants';
import { normalizeRecord } from './normalize';

export function readMembersCache(): MemberEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_MEMBERS_CACHE) ?? '[]') as unknown;
    return normalizeRecord(Array.isArray(raw) ? raw : []);
  } catch {
    return [];
  }
}

export function writeMembersCache(members: MemberEntry[]): void {
  try {
    localStorage.setItem(LS_MEMBERS_CACHE, JSON.stringify(members));
  } catch { /* 무시 */ }
}
