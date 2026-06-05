import type { SavedSuggestion, SuggestionComment, SuggestionReply, SuggestionStatus } from '../../types/suggestion';
import type { SuggForm } from '../../types';
import { fetchJsonBinRecord, putJsonBinRecord } from '../jsonbin/jsonbinRecord';
import { getCommunityBinId, hasJsonBinAccessKey } from '../jsonbin/jsonbinEnv';
import { validateNickname } from '../nickname';

const VALID_STATUS = new Set<SuggestionStatus>(['pending', 'reviewing', 'answered', 'closed']);

function normalizeComments(raw: unknown, legacyReplies: unknown): SuggestionComment[] {
  const fromComments: SuggestionComment[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const o = item as SuggestionComment;
      if (typeof o.id !== 'string' || typeof o.body !== 'string' || typeof o.nick !== 'string') {
        continue;
      }
      if (typeof o.createdAt !== 'string') continue;
      fromComments.push({
        id:        o.id,
        body:      o.body,
        nick:      o.nick,
        createdAt: o.createdAt,
        isAdmin:   o.isAdmin === true,
      });
    }
  }

  if (fromComments.length > 0) return fromComments;

  if (!Array.isArray(legacyReplies)) return [];
  return legacyReplies.filter((item): item is SuggestionReply => {
    if (!item || typeof item !== 'object') return false;
    const o = item as SuggestionReply;
    return typeof o.id === 'string'
      && typeof o.body === 'string'
      && typeof o.createdAt === 'string'
      && o.authorRole === 'admin';
  }).map(r => ({
    id:        r.id,
    body:      r.body,
    nick:      '관리자',
    createdAt: r.createdAt,
    isAdmin:   true,
  }));
}

function normalizeList(raw: unknown): SavedSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SavedSuggestion => {
    if (!item || typeof item !== 'object') return false;
    const o = item as SavedSuggestion;
    return typeof o.id === 'string'
      && typeof o.title === 'string'
      && typeof o.nick === 'string'
      && typeof o.createdAt === 'string';
  }).map(item => {
    const comments = normalizeComments(item.comments, item.replies);
    const { replies: _legacy, ...rest } = item;
    return {
      ...rest,
      status: VALID_STATUS.has(item.status) ? item.status : 'pending',
      comments,
    };
  });
}

export function canUseSuggestionBin(): boolean {
  return hasJsonBinAccessKey() && Boolean(getCommunityBinId());
}

export async function loadSuggestionsFromBin(): Promise<SavedSuggestion[]> {
  if (!canUseSuggestionBin()) return [];
  const record = await fetchJsonBinRecord(getCommunityBinId());
  return normalizeList(record.suggestions);
}

export async function loadSuggestionByIdFromBin(id: string): Promise<SavedSuggestion | null> {
  const list = await loadSuggestionsFromBin();
  return list.find(s => s.id === id) ?? null;
}

export async function createSuggestionInBin(form: SuggForm): Promise<SavedSuggestion> {
  if (!canUseSuggestionBin()) {
    throw new Error('건의함 저장소가 연결되지 않았습니다.');
  }
  const binId = getCommunityBinId();
  const record = await fetchJsonBinRecord(binId);
  const list = normalizeList(record.suggestions);
  const item: SavedSuggestion = {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title:     form.title.trim(),
    category:  form.category,
    time:      form.time.trim(),
    desc:      form.desc.trim(),
    nick:      form.nick.trim(),
    createdAt: new Date().toISOString(),
    status:    'pending',
    comments:  [],
  };
  await putJsonBinRecord(binId, { ...record, suggestions: [item, ...list] });
  return item;
}

export async function updateSuggestionStatusInBin(
  id: string,
  status: SuggestionStatus,
): Promise<SavedSuggestion> {
  if (!canUseSuggestionBin()) {
    throw new Error('건의함 저장소가 연결되지 않았습니다.');
  }
  const binId = getCommunityBinId();
  const record = await fetchJsonBinRecord(binId);
  const list = normalizeList(record.suggestions);
  const idx = list.findIndex(s => s.id === id);
  if (idx < 0) throw new Error('건의사항을 찾을 수 없습니다.');
  list[idx] = { ...list[idx], status };
  await putJsonBinRecord(binId, { ...record, suggestions: list });
  return list[idx];
}

export async function addSuggestionCommentInBin(
  id: string,
  body: string,
  nick: string,
  isAdmin = false,
): Promise<SavedSuggestion> {
  if (!canUseSuggestionBin()) {
    throw new Error('건의함 저장소가 연결되지 않았습니다.');
  }
  const text = body.trim();
  if (!text) throw new Error('댓글 내용을 입력해 주세요.');
  const nickErr = validateNickname(nick);
  if (nickErr) throw new Error(nickErr);

  const binId = getCommunityBinId();
  const record = await fetchJsonBinRecord(binId);
  const list = normalizeList(record.suggestions);
  const idx = list.findIndex(s => s.id === id);
  if (idx < 0) throw new Error('건의사항을 찾을 수 없습니다.');

  const comment: SuggestionComment = {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    body:      text,
    nick:      nick.trim(),
    createdAt: new Date().toISOString(),
    isAdmin,
  };
  const prev = list[idx];
  list[idx] = { ...prev, comments: [...(prev.comments ?? []), comment] };
  await putJsonBinRecord(binId, { ...record, suggestions: list });
  return list[idx];
}
