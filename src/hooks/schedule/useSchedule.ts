import { useState, useCallback } from 'react';
import type { Cell, RecommendItem } from '../../types';
import { fetchRandomRecommendPool } from '../../utils/recommend';
import { loadStoredSchedule, persistSchedule } from '../../utils/schedule/scheduleStorage';
import {
  patchCellContent,
  toFixedCell,
  toUnfixedCell,
  recommendToCell,
  touchMemberCell,
  resetCellToBase,
  emptyNonFixedCell,
} from '../../utils/schedule/scheduleCell';

interface UseScheduleReturn {
  sched:                  Cell[][];
  memberRow:              Cell[];
  randing:                boolean;
  randError:              string;
  isEditMode:             boolean;
  randomPool:             RecommendItem[];
  randomPickerOpen:       boolean;
  resetConfirmOpen:       boolean;
  openRandomPicker:       () => Promise<void>;
  closeRandomPicker:      () => void;
  applyRandomSelection:   (selected: RecommendItem[]) => void;
  openResetConfirm:       () => void;
  closeResetConfirm:      () => void;
  resetNonFixed:          () => void;
  updateCell:             (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  updateMemberCell:       (dayIdx: number, title: string, link?: string) => void;
  updateMany:             (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => void;
  setCellFixed:           (dayIdx: number, timeIdx: number, title?: string, link?: string) => void;
  unfixCell:              (dayIdx: number, timeIdx: number) => void;
  resetCell:              (dayIdx: number, timeIdx: number) => void;
  toggleEditMode:         () => void;
}

export function useSchedule(): UseScheduleReturn {
  const initial = loadStoredSchedule();
  const [sched,            setSched]            = useState<Cell[][]>(initial.sched);
  const [memberRow,        setMemberRow]        = useState<Cell[]>(initial.memberRow);
  const [randing,          setRanding]          = useState(false);
  const [randError,        setRandError]        = useState('');
  const [isEditMode,       setIsEditMode]       = useState(false);
  const [randomPool,       setRandomPool]       = useState<RecommendItem[]>([]);
  const [randomPickerOpen, setRandomPickerOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const persist = useCallback((next: Cell[][], member: Cell[]) => {
    persistSchedule(next, member);
  }, []);

  const updateCell = useCallback((dayIdx: number, timeIdx: number, title: string, link?: string) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? patchCellContent(cell, title, link) : cell
        )
      );
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const updateMemberCell = useCallback((dayIdx: number, title: string, link?: string) => {
    setMemberRow(prev => {
      const next = prev.map((cell, i) =>
        i === dayIdx ? touchMemberCell(cell, title, link) : cell
      );
      setSched(s => {
        persist(s, next);
        return s;
      });
      return next;
    });
  }, [persist]);

  const updateMany = useCallback(
    (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => {
      setSched(prev => {
        let next = prev;
        for (const e of edits) {
          next = next.map((day, di) =>
            day.map((cell, ti) =>
              di === e.dayIdx && ti === e.timeIdx ? patchCellContent(cell, e.title, e.link) : cell
            )
          );
        }
        persist(next, memberRow);
        return next;
      });
    },
    [persist, memberRow]
  );

  const setCellFixed = useCallback((dayIdx: number, timeIdx: number, title?: string, link?: string) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) => {
          if (di !== dayIdx || ti !== timeIdx) return cell;
          return toFixedCell(cell, title?.trim() || cell.title, link);
        })
      );
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const unfixCell = useCallback((dayIdx: number, timeIdx: number) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? toUnfixedCell(cell) : cell
        )
      );
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const resetCell = useCallback((dayIdx: number, timeIdx: number) => {
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? resetCellToBase(di, ti) : cell
        )
      );
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const resetNonFixed = useCallback(() => {
    setSched(prev => {
      const next = prev.map(day => day.map(emptyNonFixedCell));
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const openRandomPicker = useCallback(async () => {
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
      const msg = e instanceof Error ? e.message : String(e);
      setRandError(`오류: ${msg}`);
    } finally {
      setRanding(false);
    }
  }, []);

  const applyRandomSelection = useCallback((selected: RecommendItem[]) => {
    if (!selected.length) return;
    let pi = 0;
    setSched(prev => {
      const next = prev.map(day =>
        day.map(cell => {
          if (cell.type === 'fixed' || cell.type === 'member') return cell;
          const item = selected[pi++];
          if (!item) return cell;
          return recommendToCell(cell, item);
        })
      );
      persist(next, memberRow);
      return next;
    });
    setRandomPickerOpen(false);
  }, [persist, memberRow]);

  const toggleEditMode = useCallback(() => setIsEditMode(v => !v), []);

  return {
    sched, memberRow, randing, randError, isEditMode,
    randomPool, randomPickerOpen, resetConfirmOpen,
    openRandomPicker, closeRandomPicker: () => setRandomPickerOpen(false),
    applyRandomSelection,
    openResetConfirm: () => setResetConfirmOpen(true),
    closeResetConfirm: () => setResetConfirmOpen(false),
    resetNonFixed,
    updateCell, updateMemberCell, updateMany, setCellFixed, unfixCell, resetCell, toggleEditMode,
  };
}
