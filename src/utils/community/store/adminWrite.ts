import type { Review, FriendInvite } from '../../../types/community';
import { putCommunityBinRecord } from '../../jsonbin/jsonbinRecord';
import type { AdminWriteOptions, CommunityData } from './types';
import { writeLocal } from './local';
import { resolvePoints, setPointsClearedLocal } from './pointsCleared';
import { COMMUNITY_BIN_ID, hasRemoteStore } from './remoteConfig';

export async function adminWriteCommunityRecord(
  reviews: Review[],
  friendInvites: FriendInvite[],
  opts?: AdminWriteOptions,
): Promise<{ ok: boolean; message: string }> {
  const pointsCleared = opts?.pointsCleared === true;
  const points = resolvePoints(reviews, friendInvites, pointsCleared);
  const data: CommunityData = { reviews, friendInvites, points };
  setPointsClearedLocal(pointsCleared);
  writeLocal(data);

  if (!hasRemoteStore) {
    return { ok: true, message: '' };
  }

  try {
    await putCommunityBinRecord(COMMUNITY_BIN_ID, {
      reviews,
      friendInvites,
      points,
      pointsCleared,
    });
    return { ok: true, message: '' };
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '저장에 실패했습니다.',
    };
  }
}
