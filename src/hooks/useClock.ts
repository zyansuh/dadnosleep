import { useState, useEffect } from 'react';
import { dateToNowMin } from '../utils/scheduleTime';

interface ClockState {
  now:      Date;
  todayIdx: number; // 0=월 ~ 6=일
  nowMin:   number; // 현재 시각(분, 새벽 보정 포함)
}

export function useClock(): ClockState {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return {
    now,
    todayIdx: (now.getDay() + 6) % 7,
    nowMin:   dateToNowMin(now),
  };
}
