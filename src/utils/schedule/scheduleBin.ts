import type { Cell } from '../../types';
import { fetchJsonBinRecord, putJsonBinRecord } from '../jsonbin/jsonbinRecord';
import { getCommunityBinId, hasJsonBinAccessKey } from '../jsonbin/jsonbinEnv';
import type { ScheduleSnapshot } from './store/types';

function isValidSnapshot(s: unknown): s is ScheduleSnapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as ScheduleSnapshot;
  return typeof o.week === 'string'
    && Array.isArray(o.data)
    && Array.isArray(o.memberRow);
}

function requireScheduleBin(): string {
  if (!canUseScheduleBin()) {
    throw new Error('편성표 저장소가 연결되지 않았습니다.');
  }
  return getCommunityBinId();
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

export async function saveDraftScheduleToBin(
  sched: Cell[][],
  memberRow: Cell[],
  week: string,
): Promise<void> {
  const binId = requireScheduleBin();
  const record = await fetchJsonBinRecord(binId);
  const prev = record.schedule ?? {};
  const draft: ScheduleSnapshot = { week, data: sched, memberRow };
  await putJsonBinRecord(binId, {
    ...record,
    schedule: { ...prev, draft },
  });
}

export async function publishScheduleInBin(): Promise<string> {
  const binId = requireScheduleBin();
  const record = await fetchJsonBinRecord(binId);
  const prev = record.schedule ?? {};
  const draft = isValidSnapshot(prev.draft) ? prev.draft : prev.published;
  if (!isValidSnapshot(draft)) {
    throw new Error('공개할 편성표가 없습니다. 먼저 저장해 주세요.');
  }
  const publishedAt = new Date().toISOString();
  await putJsonBinRecord(binId, {
    ...record,
    schedule: {
      ...prev,
      draft,
      published:   draft,
      isPublished: true,
      publishedAt,
    },
  });
  return publishedAt;
}

export async function unpublishScheduleInBin(): Promise<void> {
  const binId = requireScheduleBin();
  const record = await fetchJsonBinRecord(binId);
  const prev = record.schedule ?? {};
  await putJsonBinRecord(binId, {
    ...record,
    schedule: {
      ...prev,
      isPublished: false,
      published:   undefined,
      publishedAt: undefined,
    },
  });
}
