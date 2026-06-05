import type { useSchedule } from '../../../hooks/schedule/useSchedule';
import { ScheduleEditModal } from '../../schedule/ScheduleEditModal';
import { ConfirmModal } from '../../ConfirmModal';
import { RandomPickModal } from '../../schedule/modals/RandomPickModal';

type Sched = ReturnType<typeof useSchedule>;

interface Props {
  sched:            Sched;
  schedEditOpen:    boolean;
  canEditSchedule:  boolean;
  onCloseSchedEdit: () => void;
}

export function HomeScheduleOverlays({
  sched, schedEditOpen, canEditSchedule, onCloseSchedEdit,
}: Props) {
  return (
    <>
      {schedEditOpen && canEditSchedule && (
        <ScheduleEditModal
          sched={sched.sched}
          memberRow={sched.memberRow}
          onSaveAll={sched.updateMany}
          onSaveMemberAll={edits => {
            for (const e of edits) sched.updateMemberCell(e.dayIdx, e.title, e.link);
          }}
          onSetFixed={sched.setCellFixed}
          onUnfix={sched.unfixCell}
          onClose={onCloseSchedEdit}
        />
      )}

      {sched.resetConfirmOpen && canEditSchedule && (
        <ConfirmModal
          title="편성표 초기화"
          message="고정 편성(나는 솔로, 이혼숙려캠프)만 남기고 나머지 슬롯을 모두 비울까요? 회원 전용 편성은 유지됩니다."
          confirmLabel="초기화"
          danger
          onConfirm={sched.resetNonFixed}
          onClose={sched.closeResetConfirm}
        />
      )}

      {sched.randomPickerOpen && (
        <RandomPickModal
          key={sched.randomPool.map(i => i.id).join(',')}
          items={sched.randomPool}
          onApply={sched.applyRandomSelection}
          onClose={sched.closeRandomPicker}
        />
      )}
    </>
  );
}
