import { recalcPoints } from '../pointCalc';
import type { CommunityData, PersistResult } from './types';
import { writeLocal } from './local';
import { setPointsClearedLocal } from './pointsCleared';
import { saveRemote } from './remoteSave';

/** 저장 — 원격 실패 시 localStorage만 사용 (offline: true) */
export async function persistCommunityData(data: CommunityData): Promise<PersistResult> {
  setPointsClearedLocal(false);
  const withPoints: CommunityData = {
    ...data,
    points: recalcPoints(data.reviews, data.friendInvites),
  };
  writeLocal(withPoints);

  const saved = await saveRemote(withPoints);
  if (!saved.ok) {
    return { data: withPoints, offline: true };
  }

  writeLocal(saved.data);
  return { data: saved.data, offline: false };
}
