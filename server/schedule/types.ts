export interface ScheduleSnapshot {
  week:       string;
  data:       unknown[][];
  memberRow:  unknown[];
}

export interface ScheduleRemoteRecord {
  draft?:       ScheduleSnapshot | null;
  published?:   ScheduleSnapshot | null;
  publishedAt?: string | null;
  isPublished?: boolean;
}
