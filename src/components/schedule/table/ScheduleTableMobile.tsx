import { useState } from 'react';
import type { Cell } from '../../../types';
import { DAYS, TIMES } from '../../../constants/schedule';
import { slotStatus } from '../../../utils/scheduleTime';
import {
  buildSlotPresentation,
  type MemberLockState,
  type ScheduleSlotContext,
} from '../cell/scheduleSlot';

interface Props {
  sched:                   Cell[][];
  memberRow:               Cell[];
  todayIdx:                number;
  nowMin:                  number;
  slotCtx:                 ScheduleSlotContext;
  memberLockState:         MemberLockState;
  canAccessMemberContent:  boolean;
  isGuestLoggedIn:         boolean;
}

export function ScheduleTableMobile({
  sched, memberRow, todayIdx, nowMin,
  slotCtx, memberLockState, canAccessMemberContent, isGuestLoggedIn,
}: Props) {
  const [mobileDayIdx, setMobileDayIdx] = useState(todayIdx);
  const renderMobileCell = (
    cell: Cell,
    di: number,
    ti: number | 'member',
    isToday: boolean,
    isLive: boolean,
  ) => {
    const { cellCls, body } = buildSlotPresentation(
      cell, di, ti, isToday, isLive, slotCtx, memberLockState,
    );
    return <div className={`sched-mobile-cell ${cellCls}`}>{body}</div>;
  };

  const di = mobileDayIdx;
  const isToday = di === todayIdx;

  return (
    <div className="sched-mobile">
      <div className="sched-mobile-day-tabs" role="tablist" aria-label="요일 선택">
        {DAYS.map((d, i) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={mobileDayIdx === i}
            className={`sched-mobile-day-tab ${mobileDayIdx === i ? 'active' : ''} ${i === todayIdx ? 'is-today' : ''}`}
            onClick={() => setMobileDayIdx(i)}
          >
            {d}
            {i === todayIdx && <span className="sched-mobile-today-dot" />}
          </button>
        ))}
      </div>

      <div className="sched-mobile-slots">
        {TIMES.map((t, ti) => {
          const cell = sched[di]?.[ti];
          if (!cell) return null;
          const status = isToday ? slotStatus(ti, nowMin) : '';
          return (
            <article key={t} className={`sched-mobile-slot ${status === 'live' ? 'is-live' : ''}`}>
              <header className="sched-mobile-slot-hd">
                <span className="sched-mobile-time">{t}</span>
                {status === 'live' && <span className="sched-mobile-live">ON AIR</span>}
              </header>
              {renderMobileCell(cell, di, ti, isToday, status === 'live')}
            </article>
          );
        })}
      </div>

      <div className="sched-mobile-member">
        <h4 className="sched-mobile-member-title">
          👑 회원 전용 VIP
          {!canAccessMemberContent && (
            <span className="sched-mobile-member-hint">
              {isGuestLoggedIn ? ' · 회원만 열람' : ' · 로그인 필요'}
            </span>
          )}
        </h4>
        {renderMobileCell(memberRow[di], di, 'member', isToday, false)}
      </div>

      <p className="sched-mobile-end">— 02:00 방송 종료 —</p>
    </div>
  );
}
