export interface Review {
  id:           string;
  nickname:     string;
  programTitle: string;  // 어떤 프로그램 후기?
  rating:       number;  // 1~5
  content:      string;
  createdAt:    string;  // ISO
}

/** 지인 초대 신고 1건 */
export interface FriendInvite {
  id:        string;
  nickname:  string;
  createdAt: string;
}

export interface PointRecord {
  nickname:     string;
  points:       number;
  reviewCount:  number;
  inviteCount:  number;
}
