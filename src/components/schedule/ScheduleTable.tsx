import { useEffect, useState, useMemo } from 'react';
import type { Cell } from '../../types';
import { DAYS, TIMES } from '../../constants/schedule';
import { slotStatus } from '../../utils/scheduleTime';
import {
  buildSlotPresentation,
  resolveMemberLockState,
  type ScheduleSlotContext,
} from './scheduleSlot';

interface Props {
  sched:                   Cell[][];
  memberRow:               Cell[];
  todayIdx:                number;
  nowMin:                  number;
  isEditMode:              boolean;
  isScheduleEditor:        boolean;
  canAccessMemberContent:  boolean;
  isLoggedIn:              boolean;
  isGuestLoggedIn:         boolean;
  onLoginClick:            () => void;
  onEditCell:              (dayIdx: number, timeIdx: number) => void;
  onEditMember:            (dayIdx: number) => void;
  onUnfixCell:             (dayIdx: number, timeIdx: number) => void;
}

export function ScheduleTable({
  sched, memberRow, todayIdx, nowMin, isEditMode, isScheduleEditor,
  canAccessMemberContent, isLoggedIn, isGuestLoggedIn, onLoginClick,
  onEditCell, onEditMember, onUnfixCell,
}: Props) {
  const [mobileDayIdx, setMobileDayIdx] = useState(todayIdx);

  useEffect(() => {
    setMobileDayIdx(todayIdx);
  }, [todayIdx]);

  const slotCtx: ScheduleSlotContext = useMemo(() => ({
    isEditMode,
    canAccessMemberContent,
    isLoggedIn,
    isGuestLoggedIn,
    isScheduleEditor,
    onLoginClick,
    onEditCell,
    onEditMember,
    onUnfixCell,
  }), [
    isEditMode, canAccessMemberContent, isLoggedIn, isGuestLoggedIn, isScheduleEditor,
    onLoginClick, onEditCell, onEditMember, onUnfixCell,
  ]);

  const memberLockState = resolveMemberLockState(slotCtx);

  const renderTableCell = (
    cell: Cell,
    di: number,
    ti: number | 'member',
    isToday: boolean,
    isLive: boolean,
  ) => {
    const { cellCls, body } = buildSlotPresentation(
      cell, di, ti, isToday, isLive, slotCtx, memberLockState,
    );
    return (
      <td key={ti === 'member' ? `m-${di}` : di} className={cellCls}>
        {body}
      </td>
    );
  };

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
    <div className="sched-card">
      <div className="sched-head">
        <h3>📅 이번 주 편성표 미리보기</h3>
        <span className="sched-op">20:00 ~ 02:00 운영</span>
      </div>

      <div className="table-scroll sched-desktop">
        <table className="sched-tbl">
          <thead>
            <tr>
              <th className="th-empty" />
              {DAYS.map((d, i) => (
                <th key={d} className={i === todayIdx ? 'th-today' : ''}>
                  {d}
                  {i === todayIdx && <span className="today-dot" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIMES.map((t, ti) => (
              <tr key={t}>
                <td className="td-t">{t}</td>
                {sched.map((day, dayIdx) => {
                  const cell = day[ti];
                  const today = dayIdx === todayIdx;
                  const status = today ? slotStatus(ti, nowMin) : '';
                  return renderTableCell(cell, dayIdx, ti, today, status === 'live');
                })}
              </tr>
            ))}

            <tr className="member-section-divider">
              <td colSpan={8} className="member-section-label">
                👑 회원 전용 편성
                {!canAccessMemberContent && (
                  <span className="member-section-hint">
                    {isGuestLoggedIn
                      ? ' — 동호회 회원만 열람 가능합니다'
                      : ' — 로그인 후 회원 인증이 필요합니다'}
                  </span>
                )}
              </td>
            </tr>
            <tr className="member-section-row">
              <td className="td-t td-member">VIP</td>
              {memberRow.map((cell, dayIdx) => {
                const today = dayIdx === todayIdx;
                return renderTableCell(cell, dayIdx, 'member', today, false);
              })}
            </tr>

            <tr>
              <td className="td-t td-end">02:00</td>
              <td colSpan={7} className="td-end-label">— 방송 종료 —</td>
            </tr>
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
