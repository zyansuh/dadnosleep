import { fetchJsonBinRecord } from '../jsonbin/jsonbinRecord';
import { getCommunityBinId, hasJsonBinAccessKey } from '../jsonbin/jsonbinEnv';
import type { ScheduleSnapshot } from './store/types';

function isValidSnapshot(s: unknown): s is ScheduleSnapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as ScheduleSnapshot;
  return typeof o.week === 'string'
    && Array.isArray(o.data)
    && Array.isArray(o.memberRow);
}

export function canUseScheduleBin(): boolean {
  return hasJsonBinAccessKey() && Boolean(getCommunityBinId());
}

export async function loadPublishedScheduleFromBin(): Promise<{
  published:   boolean;
  snapshot:    ScheduleSnapshot | null;
  publishedAt: string | null;
}> {
  if (!canUseScheduleBin()) {
    return { published: false, snapshot: null, publishedAt: null };
  }
  const record = await fetchJsonBinRecord(getCommunityBinId());
  const schedule = record.schedule;
  if (!schedule?.isPublished || !isValidSnapshot(schedule.published)) {
    return { published: false, snapshot: null, publishedAt: null };
  }
  return {
    published:   true,
    snapshot:    schedule.published,
    publishedAt: schedule.publishedAt ?? null,
  };
}

export async function loadDraftScheduleFromBin(): Promise<{
  draft:       ScheduleSnapshot | null;
  published:   ScheduleSnapshot | null;
  isPublished: boolean;
  publishedAt: string | null;
}> {
  if (!canUseScheduleBin()) {
    return { draft: null, published: null, isPublished: false, publishedAt: null };
  }
  const record = await fetchJsonBinRecord(getCommunityBinId());
  const schedule = record.schedule ?? {};
  return {
    draft:       isValidSnapshot(schedule.draft) ? schedule.draft : null,
    published:   isValidSnapshot(schedule.published) ? schedule.published : null,
    isPublished: schedule.isPublished === true,
    publishedAt: schedule.publishedAt ?? null,
  };
}
