import type { MouseEvent } from 'react';
import type { Cell } from '../types';
import { DAYS, TIMES } from '../constants/schedule';
import { slotStatus } from '../utils/scheduleTime';
import { CellInner, type MemberLockState } from './CellInner';

interface Props {
  sched:                   Cell[][];
  memberRow:               Cell[];
  todayIdx:                number;
  nowMin:                  number;
  isEditMode:              boolean;
  /** 편성 관리자가 편집 모드일 때 회원 셀 잠금 UI 생략 */
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
  const memberLockState: MemberLockState =
    (isEditMode && isScheduleEditor) || canAccessMemberContent
      ? 'open'
      : isLoggedIn
        ? 'members-only'
        : 'login';

  const renderCell = (
    cell: Cell,
    di: number,
    ti: number | 'member',
    isToday: boolean,
    isLive: boolean,
  ) => {
    const isMemberCell = cell.type === 'member';
    const locked = isMemberCell && memberLockState !== 'open';

    const cellCls = [
      'td-cell',
      `cell-${cell.type}`,
      isToday ? 'cell-today' : '',
      isLive ? 'cell-live' : '',
      isEditMode ? 'cell-editable' : '',
      locked ? 'cell-member-guest' : '',
    ].filter(Boolean).join(' ');

    const canLink = cell.link && !isEditMode && cell.type !== 'empty'
      && (!isMemberCell || canAccessMemberContent);

    const handleClick = isEditMode
      ? () => (ti === 'member' ? onEditMember(di) : onEditCell(di, ti))
      : undefined;

    const handleUnfix = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof ti === 'number') onUnfixCell(di, ti);
    };

    const inner = (
      <CellInner
        cell={cell}
        isLive={isLive}
        memberLockState={isMemberCell ? memberLockState : 'open'}
        onLoginClick={onLoginClick}
      />
    );

    return (
      <td key={ti === 'member' ? `m-${di}` : di} className={cellCls}>
        {canLink ? (
          <a href={cell.link} target="_blank" rel="noopener noreferrer" className="cell-inner">
            {inner}
          </a>
        ) : (
          <div
            className="cell-inner"
            onClick={handleClick}
            role={isEditMode ? 'button' : undefined}
            tabIndex={isEditMode ? 0 : undefined}
          >
            {isEditMode && <span className="cell-edit-icon">✏️</span>}
            {isEditMode && cell.type === 'fixed' && typeof ti === 'number' && (
              <button type="button" className="cell-unfix-btn" title="고정 편성 해제" onClick={handleUnfix}>
                🔓
              </button>
            )}
            {inner}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="sched-card">
      <div className="sched-head">
        <h3>📅 이번 주 편성표 미리보기</h3>
        <span className="sched-op">20:00 ~ 02:00 운영</span>
      </div>
      <div className="table-scroll">
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
                {sched.map((day, di) => {
                  const cell = day[ti];
                  const isToday = di === todayIdx;
                  const status = isToday ? slotStatus(ti, nowMin) : '';
                  return renderCell(cell, di, ti, isToday, status === 'live');
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
              {memberRow.map((cell, di) => {
                const isToday = di === todayIdx;
                return renderCell(cell, di, 'member', isToday, false);
              })}
            </tr>

            <tr>
              <td className="td-t td-end">02:00</td>
              <td colSpan={7} className="td-end-label">— 방송 종료 —</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
