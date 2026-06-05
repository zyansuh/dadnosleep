import type { Review, PointRecord, FriendInvite } from '../../types/community';
import type { MemberEntry } from '../../types/member';

export interface JsonBinFullRecord {
  reviews?:       Review[];
  points?:        PointRecord[];
  friendInvites?: FriendInvite[];
  members?:       MemberEntry[];
  /** true면 후기·초대는 유지하고 랭킹 포인트만 0으로 둠 (관리자 포인트만 초기화) */
  pointsCleared?: boolean;
  schedule?: {
    draft?:       { week: string; data: unknown[][]; memberRow: unknown[] };
    published?:   { week: string; data: unknown[][]; memberRow: unknown[] };
    isPublished?: boolean;
    publishedAt?: string;
  };
  suggestions?: Array<{
    id:        string;
    title:     string;
    category:  string;
    time:      string;
    desc:      string;
    nick:      string;
    createdAt: string;
    status:    string;
    comments?: Array<{ id: string; body: string; nick: string; createdAt: string; isAdmin?: boolean }>;
    replies?:  Array<{ id: string; body: string; createdAt: string; authorRole: string }>;
  }>;
}
