import type { Cell } from '../../../types';
import { SCHEDULE_LS_KEY } from './constants';
import { getISOWeekKey } from './weekKey';

export function persistSchedule(sched: Cell[][], memberRow: Cell[]): void {
  try {
    localStorage.setItem(SCHEDULE_LS_KEY, JSON.stringify({
      week: getISOWeekKey(new Date()),
      data: sched,
      memberRow,
    }));
  } catch { /* 무시 */ }
}
