import type { MouseEvent, ReactNode } from 'react';
import type { Cell } from '../../types';
import { CellInner, type MemberLockState } from './CellInner';

export interface ScheduleSlotContext {
  isEditMode:             boolean;
  canAccessMemberContent: boolean;
  isLoggedIn:             boolean;
  isGuestLoggedIn:        boolean;
  isScheduleEditor:       boolean;
  onLoginClick:           () => void;
  onEditCell:             (dayIdx: number, timeIdx: number) => void;
  onEditMember:           (dayIdx: number) => void;
  onUnfixCell:            (dayIdx: number, timeIdx: number) => void;
}

export function resolveMemberLockState(ctx: ScheduleSlotContext): MemberLockState {
  if ((ctx.isEditMode && ctx.isScheduleEditor) || ctx.canAccessMemberContent) return 'open';
  if (ctx.isLoggedIn) return 'members-only';
  return 'login';
}

export interface SlotPresentation {
  cellCls: string;
  body:    ReactNode;
}

export function buildSlotPresentation(
  cell: Cell,
  di: number,
  ti: number | 'member',
  isToday: boolean,
  isLive: boolean,
  ctx: ScheduleSlotContext,
  memberLockState: MemberLockState,
): SlotPresentation {
  const isMemberCell = cell.type === 'member';
  const locked = isMemberCell && memberLockState !== 'open';

  const cellCls = [
    'td-cell',
    `cell-${cell.type}`,
    isToday ? 'cell-today' : '',
    isLive ? 'cell-live' : '',
    ctx.isEditMode ? 'cell-editable' : '',
    locked ? 'cell-member-guest' : '',
  ].filter(Boolean).join(' ');

  const canLink = cell.link && !ctx.isEditMode && cell.type !== 'empty'
    && (!isMemberCell || ctx.canAccessMemberContent);

  const handleClick = ctx.isEditMode
    ? () => (ti === 'member' ? ctx.onEditMember(di) : ctx.onEditCell(di, ti as number))
    : undefined;

  const handleUnfix = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof ti === 'number') ctx.onUnfixCell(di, ti);
  };

  const inner = (
    <CellInner
      cell={cell}
      isLive={isLive}
      memberLockState={isMemberCell ? memberLockState : 'open'}
      onLoginClick={ctx.onLoginClick}
    />
  );

  const body = canLink ? (
    <a href={cell.link} target="_blank" rel="noopener noreferrer" className="cell-inner">
      {inner}
    </a>
  ) : (
    <div
      className="cell-inner"
      onClick={handleClick}
      role={ctx.isEditMode ? 'button' : undefined}
      tabIndex={ctx.isEditMode ? 0 : undefined}
    >
      {ctx.isEditMode && <span className="cell-edit-icon">✏️</span>}
      {ctx.isEditMode && cell.type === 'fixed' && typeof ti === 'number' && (
        <button type="button" className="cell-unfix-btn" title="고정 편성 해제" onClick={handleUnfix}>
          🔓
        </button>
      )}
      {inner}
    </div>
  );

  return { cellCls, body };
}
