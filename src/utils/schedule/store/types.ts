import type { Cell } from '../../../types';

export interface ScheduleSnapshot {
  week:       string;
  data:       Cell[][];
  memberRow:  Cell[];
}

/** localStorage 캐시 (주차별 스냅샷) */
export type StoredSched = ScheduleSnapshot;

export interface ScheduleRemoteRecord {
  draft?:      ScheduleSnapshot | null;
  published?:  ScheduleSnapshot | null;
  publishedAt?: string | null;
  isPublished?: boolean;
}

export interface ScheduleLoadResult {
  sched:        Cell[][];
  memberRow:    Cell[];
  isPublished:  boolean;
  publishedAt:  string | null;
  isDraftView:  boolean;
}
