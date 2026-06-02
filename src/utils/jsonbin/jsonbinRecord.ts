import type { Review, PointRecord, FriendInvite } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { getJsonBinAccessKey, getMembersBinId, usesSharedCommunityBinForMembers } from './jsonbinEnv';

export interface JsonBinFullRecord {
  reviews?:       Review[];
  points?:        PointRecord[];
  friendInvites?: FriendInvite[];
  members?:       MemberEntry[];
}

function classifyStatus(status: number): string {
  if (status === 401) return '저장소 접근에 실패했습니다. 운영 담당자에게 문의해 주세요.';
  if (status === 404) return '저장소를 찾을 수 없습니다. 운영 담당자에게 문의해 주세요.';
  return '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

export async function fetchJsonBinRecord(binId: string): Promise<JsonBinFullRecord> {
  const key = getJsonBinAccessKey();
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Access-Key': key },
  });
  if (!res.ok) {
    throw new Error(classifyStatus(res.status));
  }
  const json = await res.json() as { record?: JsonBinFullRecord };
  return json.record ?? {};
}

export async function putJsonBinRecord(binId: string, record: JsonBinFullRecord): Promise<void> {
  const key = getJsonBinAccessKey();
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': key,
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    throw new Error(classifyStatus(res.status));
  }
}

/** 회원 명단 저장 — 전용 Bin이면 { members } 만, 공유 Bin이면 reviews/points 유지 */
export async function saveMembersRecord(members: MemberEntry[]): Promise<void> {
  const binId = getMembersBinId();
  if (!binId || !getJsonBinAccessKey()) {
    throw new Error('저장소가 연결되지 않았습니다. 운영 담당자에게 문의해 주세요.');
  }

  if (usesSharedCommunityBinForMembers()) {
    const existing = await fetchJsonBinRecord(binId);
    await putJsonBinRecord(binId, {
      reviews:       Array.isArray(existing.reviews) ? existing.reviews : [],
      points:        Array.isArray(existing.points) ? existing.points : [],
      friendInvites: Array.isArray(existing.friendInvites) ? existing.friendInvites : [],
      members,
    });
    return;
  }

  await putJsonBinRecord(binId, { members });
}

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

export async function loadMembersFromBin(): Promise<MemberEntry[]> {
  const binId = getMembersBinId();
  if (!binId || !getJsonBinAccessKey()) return [];

  const record = await fetchJsonBinRecord(binId);
  return extractMembersFromRecord(record);
}
