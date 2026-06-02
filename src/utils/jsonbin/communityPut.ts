import type { Review, PointRecord, FriendInvite } from '../../types/community';
import type { MemberEntry } from '../../types/member';
import { fetchJsonBinRecord } from './fetch';
import { putJsonBinRecord } from './put';
import { extractMembersFromRecord } from './extractMembers';
import type { JsonBinFullRecord } from './types';

/** 공유 Bin 저장 시 기존 members·pointsCleared 유지 (후기 저장이 명단을 지우지 않도록) */
export async function putCommunityBinRecord(
  binId: string,
  patch: {
    reviews:         Review[];
    friendInvites:   FriendInvite[];
    points:          PointRecord[];
    pointsCleared?: boolean;
    members?:        MemberEntry[];
  },
): Promise<void> {
  const existing = await fetchJsonBinRecord(binId);
  const extracted = extractMembersFromRecord(existing);
  const members = patch.members ?? (extracted.length > 0 ? extracted : existing.members);

  const record: JsonBinFullRecord = {
    reviews:       patch.reviews,
    friendInvites: patch.friendInvites,
    points:        patch.points,
    pointsCleared: patch.pointsCleared ?? existing.pointsCleared,
  };

  if (members !== undefined) {
    record.members = members;
  }

  await putJsonBinRecord(binId, record);
}
