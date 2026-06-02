import type { Review } from '../../../types/community';
import type { CommunityData } from './types';
import { normalizeFriendInvites } from '../friendInvite';
import { resolvePoints } from './pointsCleared';

export function parseRemoteRecord(record: {
  reviews?:       unknown;
  points?:         unknown;
  friendInvites?:  unknown;
  pointsCleared?:  unknown;
}): { data: CommunityData; pointsCleared: boolean } {
  const pointsCleared = record.pointsCleared === true;
  const reviews = Array.isArray(record.reviews) ? record.reviews as Review[] : [];
  const friendInvites = normalizeFriendInvites(record.friendInvites);
  return {
    pointsCleared,
    data: {
      reviews,
      friendInvites,
      points: resolvePoints(reviews, friendInvites, pointsCleared),
    },
  };
}
