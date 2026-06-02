import type { Cell } from '../../types';
import { BASE_SCHED, BASE_MEMBER_ROW } from '../../constants/schedule';

export const SCHEDULE_LS_KEY = 'dadnosleep-sched';

interface StoredSched {
  week:       string;
  data:       Cell[][];
  memberRow?: Cell[];
}

export function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function loadStoredSchedule(): { sched: Cell[][]; memberRow: Cell[] } {
  try {
    const raw = localStorage.getItem(SCHEDULE_LS_KEY);
    if (!raw) return { sched: BASE_SCHED, memberRow: BASE_MEMBER_ROW };
    const stored: StoredSched = JSON.parse(raw);
    const currentWeek = getISOWeekKey(new Date());
    if (stored.week !== currentWeek) {
      localStorage.removeItem(SCHEDULE_LS_KEY);
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

export function persistSchedule(sched: Cell[][], memberRow: Cell[]): void {
  try {
    localStorage.setItem(SCHEDULE_LS_KEY, JSON.stringify({
      week: getISOWeekKey(new Date()),
      data: sched,
      memberRow,
    }));
  } catch { /* 무시 */ }
}
