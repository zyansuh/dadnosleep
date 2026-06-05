import { useCallback, useEffect, useState } from 'react';
import type { SavedSuggestion, SuggestionStatus } from '../../../types/suggestion';
import { fetchSuggestions, updateSuggestionStatus } from '../../../utils/suggestion/suggestionApi';
import { useAdminFeedback } from '../useAdminFeedback';

export function useAdminSuggestions() {
  const { feedback, clear, showOk, showError } = useAdminFeedback();
  const [list, setList]         = useState<SavedSuggestion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchSuggestions();
      setList(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '건의함을 불러오지 못했습니다.');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await fetchSuggestions();
        if (!cancelled) setList(items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '건의함을 불러오지 못했습니다.');
          setList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const changeStatus = useCallback(async (id: string, status: SuggestionStatus) => {
    setSavingId(id);
    clear();
    try {
      const updated = await updateSuggestionStatus(id, status);
      setList(prev => prev.map(s => (s.id === id ? updated : s)));
      showOk('처리 상태가 변경되었습니다.');
    } catch (e) {
      showError(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
    } finally {
      setSavingId(null);
    }
  }, [clear, showOk, showError]);

  return { list, loading, error, savingId, feedback, refresh, changeStatus };
}
