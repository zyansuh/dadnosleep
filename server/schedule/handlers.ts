import type { IncomingMessage, ServerResponse } from 'node:http';
import { fetchServerBinRecord, patchServerBinRecord } from '../jsonbin/record';
import { verifyAdminRequest } from '../admin/verifyRequest';
import type { ScheduleRemoteRecord, ScheduleSnapshot } from './types';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', c => chunks.push(c as Buffer));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function parseScheduleField(raw: unknown): ScheduleRemoteRecord {
  if (!raw || typeof raw !== 'object') return {};
  return raw as ScheduleRemoteRecord;
}

function isValidSnapshot(s: unknown): s is ScheduleSnapshot {
  if (!s || typeof s !== 'object') return false;
  const o = s as ScheduleSnapshot;
  return typeof o.week === 'string'
    && Array.isArray(o.data)
    && Array.isArray(o.memberRow);
}

export async function handleSchedulePublished(
  _req: IncomingMessage,
  res: ServerResponse,
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

export async function handleScheduleDraft(
  req: IncomingMessage,
  res: ServerResponse,
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
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const body = JSON.parse(await readBody(req)) as { draft?: ScheduleSnapshot };
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
  req: IncomingMessage,
  res: ServerResponse,
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
  req: IncomingMessage,
  res: ServerResponse,
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
