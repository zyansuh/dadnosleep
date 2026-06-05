import { useState } from 'react';

import { useClock } from '../hooks/useClock';
import { useSchedule } from '../hooks/schedule/useSchedule';
import { useApiCards } from '../hooks/useApiCards';
import { useSuggestionForm } from '../hooks/useSuggestionForm';
import { useCommunity } from '../hooks/community/useCommunity';
import { useDiscordAuth } from '../context/DiscordAuthContext';
import { useAdminGate } from '../context/AdminGateContext';
import { useMemberVipKeys } from '../hooks/members/useMemberVipKeys';

import { HomeCommunityView } from './home/HomeCommunityView';
import { AppHeader } from '../components/layout/AppHeader';
import { MobileNav } from '../components/layout/MobileNav';
import { HomeOverlays } from '../components/layout/HomeOverlays';

import type { HomePageTab } from './home/types';
import { useHomePageEffects } from './home/useHomePageEffects';
import { HomeMainView } from './home/HomeMainView';

export function HomePage() {
  const [page, setPage] = useState<HomePageTab>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [schedEditOpen, setSchedEditOpen] = useState(false);

  const discord = useDiscordAuth();
  const { goToAdmin } = useAdminGate();
  const clock = useClock();
  const sched = useSchedule(discord.canEditSchedule);
  const api = useApiCards();
  const suggest = useSuggestionForm();
  const community = useCommunity();
  const vipKeys = useMemberVipKeys();

  const nav = (p: HomePageTab) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useHomePageEffects({
    page,
    canEditSchedule: discord.canEditSchedule,
    isEditMode: sched.isEditMode,
    toggleEditMode: sched.toggleEditMode,
    refreshReviews: community.refreshReviews,
    refreshSuggestions: suggest.refresh,
  });

  return (
    <div className="app">
      <AppHeader
        page={page}
        menuOpen={menuOpen}
        totalReviews={community.totalReviews}
        suggestionCount={suggest.suggestions.length}
        isLoggedIn={discord.isLoggedIn}
        isAdmin={discord.isAdmin}
        isMember={discord.role === 'member'}
        onNavHome={() => nav('home')}
        onNavCommunity={() => nav('community')}
        onToggleMenu={() => setMenuOpen(v => !v)}
      />

      {menuOpen && (
        <MobileNav
          page={page}
          totalReviews={community.totalReviews}
          suggestionCount={suggest.suggestions.length}
          isLoggedIn={discord.isLoggedIn}
          isAdmin={discord.isAdmin}
          isMember={discord.role === 'member'}
          onNavHome={() => nav('home')}
          onNavCommunity={() => nav('community')}
          onGoAdmin={() => { setMenuOpen(false); goToAdmin(); }}
          onOpenSuggest={() => { setMenuOpen(false); suggest.openModal(); }}
        />
      )}

      {page === 'community' ? (
        <HomeCommunityView
          reviews={community.reviews}
          points={community.points}
          loading={community.loading}
          isAdmin={discord.isAdmin}
          onAddReview={community.addReview}
          onAddFriendInvite={async (inviter, invitee) => {
            await community.addFriendInvite(inviter, invitee);
          }}
          onUpdateReview={community.updateReview}
          onDeleteReview={community.deleteReview}
          onRefresh={community.refreshReviews}
          onBack={() => nav('home')}
        />
      ) : (
        <HomeMainView
          sched={sched.sched}
          memberRow={sched.memberRow}
          todayIdx={clock.todayIdx}
          nowMin={clock.nowMin}
          randing={sched.randing}
          randError={sched.randError}
          canEditSchedule={discord.canEditSchedule}
          isLoggedIn={discord.isLoggedIn}
          isGuestLoggedIn={discord.isGuestLoggedIn}
          canAccessMemberContent={discord.canAccessMemberContent}
          isEditMode={sched.isEditMode}
          onLoginClick={discord.login}
          onToggleEditMode={sched.toggleEditMode}
          onOpenResetConfirm={sched.openResetConfirm}
          onUpdateCell={sched.updateCell}
          onUpdateMemberCell={sched.updateMemberCell}
          onSetCellFixed={sched.setCellFixed}
          onUnfixCell={sched.unfixCell}
          onResetCell={sched.resetCell}
          onOpenRandomPicker={sched.openRandomPicker}
          onOpenScheduleEdit={() => {
            if (!discord.canEditSchedule) return;
            setSchedEditOpen(true);
          }}
          scheduleLoading={sched.loading}
          loadError={sched.loadError}
          isPublished={sched.isPublished}
          publishedAt={sched.publishedAt}
          publishBusy={sched.publishBusy}
          publishError={sched.publishError}
          onPublishSchedule={() => void sched.publishSchedule()}
          onUnpublishSchedule={() => void sched.unpublishSchedule()}
          activeApi={api.activeApi}
          ottItems={api.ottItems}
          ytItems={api.ytItems}
          ottLoading={api.ottLoading}
          ottError={api.ottError}
          apiRanding={api.drawerLoading}
          handleApiCard={api.handleApiCard}
          onOpenOttDrawer={api.openOttDrawer}
          onOpenRandomDrawer={api.openRandomDrawer}
          points={community.points}
          vipKeys={vipKeys}
          onGoCommunity={() => nav('community')}
        />
      )}

      <HomeOverlays
        sched={sched}
        suggest={suggest}
        api={api}
        schedEditOpen={schedEditOpen}
        canEditSchedule={discord.canEditSchedule}
        onCloseSchedEdit={() => setSchedEditOpen(false)}
      />
    </div>
  );
}
