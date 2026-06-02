import type { Review, PointRecord } from '../../../types/community';
import { LS_REVIEWS, LS_POINTS, LS_FRIEND_INVITES } from './constants';
import type { CommunityData } from './types';
import { normalizeFriendInvites } from '../friendInvite';

export function readLocal(): CommunityData {
  try {
    const reviews = JSON.parse(localStorage.getItem(LS_REVIEWS) ?? '[]') as Review[];
    const points  = JSON.parse(localStorage.getItem(LS_POINTS)  ?? '[]') as PointRecord[];
    const friendInvites = normalizeFriendInvites(
      JSON.parse(localStorage.getItem(LS_FRIEND_INVITES) ?? '[]'),
    );
    return { reviews, points, friendInvites };
  } catch {
    return { reviews: [], points: [], friendInvites: [] };
  }
}

export function writeLocal(data: CommunityData): void {
  try {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(data.reviews));
    localStorage.setItem(LS_POINTS,  JSON.stringify(data.points));
    localStorage.setItem(LS_FRIEND_INVITES, JSON.stringify(data.friendInvites));
  } catch { /* 무시 */ }
}

export function clearLegacyReviewKey(): void {
  try {
    localStorage.removeItem(LS_REVIEWS);
  } catch { /* 무시 */ }
}
