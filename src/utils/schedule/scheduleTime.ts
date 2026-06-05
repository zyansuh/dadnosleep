import { TIMES, SLOT_END_TIMES } from '../../constants/schedule';

/** "HH:MM" → 분(새벽 0~5시는 +1440으로 당일 처리) */
export function toMin(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  return (h < 6 ? h + 24 : h) * 60 + m;
}

/** 현재 분(nowMin) 기준으로 슬롯 상태 반환 */
export function slotStatus(
  timeIdx: number,
  nowMin: number
): 'past' | 'live' | 'upcoming' {
  const start = toMin(TIMES[timeIdx]);
  const end   = toMin(SLOT_END_TIMES[timeIdx]);
  if (nowMin >= end)   return 'past';
  if (nowMin >= start) return 'live';
  return 'upcoming';
}

/** Date → 현재 분(당일 기준, 새벽 보정 포함) */
export function dateToNowMin(date: Date): number {
  const h = date.getHours();
  return (h < 6 ? h + 24 : h) * 60 + date.getMinutes();
}
