import { useState, useEffect } from 'react';

import { useClock }          from '../hooks/useClock';
import { useSchedule }       from '../hooks/schedule/useSchedule';
import { useApiCards }       from '../hooks/useApiCards';
import { useSuggestionForm } from '../hooks/useSuggestionForm';
import { useCommunity }      from '../hooks/community/useCommunity';
import { useDiscordAuth }    from '../context/DiscordAuthContext';
import { useAdminGate }      from '../context/AdminGateContext';

import { HeroSection }        from '../components/HeroSection';
import { ApiSection }         from '../components/ApiSection';
import { InfoSection }        from '../components/InfoSection';
import { CommunityPage }      from '../components/community/CommunityPage';
import { HomeRanking }        from '../components/community/HomeRanking';
import { SiteFooter }         from '../components/SiteFooter';
import { AppHeader }          from '../components/layout/AppHeader';
import { MobileNav }          from '../components/layout/MobileNav';
import { HomeOverlays }       from '../components/layout/HomeOverlays';

type Page = 'home' | 'community';

export function HomePage() {
  const [page,          setPage]          = useState<Page>('home');
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [schedEditOpen, setSchedEditOpen] = useState(false);
  const [boardOpen,     setBoardOpen]     = useState(false);

  const discord   = useDiscordAuth();
  const { goToAdmin } = useAdminGate();
  const clock     = useClock();
  const sched     = useSchedule();
  const api       = useApiCards();
  const suggest   = useSuggestionForm();
  const community = useCommunity();

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  useEffect(() => {
    if (!discord.canEditSchedule && sched.isEditMode) sched.toggleEditMode();
  }, [discord.canEditSchedule, sched.isEditMode, sched.toggleEditMode]);

  useEffect(() => {
    if (page === 'community') void community.refreshReviews();
  }, [page, community.refreshReviews]);

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
        onOpenBoard={() => setBoardOpen(true)}
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
          onOpenBoard={() => { setMenuOpen(false); setBoardOpen(true); }}
          onOpenSuggest={() => { setMenuOpen(false); suggest.openModal(); }}
        />
      )}

      {page === 'community' ? (
        <CommunityPage
          reviews={community.reviews}
          points={community.points}
          loading={community.loading}
          isAdmin={discord.isAdmin}
          onAddReview={community.addReview}
          onAddFriendInvite={async nickname => { await community.addFriendInvite(nickname); }}
          onUpdateReview={community.updateReview}
          onDeleteReview={community.deleteReview}
          onRefresh={community.refreshReviews}
          onBack={() => nav('home')}
        />
      ) : (
        <>
          <HeroSection
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
            onLoginClick={discord.login}
            isEditMode={sched.isEditMode}
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
          />

          <ApiSection
            activeApi={api.activeApi}
            ottItems={api.ottItems}
            ytItems={api.ytItems}
            ottLoading={api.ottLoading}
            ottError={api.ottError}
            randing={sched.randing || api.drawerLoading}
            handleApiCard={api.handleApiCard}
            onOpenOttDrawer={api.openOttDrawer}
            onOpenRandomDrawer={api.openRandomDrawer}
          />

          <InfoSection />

          <HomeRanking points={community.points} onGoCommunity={() => nav('community')} />

          <section className="cta-banner">
            <div className="cta-deco cta-l"><span className="deco-pop">🍿</span></div>
            <div className="cta-inner">
              <a href="#schedule-section" className="cta-btn">지금 바로 편성표 보러가기 →</a>
              <p className="cta-sub">매일 밤 8시, 새로운 편성표가 당신을 기다려요!</p>
            </div>
            <div className="cta-deco cta-r"><span className="deco-mug">☕</span></div>
          </section>

          <SiteFooter />
        </>
      )}

      <HomeOverlays
        sched={sched}
        suggest={suggest}
        api={api}
        schedEditOpen={schedEditOpen}
        boardOpen={boardOpen}
        canEditSchedule={discord.canEditSchedule}
        onCloseSchedEdit={() => setSchedEditOpen(false)}
        onCloseBoard={() => setBoardOpen(false)}
      />
    </div>
  );
}
