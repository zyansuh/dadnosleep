import type { Review, PointRecord, FriendInvite } from '../../types/community';
import { POINTS_PER_FRIEND_INVITE, POINTS_PER_REVIEW } from '../../constants/points';

export function recalcPoints(
  reviews: Review[],
  friendInvites: FriendInvite[] = [],
  reviewBonus = POINTS_PER_REVIEW,
  inviteBonus = POINTS_PER_FRIEND_INVITE,
): PointRecord[] {
  const reviewCounts = new Map<string, number>();
  const inviteCounts = new Map<string, number>();

  for (const r of reviews) {
    reviewCounts.set(r.nickname, (reviewCounts.get(r.nickname) ?? 0) + 1);
  }
  for (const inv of friendInvites) {
    inviteCounts.set(inv.nickname, (inviteCounts.get(inv.nickname) ?? 0) + 1);
  }

  const nicknames = new Set([...reviewCounts.keys(), ...inviteCounts.keys()]);

  return [...nicknames]
    .map(nickname => {
      const reviewCount = reviewCounts.get(nickname) ?? 0;
      const inviteCount = inviteCounts.get(nickname) ?? 0;
      return {
        nickname,
        reviewCount,
        inviteCount,
        points: reviewCount * reviewBonus + inviteCount * inviteBonus,
      };
    })
    .sort((a, b) => b.points - a.points);
}

export function formatPointBreakdown(p: PointRecord): string {
  const parts: string[] = [];
  if (p.reviewCount > 0) parts.push(`후기 ${p.reviewCount}`);
  if (p.inviteCount > 0) parts.push(`초대 ${p.inviteCount}`);
  return parts.length ? parts.join(' · ') : '—';
}
