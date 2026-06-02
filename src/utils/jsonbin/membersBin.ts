import type { Review, PointRecord, FriendInvite } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { getJsonBinAccessKey, getMembersBinId, usesSharedCommunityBinForMembers } from './jsonbinEnv';
import { fetchJsonBinRecord } from './fetch';
import { putJsonBinRecord } from './put';
import { putCommunityBinRecord } from './communityPut';
import { extractMembersFromRecord } from './extractMembers';

/** 회원 명단 저장 — 전용 Bin이면 { members } 만, 공유 Bin이면 reviews/points 유지 */
export async function saveMembersRecord(members: MemberEntry[]): Promise<void> {
  const binId = getMembersBinId();
  if (!binId || !getJsonBinAccessKey()) {
    throw new Error('저장소가 연결되지 않았습니다. 운영 담당자에게 문의해 주세요.');
  }

  if (usesSharedCommunityBinForMembers()) {
    const existing = await fetchJsonBinRecord(binId);
    await putCommunityBinRecord(binId, {
      reviews:       Array.isArray(existing.reviews) ? existing.reviews as Review[] : [],
      points:        Array.isArray(existing.points) ? existing.points as PointRecord[] : [],
      friendInvites: Array.isArray(existing.friendInvites)
        ? existing.friendInvites as FriendInvite[]
        : [],
      pointsCleared: existing.pointsCleared,
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
  return extractMembersFromRecord(record);
}
