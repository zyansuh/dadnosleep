import type { Review } from '../../../types/community';
import { LS_REVIEWS } from './constants';
import type { CommunityData } from './types';
import { readLocal, writeLocal, clearLegacyReviewKey } from './local';
import { mergeData } from './merge';
import { isMigrated, markMigrated } from './migrationFlags';
import { fetchRemote } from './remoteFetch';
import { saveRemote } from './remoteSave';
import { hasRemoteStore } from './remoteConfig';

/** localStorage 레거시 후기 → JSONBin 1회 마이그레이션 */
export async function migrateLegacyReviewsIfNeeded(): Promise<void> {
  if (isMigrated() || !hasRemoteStore) return;

  let legacyReviews: Review[];
  try {
    if (localStorage.getItem(LS_REVIEWS) === null) {
      markMigrated();
      return;
    }
    const parsed = JSON.parse(localStorage.getItem(LS_REVIEWS) ?? '[]') as unknown;
    legacyReviews = Array.isArray(parsed) ? parsed as Review[] : [];
  } catch {
    clearLegacyReviewKey();
    markMigrated();
    return;
  }

  const local = readLocal();
  const legacyData: CommunityData = {
    reviews:       legacyReviews,
    friendInvites: local.friendInvites,
    points:        local.points,
  };

  const remote = await fetchRemote();
  const merged = remote.ok
    ? mergeData(legacyData, remote.data, remote.pointsCleared === true)
    : legacyData;

  const saved = await saveRemote(merged);
  if (!saved.ok) return;

  clearLegacyReviewKey();
  writeLocal(merged);
  markMigrated();
}
