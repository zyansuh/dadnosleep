import { useState } from 'react';
import { Edit3, RotateCcw } from 'lucide-react';
import type { Cell } from '../../../types';
import { BASE_MEMBER_ROW } from '../../../constants/schedule';
import { ScheduleTable } from '../../schedule/ScheduleTable';
import { EditCellModal } from '../../schedule/EditCellModal';

type EditTarget =
  | { kind: 'main'; dayIdx: number; timeIdx: number }
  | { kind: 'member'; dayIdx: number };

interface Props {
  sched:                   Cell[][];
  memberRow:               Cell[];
  todayIdx:                number;
  nowMin:                  number;
  canEditSchedule:         boolean;
  isLoggedIn:              boolean;
  isGuestLoggedIn:         boolean;
  canAccessMemberContent:  boolean;
  isEditMode:              boolean;
  onLoginClick:            () => void;
  onToggleEditMode:        () => void;
  onOpenResetConfirm:      () => void;
  onUpdateCell:            (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onUpdateMemberCell:      (dayIdx: number, title: string, link?: string) => void;
  onSetCellFixed:          (dayIdx: number, timeIdx: number, title?: string, link?: string) => void;
  onUnfixCell:             (dayIdx: number, timeIdx: number) => void;
  onResetCell:             (dayIdx: number, timeIdx: number) => void;
}

export function HeroSchedulePanel({
  sched, memberRow, todayIdx, nowMin, canEditSchedule,
  isLoggedIn, isGuestLoggedIn, canAccessMemberContent, isEditMode,
  onLoginClick, onToggleEditMode, onOpenResetConfirm,
  onUpdateCell, onUpdateMemberCell, onSetCellFixed, onUnfixCell, onResetCell,
}: Props) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const editingCell = editTarget
    ? editTarget.kind === 'member'
      ? memberRow[editTarget.dayIdx]
      : sched[editTarget.dayIdx]?.[editTarget.timeIdx]
    : null;

  return (
    <div className="hero-right" id="schedule-section">
      {canEditSchedule && (
        <div className="sched-edit-bar">
          <button
            type="button"
            className={`btn-edit-toggle ${isEditMode ? 'active' : ''}`}
            onClick={onToggleEditMode}
          >
            <Edit3 size={14} />
            {isEditMode ? '편집 모드 끄기' : '셀 편집 모드'}
          </button>
          <button type="button" className="btn-sched-reset" onClick={onOpenResetConfirm}>
            <RotateCcw size={14} /> 초기화
          </button>
          {isEditMode && (
            <span className="edit-mode-hint">셀 클릭 수정 · 👑 회원 VIP 행 포함 · 🔓 고정 해제</span>
          )}
        </div>
      )}

      <ScheduleTable
        sched={sched}
        memberRow={memberRow}
        todayIdx={todayIdx}
        nowMin={nowMin}
        isEditMode={canEditSchedule && isEditMode}
        isScheduleEditor={canEditSchedule}
        canAccessMemberContent={canAccessMemberContent}
        isLoggedIn={isLoggedIn}
        isGuestLoggedIn={isGuestLoggedIn}
        onLoginClick={onLoginClick}
        onEditCell={(di, ti) => setEditTarget({ kind: 'main', dayIdx: di, timeIdx: ti })}
        onEditMember={di => setEditTarget({ kind: 'member', dayIdx: di })}
        onUnfixCell={onUnfixCell}
      />

      {editTarget && editingCell && (
        <EditCellModal
          cell={editingCell.type === 'empty'
            ? { ...editingCell, title: '', type: 'ott', badge: 'OTT', bt: 'blue', sub: 'OTT 추천' }
            : editingCell}
          dayIdx={editTarget.dayIdx}
          timeIdx={editTarget.kind === 'main' ? editTarget.timeIdx : 0}
          onSave={(di, _ti, title, link) => {
            if (editTarget.kind === 'member') onUpdateMemberCell(di, title, link);
            else onUpdateCell(di, editTarget.timeIdx, title, link);
          }}
          onSetFixed={(di, _ti, title, link) => {
            if (editTarget.kind === 'main') onSetCellFixed(di, editTarget.timeIdx, title, link);
          }}
          onUnfix={(di, ti) => {
            if (editTarget.kind === 'main') onUnfixCell(di, ti);
          }}
          onReset={(di, ti) => {
            if (editTarget.kind === 'member') {
              onUpdateMemberCell(di, BASE_MEMBER_ROW[di].title, BASE_MEMBER_ROW[di].link);
            } else {
              onResetCell(di, ti);
            }
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
