import { useState } from 'react';
import { Heart, Calendar, Edit3, AlertCircle, RotateCcw } from 'lucide-react';
import type { Cell } from '../../types';
import { BASE_MEMBER_ROW } from '../../constants/schedule';
import { ScheduleTable } from '../schedule/ScheduleTable';
import { EditCellModal } from '../schedule/EditCellModal';

interface Props {
  sched:               Cell[][];
  memberRow:           Cell[];
  todayIdx:            number;
  nowMin:              number;
  randing:             boolean;
  randError:           string;
  canEditSchedule:         boolean;
  isLoggedIn:              boolean;
  isGuestLoggedIn:         boolean;
  canAccessMemberContent:  boolean;
  onLoginClick:            () => void;
  isEditMode:          boolean;
  onToggleEditMode:    () => void;
  onOpenScheduleEdit:  () => void;
  onOpenResetConfirm:  () => void;
  onUpdateCell:        (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onUpdateMemberCell:  (dayIdx: number, title: string, link?: string) => void;
  onSetCellFixed:      (dayIdx: number, timeIdx: number, title?: string, link?: string) => void;
  onUnfixCell:         (dayIdx: number, timeIdx: number) => void;
  onResetCell:         (dayIdx: number, timeIdx: number) => void;
  onOpenRandomPicker:  () => void;
}

type EditTarget =
  | { kind: 'main'; dayIdx: number; timeIdx: number }
  | { kind: 'member'; dayIdx: number };

export function HeroSection({
  sched, memberRow, todayIdx, nowMin, randing, randError,
  canEditSchedule, isLoggedIn, isGuestLoggedIn, canAccessMemberContent, onLoginClick,
  isEditMode, onToggleEditMode, onOpenScheduleEdit, onOpenResetConfirm,
  onUpdateCell, onUpdateMemberCell, onSetCellFixed, onUnfixCell, onResetCell, onOpenRandomPicker,
}: Props) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const editingCell = editTarget
    ? editTarget.kind === 'member'
      ? memberRow[editTarget.dayIdx]
      : sched[editTarget.dayIdx]?.[editTarget.timeIdx]
    : null;

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-pill">
          <Heart size={12} fill="currentColor" />
          목·금 고정 편성 + 실시간 랜덤 추천
        </div>

        <div className="hero-title-wrap">
          <h1 className="site-title">아빠안잔다</h1>
        </div>

        <p className="site-sub">우리가 함께 보는 OTT 편성표</p>
        <p className="site-desc">
          하루의 끝, 가족·연인·친구가 함께 즐길 수 있는<br />
          OTT 프로그램을 고정 편성과 실시간 추천으로 매일 새롭게 만나보세요.
        </p>

        <div className="hero-ctas">
          <a href="#schedule-section" className="btn-hero-primary">
            <Calendar size={15} /> 오늘 편성표 보기
          </a>
          <button className="btn-hero-secondary" onClick={onOpenRandomPicker} disabled={randing}>
            ⭐ {randing ? '생성 중…' : '랜덤 편성 생성하기'}
          </button>
          {canEditSchedule && (
            <button className="btn-hero-secondary btn-hero-edit" onClick={onOpenScheduleEdit}>
              <Edit3 size={14} /> 편성표 수정하기
            </button>
          )}
        </div>

        {!canAccessMemberContent && (
          <p className="hero-member-hint">
            {isLoggedIn && !isGuestLoggedIn ? (
              <>🔒 VIP 회원만 회원 전용 편성을 볼 수 있습니다. VIP 지정은 관리자에게 문의해 주세요.</>
            ) : isGuestLoggedIn ? (
              <>🔒 동호회 명단에 등록된 회원만 이용할 수 있습니다. 가입 문의는 관리자에게 연락해 주세요.</>
            ) : (
              <>
                🔒 <button type="button" className="link-btn" onClick={onLoginClick}>로그인</button>
                하시면 동호회 회원·VIP 전용 편성을 확인할 수 있어요.
              </>
            )}
          </p>
        )}

        {randError && (
          <div className="rand-error">
            <AlertCircle size={14} />
            <span>{randError}</span>
          </div>
        )}
      </div>

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
      </div>

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
    </section>
  );
}
