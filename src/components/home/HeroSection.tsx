import type { Cell } from '../../types';
import { HeroIntro } from './hero/HeroIntro';
import { HeroSchedulePanel } from './hero/HeroSchedulePanel';

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

export function HeroSection(props: Props) {
  const {
    randing, randError, canEditSchedule, canAccessMemberContent,
    isLoggedIn, isGuestLoggedIn, onLoginClick, onOpenRandomPicker, onOpenScheduleEdit,
    ...panel
  } = props;

  return (
    <section className="hero">
      <HeroIntro
        randing={randing}
        randError={randError}
        canEditSchedule={canEditSchedule}
        canAccessMemberContent={canAccessMemberContent}
        isLoggedIn={isLoggedIn}
        isGuestLoggedIn={isGuestLoggedIn}
        onLoginClick={onLoginClick}
        onOpenRandomPicker={onOpenRandomPicker}
        onOpenScheduleEdit={onOpenScheduleEdit}
      />
      <HeroSchedulePanel
        {...panel}
        canEditSchedule={canEditSchedule}
        isLoggedIn={isLoggedIn}
        isGuestLoggedIn={isGuestLoggedIn}
        canAccessMemberContent={canAccessMemberContent}
        onLoginClick={onLoginClick}
      />
    </section>
  );
}
