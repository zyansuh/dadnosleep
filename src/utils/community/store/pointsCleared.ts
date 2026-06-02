import type { Review, PointRecord, FriendInvite } from '../../../types/community';
import { LS_POINTS_CLEARED } from './constants';
import { recalcPoints } from '../pointCalc';

export function isPointsClearedLocal(): boolean {
  try {
    return localStorage.getItem(LS_POINTS_CLEARED) === '1';
  } catch {
    return false;
  }
}

export function setPointsClearedLocal(cleared: boolean): void {
  try {
    if (cleared) localStorage.setItem(LS_POINTS_CLEARED, '1');
    else localStorage.removeItem(LS_POINTS_CLEARED);
  } catch { /* 무시 */ }
}

export function resolvePoints(
  reviews: Review[],
  friendInvites: FriendInvite[],
  pointsCleared: boolean,
): PointRecord[] {
  return pointsCleared ? [] : recalcPoints(reviews, friendInvites);
}
