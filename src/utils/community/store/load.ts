import type { CommunityData } from './types';
import { readLocal, writeLocal } from './local';
import { mergeData } from './merge';
import { isPointsClearedLocal, resolvePoints } from './pointsCleared';
import { migrateLegacyReviewsIfNeeded } from './migration';
import { fetchRemote } from './remoteFetch';

/** 로컬 + 원격(JSONBin) 병합 조회 — 원격 실패 시 localStorage fallback */
export async function loadCommunityData(): Promise<CommunityData> {
  await migrateLegacyReviewsIfNeeded();

  const local = readLocal();
  const remote = await fetchRemote();

  if (!remote.ok) {
    const cleared = isPointsClearedLocal();
    return {
      ...local,
      points: resolvePoints(local.reviews, local.friendInvites, cleared),
    };
  }

  const merged = mergeData(local, remote.data, remote.pointsCleared === true);
  writeLocal(merged);
  return merged;
}
