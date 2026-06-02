import type { Cell } from '../../../types';
import { BASE_SCHED, BASE_MEMBER_ROW } from '../../../constants/schedule';
import { SCHEDULE_LS_KEY } from './constants';
import type { StoredSched } from './types';
import { getISOWeekKey } from './weekKey';

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
