import type { useApiCards } from '../../hooks/useApiCards';
import type { useSchedule } from '../../hooks/schedule/useSchedule';
import type { useSuggestionForm } from '../../hooks/useSuggestionForm';
import { HomeMediaOverlays } from './overlays/HomeMediaOverlays';
import { HomeScheduleOverlays } from './overlays/HomeScheduleOverlays';
import { HomeSuggestionOverlays } from './overlays/HomeSuggestionOverlays';

type Sched = ReturnType<typeof useSchedule>;
type Suggest = ReturnType<typeof useSuggestionForm>;
type Api = ReturnType<typeof useApiCards>;

interface Props {
  sched:            Sched;
  suggest:          Suggest;
  api:              Api;
  schedEditOpen:    boolean;
  canEditSchedule:  boolean;
  onCloseSchedEdit: () => void;
}

export function HomeOverlays({
  sched, suggest, api, schedEditOpen, canEditSchedule,
  onCloseSchedEdit,
}: Props) {
  return (
    <>
      <HomeSuggestionOverlays suggest={suggest} />
      <HomeScheduleOverlays
        sched={sched}
        schedEditOpen={schedEditOpen}
        canEditSchedule={canEditSchedule}
        onCloseSchedEdit={onCloseSchedEdit}
      />
      <HomeMediaOverlays api={api} />
    </>
  );
}
