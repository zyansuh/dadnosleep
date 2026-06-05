import { useState, useCallback } from 'react';
import type { RecommendItem } from '../../types';
import { fetchRandomRecommendPool } from '../../utils/schedule/recommend';
import { recommendToCell } from '../../utils/schedule/scheduleCell';
import type { useScheduleCore } from './useScheduleCore';

type Core = ReturnType<typeof useScheduleCore>;

export function useScheduleRandom(core: Core, canManage: boolean) {
  const [randing, setRanding] = useState(false);
  const [randError, setRandError] = useState('');
  const [randomPool, setRandomPool] = useState<RecommendItem[]>([]);
  const [randomPickerOpen, setRandomPickerOpen] = useState(false);

  const openRandomPicker = useCallback(async () => {
    if (!canManage) {
      setRandError('편성표 수정은 관리자만 할 수 있습니다.');
      return;
    }
    setRanding(true);
    setRandError('');
    try {
      const pool = await fetchRandomRecommendPool(24);
      if (pool.length === 0) {
        setRandError('콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      setRandomPool(pool);
      setRandomPickerOpen(true);
    } catch (e) {
      setRandError(e instanceof Error ? e.message : String(e));
    } finally {
      setRanding(false);
    }
  }, [canManage]);

  const applyRandomSelection = useCallback((selected: RecommendItem[]) => {
    if (!selected.length || !canManage) return;
    let pi = 0;
    core.applyRandomToSched(prev =>
      prev.map(day =>
        day.map(cell => {
          if (cell.type === 'fixed' || cell.type === 'member') return cell;
          const item = selected[pi++];
          if (!item) return cell;
          return recommendToCell(cell, item);
        })
      )
    );
    setRandomPickerOpen(false);
  }, [canManage, core]);

  return {
    randing,
    randError,
    randomPool,
    randomPickerOpen,
    openRandomPicker,
    closeRandomPicker: () => setRandomPickerOpen(false),
    applyRandomSelection,
  };
}
