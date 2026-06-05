import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import type { SuggForm } from '../../types';
import { fetchJsonBinRecord, putJsonBinRecord } from '../jsonbin/jsonbinRecord';
import { getCommunityBinId, hasJsonBinAccessKey } from '../jsonbin/jsonbinEnv';

const VALID_STATUS = new Set<SuggestionStatus>(['pending', 'reviewing', 'answered', 'closed']);

function normalizeList(raw: unknown): SavedSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SavedSuggestion => {
    if (!item || typeof item !== 'object') return false;
    const o = item as SavedSuggestion;
    return typeof o.id === 'string'
      && typeof o.title === 'string'
      && typeof o.nick === 'string'
      && typeof o.createdAt === 'string';
  }).map(item => ({
    ...item,
    status: VALID_STATUS.has(item.status) ? item.status : 'pending',
  }));
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
    replies:   [],
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
