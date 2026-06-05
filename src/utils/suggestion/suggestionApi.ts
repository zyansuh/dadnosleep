import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import type { SuggForm } from '../../types';
import { adminAuthHeaders } from '../admin/adminApiToken';

async function parseError(res: Response, data: { error?: string }): Promise<never> {
  throw new Error(data.error ?? `요청 실패 (${res.status})`);
}

export async function fetchSuggestions(): Promise<SavedSuggestion[]> {
  const res = await fetch('/api/suggestions');
  const data = await res.json() as { suggestions?: SavedSuggestion[]; error?: string };
  if (!res.ok) await parseError(res, data);
  return data.suggestions ?? [];
}

export async function fetchSuggestionById(id: string): Promise<SavedSuggestion> {
  const res = await fetch(`/api/suggestions/${encodeURIComponent(id)}`);
  const data = await res.json() as { suggestion?: SavedSuggestion; error?: string };
  if (!res.ok) await parseError(res, data);
  if (!data.suggestion) throw new Error('건의사항을 찾을 수 없습니다.');
  return data.suggestion;
}

export async function createSuggestion(form: SuggForm): Promise<SavedSuggestion> {
  const res = await fetch('/api/suggestions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(form),
  });
  const data = await res.json() as { suggestion?: SavedSuggestion; error?: string };
  if (!res.ok) await parseError(res, data);
  if (!data.suggestion) throw new Error('건의 등록에 실패했습니다.');
  return data.suggestion;
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
): Promise<SavedSuggestion> {
  const res = await fetch(`/api/suggestions/${encodeURIComponent(id)}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
    body:    JSON.stringify({ status }),
  });
  const data = await res.json() as { suggestion?: SavedSuggestion; error?: string };
  if (!res.ok) await parseError(res, data);
  if (!data.suggestion) throw new Error('상태 변경에 실패했습니다.');
  return data.suggestion;
}
