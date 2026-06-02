import type { Cell, ApiType, OttItem, YtItem } from '../../types';
import type { PointRecord } from '../../types/community';
import { HeroSection } from '../../components/HeroSection';
import { ApiSection } from '../../components/ApiSection';
import { InfoSection } from '../../components/InfoSection';
import { HomeRanking } from '../../components/community/HomeRanking';
import { SiteFooter } from '../../components/SiteFooter';
import { HomeCtaBanner } from './HomeCtaBanner';

interface Props {
  sched:                    Cell[][];
  memberRow:                Cell[];
  todayIdx:                 number;
  nowMin:                   number;
  randing:                  boolean;
  randError:                string;
  canEditSchedule:          boolean;
  isLoggedIn:               boolean;
  isGuestLoggedIn:          boolean;
  canAccessMemberContent:   boolean;
  isEditMode:               boolean;
  onLoginClick:             () => void;
  onToggleEditMode:         () => void;
  onOpenResetConfirm:       () => void;
  onUpdateCell:             (dayIdx: number, timeIdx: number, title: string, link?: string) => void;
  onUpdateMemberCell:       (dayIdx: number, title: string, link?: string) => void;
  onSetCellFixed:           (dayIdx: number, timeIdx: number, title?: string, link?: string) => void;
  onUnfixCell:              (dayIdx: number, timeIdx: number) => void;
  onResetCell:              (dayIdx: number, timeIdx: number) => void;
  onOpenRandomPicker:       () => void;
  onOpenScheduleEdit:       () => void;
  activeApi:                ApiType | null;
  ottItems:                 OttItem[];
  ytItems:                  YtItem[];
  ottLoading:               boolean;
  ottError:                 string;
  apiRanding:                 boolean;
  handleApiCard:            (type: ApiType) => Promise<void>;
  onOpenOttDrawer:          () => void;
  onOpenRandomDrawer:       () => void;
  points:                   PointRecord[];
  vipKeys:                  Set<string>;
  onGoCommunity:            () => void;
}

export function HomeMainView({
  sched, memberRow, todayIdx, nowMin, randing, randError,
  canEditSchedule, isLoggedIn, isGuestLoggedIn, canAccessMemberContent,
  isEditMode, onLoginClick, onToggleEditMode, onOpenResetConfirm,
  onUpdateCell, onUpdateMemberCell, onSetCellFixed, onUnfixCell, onResetCell,
  onOpenRandomPicker, onOpenScheduleEdit,
  activeApi, ottItems, ytItems, ottLoading, ottError, apiRanding,
  handleApiCard, onOpenOttDrawer, onOpenRandomDrawer,
  points, vipKeys, onGoCommunity,
}: Props) {
  return (
    <>
      <HeroSection
        sched={sched}
        memberRow={memberRow}
        todayIdx={todayIdx}
        nowMin={nowMin}
        randing={randing}
        randError={randError}
        canEditSchedule={canEditSchedule}
        isLoggedIn={isLoggedIn}
        isGuestLoggedIn={isGuestLoggedIn}
        canAccessMemberContent={canAccessMemberContent}
        onLoginClick={onLoginClick}
        isEditMode={isEditMode}
        onToggleEditMode={onToggleEditMode}
        onOpenResetConfirm={onOpenResetConfirm}
        onUpdateCell={onUpdateCell}
        onUpdateMemberCell={onUpdateMemberCell}
        onSetCellFixed={onSetCellFixed}
        onUnfixCell={onUnfixCell}
        onResetCell={onResetCell}
        onOpenRandomPicker={onOpenRandomPicker}
        onOpenScheduleEdit={onOpenScheduleEdit}
      />

      <ApiSection
        activeApi={activeApi}
        ottItems={ottItems}
        ytItems={ytItems}
        ottLoading={ottLoading}
        ottError={ottError}
        randing={randing || apiRanding}
        handleApiCard={handleApiCard}
        onOpenOttDrawer={onOpenOttDrawer}
        onOpenRandomDrawer={onOpenRandomDrawer}
      />

      <InfoSection />

      <HomeRanking
        points={points}
        vipKeys={vipKeys}
        onGoCommunity={onGoCommunity}
      />

      <HomeCtaBanner />

      <SiteFooter />
    </>
  );
}
