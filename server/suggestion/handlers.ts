import { fetchServerBinRecord, patchServerBinRecord } from '../jsonbin/record';
import { verifyAdminRequest } from '../admin/verifyRequest';
import { readJsonBody, type ApiRequest } from '../appApi/readJsonBody';
import { sendJson, type ApiResponse } from '../appApi/jsonResponse';
import type { SuggestionRecord, SuggestionStatus } from './types';

export type { SuggestionRecord, SuggestionStatus } from './types';
export {
  handleSuggestionCreate,
  handleSuggestionGet,
  handleSuggestionsList,
} from './publicHandlers';

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

export async function handleSuggestionStatus(
  req: ApiRequest,
  res: ApiResponse,
  id: string,
): Promise<void> {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) {
    sendJson(res, auth.status, { error: auth.message });
    return;
  }

  try {
    const body = await readJsonBody<{ status?: SuggestionStatus }>(req);
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
