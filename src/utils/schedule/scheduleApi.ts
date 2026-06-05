import type { Cell } from '../../types';
import {
  loadDraftScheduleFromBin,
  loadPublishedScheduleFromBin,
  publishScheduleInBin,
  saveDraftScheduleToBin,
  unpublishScheduleInBin,
} from './scheduleBin';
import type { ScheduleSnapshot } from './store/types';

export async function fetchPublishedSchedule(): Promise<{
  published:   boolean;
  snapshot:    ScheduleSnapshot | null;
  publishedAt: string | null;
}> {
  return loadPublishedScheduleFromBin();
}

export async function fetchDraftSchedule(): Promise<{
  ok:          boolean;
  draft:       ScheduleSnapshot | null;
  published:   ScheduleSnapshot | null;
  isPublished: boolean;
  publishedAt: string | null;
}> {
  const bin = await loadDraftScheduleFromBin();
  return { ok: true, ...bin };
}

export async function saveDraftSchedule(
  sched: Cell[][],
  memberRow: Cell[],
  week: string,
): Promise<void> {
  await saveDraftScheduleToBin(sched, memberRow, week);
}

export async function publishScheduleRemote(): Promise<string> {
  return publishScheduleInBin();
}

export async function unpublishScheduleRemote(): Promise<void> {
  await unpublishScheduleInBin();
}
