import { useState, useCallback } from 'react';
import type { Cell } from '../../types';
import { loadStoredSchedule, persistSchedule } from '../../utils/schedule/scheduleStorage';
import {
  patchCellContent,
  toFixedCell,
  toUnfixedCell,
  resetCellToBase,
  emptyNonFixedCell,
  touchMemberCell,
} from '../../utils/schedule/scheduleCell';

export function useScheduleCore() {
  const initial = loadStoredSchedule();
  const [sched, setSched] = useState<Cell[][]>(initial.sched);
  const [memberRow, setMemberRow] = useState<Cell[]>(initial.memberRow);

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
    [persist, memberRow],
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

  const applyRandomToSched = useCallback((
    mapper: (prev: Cell[][]) => Cell[][],
  ) => {
    setSched(prev => {
      const next = mapper(prev);
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

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
