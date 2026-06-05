import type { Cell } from '../../types';
import { adminAuthHeaders } from '../admin/adminApiToken';
import { readJsonResponse } from '../http/parseJsonResponse';
import type { ScheduleSnapshot } from './store/types';

interface PublishedResponse {
  ok:        boolean;
  published: boolean;
  data:      ScheduleSnapshot | null;
  publishedAt?: string | null;
  error?:    string;
}

interface DraftResponse {
  ok:          boolean;
  draft:       ScheduleSnapshot | null;
  published:   ScheduleSnapshot | null;
  isPublished: boolean;
  publishedAt: string | null;
  error?:      string;
}

async function parseError(res: Response, data: { error?: string }): Promise<never> {
  throw new Error(data.error ?? `요청 실패 (${res.status})`);
}

export async function fetchPublishedSchedule(): Promise<{
  published:   boolean;
  snapshot:    ScheduleSnapshot | null;
  publishedAt: string | null;
}> {
  const res = await fetch('/api/schedule/published');
  const data = await readJsonResponse<PublishedResponse>(res);
  if (!res.ok) await parseError(res, data);
  return {
    published:   data.published === true,
    snapshot:    data.data,
    publishedAt: data.publishedAt ?? null,
  };
}

export async function fetchDraftSchedule(): Promise<DraftResponse> {
  const res = await fetch('/api/schedule/draft', { headers: adminAuthHeaders() });
  const data = await readJsonResponse<DraftResponse>(res);
  if (!res.ok) await parseError(res, data);
  return data;
}

export async function saveDraftSchedule(
  sched: Cell[][],
  memberRow: Cell[],
  week: string,
): Promise<void> {
  const res = await fetch('/api/schedule/draft', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
    body:    JSON.stringify({ draft: { week, data: sched, memberRow } }),
  });
  const data = await readJsonResponse<{ error?: string }>(res);
  if (!res.ok) await parseError(res, data);
}

export async function publishScheduleRemote(): Promise<string> {
  const res = await fetch('/api/schedule/publish', {
    method:  'POST',
    headers: adminAuthHeaders(),
  });
  const data = await readJsonResponse<{ publishedAt?: string; error?: string }>(res);
  if (!res.ok) await parseError(res, data);
  return data.publishedAt ?? new Date().toISOString();
}

export async function unpublishScheduleRemote(): Promise<void> {
  const res = await fetch('/api/schedule/unpublish', {
    method:  'POST',
    headers: adminAuthHeaders(),
  });
  const data = await readJsonResponse<{ error?: string }>(res);
  if (!res.ok) await parseError(res, data);
}
