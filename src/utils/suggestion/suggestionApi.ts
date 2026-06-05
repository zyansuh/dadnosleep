import type { SavedSuggestion, SuggestionStatus } from '../../types/suggestion';
import type { SuggForm } from '../../types';
import {
  createSuggestionInBin,
  loadSuggestionByIdFromBin,
  loadSuggestionsFromBin,
  updateSuggestionStatusInBin,
} from './suggestionBin';

export async function fetchSuggestions(): Promise<SavedSuggestion[]> {
  return loadSuggestionsFromBin();
}

export async function fetchSuggestionById(id: string): Promise<SavedSuggestion> {
  const item = await loadSuggestionByIdFromBin(id);
  if (!item) throw new Error('건의사항을 찾을 수 없습니다.');
  return item;
}

export async function createSuggestion(form: SuggForm): Promise<SavedSuggestion> {
  return createSuggestionInBin(form);
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
): Promise<SavedSuggestion> {
  return updateSuggestionStatusInBin(id, status);
}
