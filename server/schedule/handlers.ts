import { fetchServerBinRecord, patchServerBinRecord } from '../jsonbin/record';
import { verifyAdminRequest } from '../admin/verifyRequest';
import { readJsonBody, type ApiRequest } from '../appApi/readJsonBody';
import { sendJson, type ApiResponse } from '../appApi/jsonResponse';
import type { ScheduleRemoteRecord, ScheduleSnapshot } from './types';
import { isValidSnapshot, parseScheduleField } from './scheduleParse';

export { handleSchedulePublished } from './publishedHandler';

export async function handleScheduleDraft(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const record = await fetchServerBinRecord();
    const schedule = parseScheduleField(record.schedule);
    sendJson(res, 200, {
      ok:          true,
      draft:       isValidSnapshot(schedule.draft) ? schedule.draft : null,
      published:   isValidSnapshot(schedule.published) ? schedule.published : null,
      isPublished: schedule.isPublished === true,
      publishedAt: schedule.publishedAt ?? null,
    });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '편성표를 불러오지 못했습니다.',
    });
  }
}

export async function handleScheduleSaveDraft(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const body = await readJsonBody<{ draft?: ScheduleSnapshot }>(req);
    if (!isValidSnapshot(body.draft)) {
      sendJson(res, 400, { error: '유효하지 않은 편성표 데이터입니다.' });
      return;
    }

    const record = await fetchServerBinRecord();
    const prev = parseScheduleField(record.schedule);
    const schedule: ScheduleRemoteRecord = {
      ...prev,
      draft: body.draft,
    };

    await patchServerBinRecord({ schedule });
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '편성표 저장에 실패했습니다.',
    });
  }
}

export async function handleSchedulePublish(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const record = await fetchServerBinRecord();
    const prev = parseScheduleField(record.schedule);
    const draft = isValidSnapshot(prev.draft) ? prev.draft : prev.published;
    if (!isValidSnapshot(draft)) {
      sendJson(res, 400, { error: '공개할 편성표가 없습니다. 먼저 저장해 주세요.' });
      return;
    }

    const publishedAt = new Date().toISOString();
    const schedule: ScheduleRemoteRecord = {
      ...prev,
      draft,
      published:   draft,
      isPublished: true,
      publishedAt,
    };

    await patchServerBinRecord({ schedule });
    sendJson(res, 200, { ok: true, publishedAt });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '편성표 공개에 실패했습니다.',
    });
  }
}

export async function handleScheduleUnpublish(
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const record = await fetchServerBinRecord();
    const prev = parseScheduleField(record.schedule);
    const schedule: ScheduleRemoteRecord = {
      ...prev,
      isPublished: false,
      published:   null,
      publishedAt: null,
    };

    await patchServerBinRecord({ schedule });
    sendJson(res, 200, { ok: true });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '편성표 비공개 처리에 실패했습니다.',
    });
  }
}
