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

export function ScheduleTableDesktop({
  sched, memberRow, todayIdx, nowMin, slotCtx, memberLockState,
  canAccessMemberContent, isGuestLoggedIn,
}: Props) {
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

  return (
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
  );
}
