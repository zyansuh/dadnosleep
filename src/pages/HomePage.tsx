import { useState } from 'react';
import { Menu, X, Plus, MessageSquare, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useClock }          from '../hooks/useClock';
import { useSchedule }       from '../hooks/useSchedule';
import { useApiCards }       from '../hooks/useApiCards';
import { useSuggestionForm } from '../hooks/useSuggestionForm';
import { useCommunity }      from '../hooks/useCommunity';
import { useDiscordAuth }    from '../context/DiscordAuthContext';
import { useAdminGate }      from '../context/AdminGateContext';

import { HeroSection }        from '../components/HeroSection';
import { ApiSection }         from '../components/ApiSection';
import { InfoSection }        from '../components/InfoSection';
import { SuggestionModal }    from '../components/SuggestionModal';
import { ScheduleEditModal }  from '../components/ScheduleEditModal';
import { SuggestionBoard }    from '../components/SuggestionBoard';
import { CommunityPage }      from '../components/community/CommunityPage';
import { HomeRanking }        from '../components/community/HomeRanking';
import { ConfirmModal }       from '../components/ConfirmModal';
import { RandomPickModal }    from '../components/RandomPickModal';
import { MediaDrawer }        from '../components/MediaDrawer';
import { DiscordLoginButton } from '../components/DiscordLoginButton';
import { ProfileMenu } from '../components/ProfileMenu';
import { SiteFooter }         from '../components/SiteFooter';

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

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo" onClick={() => nav('home')}>
          <span className="logo-ico">🛌</span>
          <span>아빠안잔다</span>
        </Link>
        <div className="hd-spacer" />

        <div className="hd-auth">
          {discord.isLoggedIn ? (
            <>
              {discord.isAdmin && <span className="hd-admin-badge">관리자</span>}
              {discord.role === 'member' && <span className="hd-member-badge">회원</span>}
              <ProfileMenu />
            </>
          ) : (
            <DiscordLoginButton />
          )}
        </div>

        <button
          className={`btn-board ${page === 'community' ? 'btn-board-active' : ''}`}
          onClick={() => nav('community')}
          aria-label="커뮤니티"
        >
          <Users size={15} />
          <span>커뮤니티</span>
          {community.totalReviews > 0 && (
            <span className="board-badge">{community.totalReviews}</span>
          )}
        </button>

        <button className="btn-board" onClick={() => setBoardOpen(true)} aria-label="건의함 열기">
          <MessageSquare size={15} />
          <span>건의함</span>
          {suggest.suggestions.length > 0 && (
            <span className="board-badge">{suggest.suggestions.length}</span>
          )}
        </button>

        <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="메뉴">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav">
          <button type="button" className="mob-nav-btn" onClick={() => nav('home')}>🏠 홈 / 편성표</button>
          <button type="button" className="mob-nav-btn" onClick={() => nav('community')}>
            💬 커뮤니티 ({community.totalReviews})
          </button>
          {!discord.isLoggedIn && (
            <div className="mob-nav-discord">
              <DiscordLoginButton fullWidth />
            </div>
          )}
          {discord.isAdmin && (
            <button type="button" className="mob-nav-btn" onClick={() => { setMenuOpen(false); goToAdmin(); }}>
              <Shield size={16} /> 관리자 페이지
            </button>
          )}
          <button className="mob-nav-btn" onClick={() => { setMenuOpen(false); setBoardOpen(true); }}>
            📮 건의함 ({suggest.suggestions.length})
          </button>
          <button className="btn-suggest mob-cta" onClick={() => { setMenuOpen(false); suggest.openModal(); }}>
            ✏️ 프로그램 신청하기
          </button>
        </nav>
      )}

      {page === 'community' ? (
        <CommunityPage
          reviews={community.reviews}
          points={community.points}
          loading={community.loading}
          isAdmin={discord.isAdmin}
          onAddReview={community.addReview}
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
            isAdmin={discord.isAdmin}
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
              if (!discord.isAdmin) { discord.login(); return; }
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

      {schedEditOpen && discord.isAdmin && (
        <ScheduleEditModal
          sched={sched.sched}
          onSaveAll={sched.updateMany}
          onSetFixed={sched.setCellFixed}
          onUnfix={sched.unfixCell}
          onClose={() => setSchedEditOpen(false)}
        />
      )}

      {boardOpen && (
        <SuggestionBoard suggestions={suggest.suggestions} onClose={() => setBoardOpen(false)} />
      )}

      {sched.resetConfirmOpen && discord.isAdmin && (
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
    </div>
  );
}
