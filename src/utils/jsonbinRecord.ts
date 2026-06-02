import type { Review, PointRecord } from '../types/community';
import type { MemberEntry } from '../types/member';
import { getJsonBinAccessKey, getMembersBinId, usesSharedCommunityBinForMembers } from './jsonbinEnv';

export interface JsonBinFullRecord {
  reviews?:  Review[];
  points?:   PointRecord[];
  members?:  MemberEntry[];
}

function classifyStatus(status: number): string {
  if (status === 401) return 'Access Key가 유효하지 않거나 Bin 권한이 없습니다.';
  if (status === 404) return 'Bin을 찾을 수 없습니다.';
  return `JSONBin 오류 (${status})`;
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
    throw new Error('JSONBin Access Key 또는 Bin ID가 설정되지 않았습니다.');
  }

  if (usesSharedCommunityBinForMembers()) {
    const existing = await fetchJsonBinRecord(binId);
    await putJsonBinRecord(binId, {
      reviews: Array.isArray(existing.reviews) ? existing.reviews : [],
      points:  Array.isArray(existing.points) ? existing.points : [],
      members,
    });
    return;
  }

  await putJsonBinRecord(binId, { members });
}

export async function loadMembersFromBin(): Promise<MemberEntry[]> {
  const binId = getMembersBinId();
  if (!binId || !getJsonBinAccessKey()) return [];

  const record = await fetchJsonBinRecord(binId);
  const membersRaw = record.members;
  if (!Array.isArray(membersRaw)) return [];
  return membersRaw;
}
