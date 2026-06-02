import type { Review, PointRecord, FriendInvite } from '../../../types/community';

export interface CommunityData {
  reviews:       Review[];
  points:        PointRecord[];
  friendInvites: FriendInvite[];
}

export interface PersistResult {
  data:    CommunityData;
  offline: boolean;
}

export type RemoteFailReason = 'unconfigured' | 'network' | 'rate_limit' | 'server_error' | 'client_error';

export type RemoteResult<T> =
  | { ok: true; data: T; pointsCleared?: boolean }
  | { ok: false; reason: RemoteFailReason };

export interface PurgeMemberCommunityResult {
  removedReviews: number;
  removedInvites: number;
}

export interface AdminWriteOptions {
  /** 후기·초대 유지, 랭킹 포인트만 0 */
  pointsCleared?: boolean;
}
