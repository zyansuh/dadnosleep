import type { Review, FriendInvite } from '../../../types/community';
import type { CommunityData } from './types';
import { isPointsClearedLocal, resolvePoints } from './pointsCleared';

export function mergeReviews(a: Review[], b: Review[]): Review[] {
  const map = new Map<string, Review>();
  for (const r of [...a, ...b]) map.set(r.id, r);
  return [...map.values()].sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
  );
}

export function mergeFriendInvites(a: FriendInvite[], b: FriendInvite[]): FriendInvite[] {
  const map = new Map<string, FriendInvite>();
  for (const inv of [...a, ...b]) map.set(inv.id, inv);
  return [...map.values()].sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
  );
}

export function mergeData(
  local: CommunityData,
  remote: CommunityData,
  remotePointsCleared: boolean,
): CommunityData {
  const reviews = mergeReviews(local.reviews, remote.reviews);
  const friendInvites = mergeFriendInvites(local.friendInvites, remote.friendInvites);
  const pointsCleared = isPointsClearedLocal() || remotePointsCleared;
  return {
    reviews,
    friendInvites,
    points: resolvePoints(reviews, friendInvites, pointsCleared),
  };
}
