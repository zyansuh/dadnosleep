import type { FriendInvite, Review } from '../../../types/community';
import { fetchJsonBinRecord, putCommunityBinRecord } from '../../jsonbin/jsonbinRecord';
import { recalcPoints } from '../pointCalc';
import type { CommunityData, RemoteResult } from './types';
import { COMMUNITY_BIN_ID, hasRemoteStore } from './remoteConfig';
import { mergeFriendInvites, mergeReviews } from './merge';
import { setPointsClearedLocal } from './pointsCleared';

export async function saveRemote(data: CommunityData): Promise<RemoteResult<CommunityData>> {
  if (!hasRemoteStore) return { ok: false, reason: 'unconfigured' };
  try {
    const existing = await fetchJsonBinRecord(COMMUNITY_BIN_ID);
    const remoteReviews = Array.isArray(existing.reviews) ? existing.reviews as Review[] : [];
    const remoteInvites = Array.isArray(existing.friendInvites)
      ? existing.friendInvites as FriendInvite[]
      : [];
    const reviews = mergeReviews(remoteReviews, data.reviews);
    const friendInvites = mergeFriendInvites(remoteInvites, data.friendInvites);
    const points = recalcPoints(reviews, friendInvites);

    await putCommunityBinRecord(COMMUNITY_BIN_ID, {
      reviews,
      friendInvites,
      points,
      pointsCleared: false,
    });
    setPointsClearedLocal(false);
    return { ok: true, data: { reviews, friendInvites, points } };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
