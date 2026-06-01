export interface Review {
  id:           string;
  nickname:     string;
  programTitle: string;  // 어떤 프로그램 후기?
  rating:       number;  // 1~5
  content:      string;
  createdAt:    string;  // ISO
}

export interface PointRecord {
  nickname:    string;
  points:      number;
  reviewCount: number;
}
