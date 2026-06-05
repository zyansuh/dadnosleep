import { useScheduleCore } from './useScheduleCore';
import { useScheduleLoader } from './useScheduleLoader';
import { useSchedulePublish } from './useSchedulePublish';
import { useScheduleRandom } from './useScheduleRandom';
import { useScheduleUi } from './useScheduleUi';

export function useSchedule(canManage: boolean) {
  const loader = useScheduleLoader(canManage);
  const core = useScheduleCore({
    sched:        loader.sched,
    memberRow:    loader.memberRow,
    setSched:     loader.setSched,
    setMemberRow: loader.setMemberRow,
    weekKey:      loader.weekKey,
    canManage,
  });
  const ui = useScheduleUi();
  const random = useScheduleRandom(core);
  const publish = useSchedulePublish(canManage, loader);

  return {
    sched: core.sched,
    memberRow: core.memberRow,
    loading: loader.loading,
    loadError: loader.error,
    isPublished: loader.isPublished,
    publishedAt: loader.publishedAt,
    hasDraft: loader.hasDraft,
    randing: random.randing,
    randError: random.randError,
    isEditMode: ui.isEditMode,
    randomPool: random.randomPool,
    randomPickerOpen: random.randomPickerOpen,
    resetConfirmOpen: ui.resetConfirmOpen,
    publishBusy: publish.publishBusy,
    publishError: publish.publishError,
    openRandomPicker: random.openRandomPicker,
    closeRandomPicker: random.closeRandomPicker,
    applyRandomSelection: random.applyRandomSelection,
    publishSchedule: publish.publishSchedule,
    unpublishSchedule: publish.unpublishSchedule,
    reloadSchedule: loader.reload,
    openResetConfirm: ui.openResetConfirm,
    closeResetConfirm: ui.closeResetConfirm,
    resetNonFixed: core.resetNonFixed,
    updateCell: core.updateCell,
    updateMemberCell: core.updateMemberCell,
    updateMany: core.updateMany,
    setCellFixed: core.setCellFixed,
    unfixCell: core.unfixCell,
    resetCell: core.resetCell,
    toggleEditMode: ui.toggleEditMode,
  };
}
