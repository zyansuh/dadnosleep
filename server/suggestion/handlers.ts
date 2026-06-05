import type { IncomingMessage, ServerResponse } from 'node:http';
import { fetchServerBinRecord, patchServerBinRecord } from '../jsonbin/record';
import { verifyAdminRequest } from '../admin/verifyRequest';

export type SuggestionStatus = 'pending' | 'reviewing' | 'answered' | 'closed';

export interface SuggestionRecord {
  id:        string;
  title:     string;
  category:  string;
  time:      string;
  desc:      string;
  nick:      string;
  createdAt: string;
  status:    SuggestionStatus;
  replies?:  Array<{
    id:         string;
    body:       string;
    createdAt:  string;
    authorRole: 'admin';
  }>;
}

const VALID_STATUS = new Set<SuggestionStatus>(['pending', 'reviewing', 'answered', 'closed']);

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

function normalizeList(raw: unknown): SuggestionRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SuggestionRecord => {
    if (!item || typeof item !== 'object') return false;
    const o = item as SuggestionRecord;
    return typeof o.id === 'string'
      && typeof o.title === 'string'
      && typeof o.nick === 'string'
      && typeof o.createdAt === 'string';
  }).map(item => ({
    ...item,
    status: VALID_STATUS.has(item.status) ? item.status : 'pending',
  }));
}

export async function handleSuggestionsList(
  _req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    sendJson(res, 200, { ok: true, suggestions: list });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '건의함을 불러오지 못했습니다.',
    });
  }
}

export async function handleSuggestionGet(
  _req: IncomingMessage,
  res: ServerResponse,
  id: string,
): Promise<void> {
  try {
    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const item = list.find(s => s.id === id);
    if (!item) {
      sendJson(res, 404, { error: '건의사항을 찾을 수 없습니다.' });
      return;
    }
    sendJson(res, 200, { ok: true, suggestion: item });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '건의사항을 불러오지 못했습니다.',
    });
  }
}

export async function handleSuggestionCreate(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const body = JSON.parse(await readBody(req)) as Partial<SuggestionRecord>;
    const title = body.title?.trim() ?? '';
    const category = body.category?.trim() ?? '';
    const time = body.time?.trim() ?? '';
    const desc = body.desc?.trim() ?? '';
    const nick = body.nick?.trim() ?? '';

    if (!title || !category || !time || !desc || !nick) {
      sendJson(res, 400, { error: '필수 항목을 모두 입력해 주세요.' });
      return;
    }

    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const item: SuggestionRecord = {
      id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      category,
      time,
      desc,
      nick,
      createdAt: new Date().toISOString(),
      status:    'pending',
      replies:   [],
    };

    await patchServerBinRecord({ suggestions: [item, ...list] });
    sendJson(res, 201, { ok: true, suggestion: item });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '건의 등록에 실패했습니다.',
    });
  }
}

export async function handleSuggestionStatus(
  req: IncomingMessage,
  res: ServerResponse,
  id: string,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const body = JSON.parse(await readBody(req)) as { status?: SuggestionStatus };
    const status = body.status;
    if (!status || !VALID_STATUS.has(status)) {
      sendJson(res, 400, { error: '유효하지 않은 처리 상태입니다.' });
      return;
    }

    const record = await fetchServerBinRecord();
    const list = normalizeList(record.suggestions);
    const idx = list.findIndex(s => s.id === id);
    if (idx < 0) {
      sendJson(res, 404, { error: '건의사항을 찾을 수 없습니다.' });
      return;
    }

    list[idx] = { ...list[idx], status };
    await patchServerBinRecord({ suggestions: list });
    sendJson(res, 200, { ok: true, suggestion: list[idx] });
  } catch (e) {
    sendJson(res, 500, {
      error: e instanceof Error ? e.message : '상태 변경에 실패했습니다.',
    });
  }
}
