import type { FriendInvite, Review } from '../../../types/community';
import { fetchJsonBinRecord } from '../../jsonbin/jsonbinRecord';
import { readLocal } from './local';
import { mergeFriendInvites, mergeReviews } from './merge';
import { COMMUNITY_BIN_ID, hasRemoteStore } from './remoteConfig';
import { adminWriteCommunityRecord } from './adminWrite';

/**
 * 테스트용 — 후기·지인 초대는 그대로 두고 포인트 랭킹만 0으로 초기화.
 */
export async function adminResetPointsOnly(): Promise<{ ok: boolean; message: string }> {
  const local = readLocal();

  if (!hasRemoteStore) {
    return adminWriteCommunityRecord(local.reviews, local.friendInvites, { pointsCleared: true });
  }

  try {
    const existing = await fetchJsonBinRecord(COMMUNITY_BIN_ID);
    const remoteReviews = Array.isArray(existing.reviews) ? existing.reviews as Review[] : [];
    const remoteInvites = Array.isArray(existing.friendInvites)
      ? existing.friendInvites as FriendInvite[]
      : [];
    const reviews = mergeReviews(local.reviews, remoteReviews);
    const friendInvites = mergeFriendInvites(local.friendInvites, remoteInvites);
    return adminWriteCommunityRecord(reviews, friendInvites, { pointsCleared: true });
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '초기화에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 후기만 삭제. 지인 초대 기록은 유지하고 포인트는 초대분만 남깁니다.
 */
export async function adminResetReviewsOnly(): Promise<{ ok: boolean; message: string }> {
  const local = readLocal();
  const friendInvites = local.friendInvites;

  if (!hasRemoteStore) {
    return adminWriteCommunityRecord([], friendInvites, { pointsCleared: false });
  }

  try {
    const existing = await fetchJsonBinRecord(COMMUNITY_BIN_ID);
    const remoteInvites = Array.isArray(existing.friendInvites)
      ? existing.friendInvites as FriendInvite[]
      : [];
    const mergedInvites = mergeFriendInvites(local.friendInvites, remoteInvites);
    return adminWriteCommunityRecord([], mergedInvites, { pointsCleared: false });
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '초기화에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 지인 초대 신고만 삭제. 후기는 유지하고 포인트는 후기분만 남깁니다.
 */
export async function adminResetInvitesOnly(): Promise<{ ok: boolean; message: string }> {
  const local = readLocal();
  const reviews = local.reviews;

  if (!hasRemoteStore) {
    return adminWriteCommunityRecord(reviews, [], { pointsCleared: false });
  }

  try {
    const existing = await fetchJsonBinRecord(COMMUNITY_BIN_ID);
    const remoteReviews = Array.isArray(existing.reviews) ? existing.reviews as Review[] : [];
    const mergedReviews = mergeReviews(local.reviews, remoteReviews);
    return adminWriteCommunityRecord(mergedReviews, [], { pointsCleared: false });
  } catch (e) {
    return {
      ok:      false,
      message: e instanceof Error ? e.message : '초기화에 실패했습니다.',
    };
  }
}

/**
 * 테스트용 — 후기·지인초대·포인트 전부 삭제 (병합 없음).
 */
export async function adminResetAllCommunityData(): Promise<{ ok: boolean; message: string }> {
  return adminWriteCommunityRecord([], [], { pointsCleared: false });
}
