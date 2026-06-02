import { useScheduleCore } from './useScheduleCore';
import { useScheduleRandom } from './useScheduleRandom';
import { useScheduleUi } from './useScheduleUi';

export function useSchedule() {
  const core = useScheduleCore();
  const random = useScheduleRandom(core);
  const ui = useScheduleUi();

  return {
    sched: core.sched,
    memberRow: core.memberRow,
    updateCell: core.updateCell,
    updateMemberCell: core.updateMemberCell,
    updateMany: core.updateMany,
    setCellFixed: core.setCellFixed,
    unfixCell: core.unfixCell,
    resetCell: core.resetCell,
    resetNonFixed: core.resetNonFixed,
    ...random,
    ...ui,
  };
}
