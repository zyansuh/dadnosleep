import { useState, useCallback } from 'react';
import type { Cell, RecommendItem } from '../types';
import { BASE_SCHED, BASE_MEMBER_ROW } from '../constants/schedule';
import { EMPTY_CELL } from '../constants/emptyCell';
import { fetchRandomRecommendPool } from '../utils/recommend';

const LS_KEY = 'dadnosleep-sched';

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

interface StoredSched {
  week:       string;
  data:       Cell[][];
  memberRow?: Cell[];
}

function loadStored(): { sched: Cell[][]; memberRow: Cell[] } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sched: BASE_SCHED, memberRow: BASE_MEMBER_ROW };
    const stored: StoredSched = JSON.parse(raw);
    const currentWeek = getISOWeekKey(new Date());
    if (stored.week !== currentWeek) {
      localStorage.removeItem(LS_KEY);
      return { sched: BASE_SCHED, memberRow: BASE_MEMBER_ROW };
    }
    const schedOk = stored.data?.length === BASE_SCHED.length
      && stored.data[0]?.length === BASE_SCHED[0].length;
    const memberRow = stored.memberRow?.length === 7
      ? stored.memberRow
      : BASE_MEMBER_ROW;
    if (schedOk) return { sched: stored.data, memberRow };
  } catch { /* 기본값 */ }
  return { sched: BASE_SCHED, memberRow: BASE_MEMBER_ROW };
}

function touchUpdatedAt(cell: Cell): Cell {
  return { ...cell, updatedAt: new Date().toISOString() };
}

function patchCellContent(cell: Cell, title: string, link?: string): Cell {
  return touchUpdatedAt({
    ...cell,
    title,
    link: link?.trim() || undefined,
    type: cell.type === 'empty' ? 'ott' : cell.type,
  });
}

function toFixedCell(cell: Cell, title: string, link?: string): Cell {
  return {
    ...cell,
    title,
    link: link?.trim() || undefined,
    type:  'fixed',
    badge: '★ 고정 편성',
    bt:    'pink',
  };
}

function toUnfixedCell(cell: Cell): Cell {
  return {
    ...cell,
    type:  'ott',
    badge: 'OTT',
    bt:    'blue',
    sub:   cell.sub || 'OTT 추천',
  };
}

function recommendToCell(cell: Cell, item: RecommendItem): Cell {
  return touchUpdatedAt({
    ...cell,
    type:  'random',
    title: item.title.slice(0, 11),
    sub:   item.platform,
    badge: '편성 추천',
    bt:    'pink',
    link:  item.link,
  });
}

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
  const initial = loadStored();
  const [sched,            setSched]            = useState<Cell[][]>(initial.sched);
  const [memberRow,        setMemberRow]        = useState<Cell[]>(initial.memberRow);
  const [randing,          setRanding]          = useState(false);
  const [randError,        setRandError]        = useState('');
  const [isEditMode,       setIsEditMode]       = useState(false);
  const [randomPool,       setRandomPool]       = useState<RecommendItem[]>([]);
  const [randomPickerOpen, setRandomPickerOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const persist = useCallback((next: Cell[][], member: Cell[]) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        week: getISOWeekKey(new Date()),
        data: next,
        memberRow: member,
      }));
    } catch { /* 무시 */ }
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
        i === dayIdx
          ? touchUpdatedAt({
            ...cell,
            title,
            link: link?.trim() || undefined,
            type: 'member' as const,
          })
          : cell
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
          di === dayIdx && ti === timeIdx ? BASE_SCHED[di][ti] : cell
        )
      );
      persist(next, memberRow);
      return next;
    });
  }, [persist, memberRow]);

  const resetNonFixed = useCallback(() => {
    setSched(prev => {
      const next = prev.map(day =>
        day.map(cell => (cell.type === 'fixed' ? cell : { ...EMPTY_CELL }))
      );
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
        setRandError('콘텐츠를 불러오지 못했습니다. Vercel 환경변수(VITE_TMDB_READ_TOKEN)를 확인해주세요.');
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
