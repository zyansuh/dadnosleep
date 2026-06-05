import { useCallback } from 'react';
import type { Cell } from '../../types';
import {
  patchCellContent,
  toFixedCell,
  toUnfixedCell,
  resetCellToBase,
  emptyNonFixedCell,
  touchMemberCell,
} from '../../utils/schedule/scheduleCell';
import { saveDraftSchedule } from '../../utils/schedule/scheduleApi';

interface UseScheduleCoreArgs {
  sched:       Cell[][];
  memberRow:   Cell[];
  setSched:    React.Dispatch<React.SetStateAction<Cell[][]>>;
  setMemberRow: React.Dispatch<React.SetStateAction<Cell[]>>;
  weekKey:     string;
  canManage:   boolean;
}

export function useScheduleCore({
  sched, memberRow, setSched, setMemberRow, weekKey, canManage,
}: UseScheduleCoreArgs) {
  const persist = useCallback(async (next: Cell[][], member: Cell[]) => {
    if (!canManage) return;
    await saveDraftSchedule(next, member, weekKey);
  }, [canManage, weekKey]);

  const updateCell = useCallback((dayIdx: number, timeIdx: number, title: string, link?: string) => {
    if (!canManage) return;
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? patchCellContent(cell, title, link) : cell
        )
      );
      void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  const updateMemberCell = useCallback((dayIdx: number, title: string, link?: string) => {
    if (!canManage) return;
    setMemberRow(prev => {
      const next = prev.map((cell, i) =>
        i === dayIdx ? touchMemberCell(cell, title, link) : cell
      );
      setSched(s => {
        void persist(s, next);
        return s;
      });
      return next;
    });
  }, [canManage, persist, setSched, setMemberRow]);

  const updateMany = useCallback(
    (edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[]) => {
      if (!canManage) return;
      setSched(prev => {
        let next = prev;
        for (const e of edits) {
          next = next.map((day, di) =>
            day.map((cell, ti) =>
              di === e.dayIdx && ti === e.timeIdx ? patchCellContent(cell, e.title, e.link) : cell
            )
          );
        }
        void persist(next, memberRow);
        return next;
      });
    },
    [canManage, persist, memberRow, setSched],
  );

  const setCellFixed = useCallback((dayIdx: number, timeIdx: number, title?: string, link?: string) => {
    if (!canManage) return;
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) => {
          if (di !== dayIdx || ti !== timeIdx) return cell;
          return toFixedCell(cell, title?.trim() || cell.title, link);
        })
      );
      void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  const unfixCell = useCallback((dayIdx: number, timeIdx: number) => {
    if (!canManage) return;
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? toUnfixedCell(cell) : cell
        )
      );
      void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  const resetCell = useCallback((dayIdx: number, timeIdx: number) => {
    if (!canManage) return;
    setSched(prev => {
      const next = prev.map((day, di) =>
        day.map((cell, ti) =>
          di === dayIdx && ti === timeIdx ? resetCellToBase(di, ti) : cell
        )
      );
      void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  const resetNonFixed = useCallback(() => {
    if (!canManage) return;
    setSched(prev => {
      const next = prev.map(day => day.map(emptyNonFixedCell));
      void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  const applyRandomToSched = useCallback((
    mapper: (prev: Cell[][]) => Cell[][],
  ) => {
    setSched(prev => {
      const next = mapper(prev);
      if (canManage) void persist(next, memberRow);
      return next;
    });
  }, [canManage, persist, memberRow, setSched]);

  return {
    sched,
    memberRow,
    updateCell,
    updateMemberCell,
    updateMany,
    setCellFixed,
    unfixCell,
    resetCell,
    resetNonFixed,
    applyRandomToSched,
  };
}
