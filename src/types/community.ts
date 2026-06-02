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
  id:               string;
  /** 포인트·랭킹에 반영되는 신고자(초대한 사람) 닉네임 */
  nickname:         string;
  /** 초대받은 지인 닉네임 (구 데이터는 비어 있을 수 있음) */
  inviteeNickname?: string;
  createdAt:        string;
}

export interface PointRecord {
  nickname:     string;
  points:       number;
  reviewCount:  number;
  inviteCount:  number;
}
