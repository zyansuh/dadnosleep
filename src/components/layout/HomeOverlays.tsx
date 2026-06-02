import { Plus } from 'lucide-react';
import type { useApiCards } from '../../hooks/useApiCards';
import type { useSchedule } from '../../hooks/schedule/useSchedule';
import type { useSuggestionForm } from '../../hooks/useSuggestionForm';
import { SuggestionModal } from '../SuggestionModal';
import { ScheduleEditModal } from '../schedule/ScheduleEditModal';
import { SuggestionBoard } from '../SuggestionBoard';
import { ConfirmModal } from '../ConfirmModal';
import { RandomPickModal } from '../RandomPickModal';
import { MediaDrawer } from '../MediaDrawer';

type Sched = ReturnType<typeof useSchedule>;
type Suggest = ReturnType<typeof useSuggestionForm>;
type Api = ReturnType<typeof useApiCards>;

interface Props {
  sched:            Sched;
  suggest:          Suggest;
  api:              Api;
  schedEditOpen:    boolean;
  boardOpen:        boolean;
  canEditSchedule:  boolean;
  onCloseSchedEdit: () => void;
  onCloseBoard:     () => void;
}

export function HomeOverlays({
  sched, suggest, api, schedEditOpen, boardOpen, canEditSchedule,
  onCloseSchedEdit, onCloseBoard,
}: Props) {
  return (
    <>
      <button className="fab" onClick={suggest.openModal} aria-label="프로그램 건의하기">
        <Plus size={18} /><span>건의</span>
      </button>

      {suggest.modalOpen && (
        <SuggestionModal
          form={suggest.form}
          setForm={suggest.setForm}
          errors={suggest.errors}
          submitted={suggest.submitted}
          setSubmitted={suggest.setSubmitted}
          validate={suggest.validate}
          onClose={suggest.closeModal}
        />
      )}

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

      {boardOpen && (
        <SuggestionBoard suggestions={suggest.suggestions} onClose={onCloseBoard} />
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
          items={sched.randomPool}
          onApply={sched.applyRandomSelection}
          onClose={sched.closeRandomPicker}
        />
      )}

      <MediaDrawer
        open={api.drawerMode === 'ott'}
        title="OTT 통합 인기작"
        subtitle="Netflix · Disney+ · wavve · Apple TV+"
        loading={api.drawerLoading}
        error={api.drawerError}
        items={api.drawerItems}
        onClose={api.closeDrawer}
      />

      <MediaDrawer
        open={api.drawerMode === 'random'}
        title="랜덤 편성 추천"
        subtitle="TMDB 한국어 콘텐츠 · 장르·플랫폼 정보"
        loading={api.drawerLoading}
        error={api.drawerError}
        items={api.drawerItems}
        onClose={api.closeDrawer}
      />
    </>
  );
}
