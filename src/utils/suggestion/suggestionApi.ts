import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import type { SuggForm } from '../../types';
import { adminAuthHeaders } from '../admin/adminApiToken';
import { readJsonResponse } from '../http/parseJsonResponse';
import {
  canUseSuggestionBin,
  createSuggestionInBin,
  loadSuggestionByIdFromBin,
  loadSuggestionsFromBin,
  updateSuggestionStatusInBin,
} from './suggestionBin';

async function parseError(res: Response, data: { error?: string }): Promise<never> {
  throw new Error(data.error ?? `요청 실패 (${res.status})`);
}

export async function fetchSuggestions(): Promise<SavedSuggestion[]> {
  try {
    const res = await fetch('/api/suggestions');
    const data = await readJsonResponse<{ suggestions?: SavedSuggestion[]; error?: string }>(res);
    if (!res.ok) await parseError(res, data);
    return data.suggestions ?? [];
  } catch {
    if (!canUseSuggestionBin()) {
      throw new Error('건의함을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
    return loadSuggestionsFromBin();
  }
}

export async function fetchSuggestionById(id: string): Promise<SavedSuggestion> {
  try {
    const res = await fetch(`/api/suggestions/${encodeURIComponent(id)}`);
    const data = await readJsonResponse<{ suggestion?: SavedSuggestion; error?: string }>(res);
    if (!res.ok) await parseError(res, data);
    if (!data.suggestion) throw new Error('건의사항을 찾을 수 없습니다.');
    return data.suggestion;
  } catch {
    if (!canUseSuggestionBin()) {
      throw new Error('건의사항을 불러오지 못했습니다.');
    }
    const item = await loadSuggestionByIdFromBin(id);
    if (!item) throw new Error('건의사항을 찾을 수 없습니다.');
    return item;
  }
}

export async function createSuggestion(form: SuggForm): Promise<SavedSuggestion> {
  try {
    const res = await fetch('/api/suggestions', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const data = await readJsonResponse<{ suggestion?: SavedSuggestion; error?: string }>(res);
    if (!res.ok) await parseError(res, data);
    if (!data.suggestion) throw new Error('건의 등록에 실패했습니다.');
    return data.suggestion;
  } catch {
    return createSuggestionInBin(form);
  }
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
): Promise<SavedSuggestion> {
  try {
    const res = await fetch(`/api/suggestions/${encodeURIComponent(id)}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body:    JSON.stringify({ status }),
    });
    const data = await readJsonResponse<{ suggestion?: SavedSuggestion; error?: string }>(res);
    if (!res.ok) await parseError(res, data);
    if (!data.suggestion) throw new Error('상태 변경에 실패했습니다.');
    return data.suggestion;
  } catch (apiError) {
    try {
      return await updateSuggestionStatusInBin(id, status);
    } catch {
      throw apiError instanceof Error
        ? apiError
        : new Error('상태 변경에 실패했습니다.');
    }
  }
}
