import { fetchServerBinRecord, patchServerBinRecord } from '../jsonbin/record';
import { readJsonBody, type ApiRequest } from '../appApi/readJsonBody';
import { sendJson, type ApiResponse } from '../appApi/jsonResponse';
import type { SuggestionRecord, SuggestionStatus } from './types';

const VALID_STATUS = new Set<SuggestionStatus>(['pending', 'reviewing', 'answered', 'closed']);

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
  _req: ApiRequest,
  res: ApiResponse,
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
  _req: ApiRequest,
  res: ApiResponse,
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
  req: ApiRequest,
  res: ApiResponse,
): Promise<void> {
  try {
    const body = await readJsonBody<Partial<SuggestionRecord>>(req);
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
