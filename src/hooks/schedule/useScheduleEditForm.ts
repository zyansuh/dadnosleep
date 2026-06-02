import { useState, useCallback } from 'react';
import type { Cell } from '../../types';
import { DAYS, TIMES } from '../../constants/schedule';

export interface ScheduleEditRow {
  title:  string;
  link:   string;
  locked: boolean;
}

export function useScheduleEditForm(sched: Cell[][], memberRow: Cell[]) {
  const today = new Date();
  const defaultDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const [activeDay, setActiveDay] = useState(defaultDay);

  const [rows, setRows] = useState<ScheduleEditRow[][]>(() =>
    sched.map(day =>
      day.map(cell => ({
        title:  cell.title,
        link:   cell.link ?? '',
        locked: cell.type === 'fixed',
      }))
    )
  );

  const [memberRows, setMemberRows] = useState<{ title: string; link: string }[]>(() =>
    memberRow.map(cell => ({ title: cell.title, link: cell.link ?? '' }))
  );

  const updateMemberRow = useCallback((dayIdx: number, field: 'title' | 'link', value: string) => {
    setMemberRows(prev =>
      prev.map((row, i) => (i === dayIdx ? { ...row, [field]: value } : row))
    );
  }, []);

  const updateRow = useCallback((dayIdx: number, timeIdx: number, field: 'title' | 'link', value: string) => {
    setRows(prev =>
      prev.map((day, di) =>
        day.map((row, ti) =>
          di === dayIdx && ti === timeIdx ? { ...row, [field]: value } : row
        )
      )
    );
  }, []);

  const unfixRow = useCallback((dayIdx: number, timeIdx: number) => {
    setRows(prev =>
      prev.map((day, di) =>
        day.map((row, ti) =>
          di === dayIdx && ti === timeIdx ? { ...row, locked: false } : row
        )
      )
    );
  }, []);

  const lockRow = useCallback((dayIdx: number, timeIdx: number, title: string) => {
    setRows(prev =>
      prev.map((day, di) =>
        day.map((r, ti) =>
          di === dayIdx && ti === timeIdx ? { ...r, locked: true, title } : r
        )
      )
    );
  }, []);

  const collectEdits = useCallback(() => {
    const edits: { dayIdx: number; timeIdx: number; title: string; link?: string }[] = [];
    rows.forEach((day, di) => {
      day.forEach((row, ti) => {
        if (row.locked) return;
        const original = sched[di][ti];
        if (row.title.trim() !== original.title || row.link.trim() !== (original.link ?? '')) {
          edits.push({
            dayIdx:  di,
            timeIdx: ti,
            title:   row.title.trim() || original.title,
            link:    row.link.trim() || undefined,
          });
        }
      });
    });

    const memberEdits: { dayIdx: number; title: string; link?: string }[] = [];
    memberRows.forEach((row, di) => {
      const orig = memberRow[di];
      if (!orig) return;
      const title = row.title.trim();
      const link = row.link.trim();
      if (title !== orig.title || link !== (orig.link ?? '')) {
        memberEdits.push({
          dayIdx: di,
          title:  title || orig.title,
          link:   link || undefined,
        });
      }
    });

    return { edits, memberEdits };
  }, [rows, memberRows, sched, memberRow]);

  return {
    activeDay,
    setActiveDay,
    defaultDay,
    rows,
    memberRows,
    updateRow,
    updateMemberRow,
    unfixRow,
    lockRow,
    collectEdits,
    DAYS,
    TIMES,
  };
}
