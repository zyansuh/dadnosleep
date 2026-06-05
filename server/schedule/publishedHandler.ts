import { fetchServerBinRecord } from '../jsonbin/record';
import { sendJson, type ApiResponse } from '../appApi/jsonResponse';
import type { ApiRequest } from '../appApi/readJsonBody';
import { isValidSnapshot, parseScheduleField } from './scheduleParse';

export async function handleSchedulePublished(
  _req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  try {
    const record = await fetchServerBinRecord();
    const schedule = parseScheduleField(record.schedule);
    if (!schedule.isPublished || !isValidSnapshot(schedule.published)) {
      sendJson(res, 200, { ok: true, published: false, data: null });
      return;
    }
    sendJson(res, 200, {
      ok:          true,
      published:   true,
      data:        schedule.published,
      publishedAt: schedule.publishedAt ?? null,
    });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '편성표를 불러오지 못했습니다.',
    });
  }
}
