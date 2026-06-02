import { useMemo } from 'react';
import type { Cell } from '../../../types';
import {
  resolveMemberLockState,
  type ScheduleSlotContext,
} from '../cell/scheduleSlot';
import { ScheduleTableDesktop } from './ScheduleTableDesktop';
import { ScheduleTableMobile } from './ScheduleTableMobile';

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

  return (
    <div className="sched-card">
      <div className="sched-head">
        <h3>📅 이번 주 편성표 미리보기</h3>
        <span className="sched-op">20:00 ~ 02:00 운영</span>
      </div>

      <ScheduleTableDesktop
        sched={sched}
        memberRow={memberRow}
        todayIdx={todayIdx}
        nowMin={nowMin}
        slotCtx={slotCtx}
        memberLockState={memberLockState}
        canAccessMemberContent={canAccessMemberContent}
        isGuestLoggedIn={isGuestLoggedIn}
      />

      <ScheduleTableMobile
        key={todayIdx}
        sched={sched}
        memberRow={memberRow}
        todayIdx={todayIdx}
        nowMin={nowMin}
        slotCtx={slotCtx}
        memberLockState={memberLockState}
        canAccessMemberContent={canAccessMemberContent}
        isGuestLoggedIn={isGuestLoggedIn}
      />
    </div>
  );
}
