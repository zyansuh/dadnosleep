import { useState } from 'react';
import { Menu, X, Plus, MessageSquare, Users } from 'lucide-react';

import { useClock }          from './hooks/useClock';
import { useSchedule }       from './hooks/useSchedule';
import { useApiCards }       from './hooks/useApiCards';
import { useSuggestionForm } from './hooks/useSuggestionForm';
import { useCommunity }      from './hooks/useCommunity';

import { HeroSection }        from './components/HeroSection';
import { ApiSection }         from './components/ApiSection';
import { InfoSection }        from './components/InfoSection';
import { SuggestionModal }    from './components/SuggestionModal';
import { ScheduleEditModal }  from './components/ScheduleEditModal';
import { SuggestionBoard }    from './components/SuggestionBoard';
import { CommunityPage }      from './components/community/CommunityPage';
import { HomeRanking }        from './components/community/HomeRanking';

import './App.css';

type Page = 'home' | 'community';

export default function App() {
  const [page,          setPage]          = useState<Page>('home');
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [schedEditOpen, setSchedEditOpen] = useState(false);
  const [boardOpen,     setBoardOpen]     = useState(false);

  const clock     = useClock();
  const sched     = useSchedule();
  const api       = useApiCards();
  const suggest   = useSuggestionForm();
  const community = useCommunity();

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <div className="app">

      {/* 헤더 */}
      <header className="header">
        <a href="#" className="logo" onClick={() => nav('home')}>
          <span className="logo-ico">🛌</span>
          <span>아빠안잔다</span>
        </a>
        <div className="hd-spacer" />

        {/* 커뮤니티 버튼 */}
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

        {/* 건의함 버튼 */}
        <button
          className="btn-board"
          onClick={() => setBoardOpen(true)}
          aria-label="건의함 열기"
        >
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
          <a href="#" onClick={() => nav('home')}>🏠 홈 / 편성표</a>
          <a href="#" onClick={() => nav('community')}>
            💬 커뮤니티 ({community.totalReviews})
          </a>
          <button className="mob-nav-btn" onClick={() => { setMenuOpen(false); setBoardOpen(true); }}>
            📮 건의함 ({suggest.suggestions.length})
          </button>
          <button className="btn-suggest mob-cta" onClick={() => { setMenuOpen(false); suggest.openModal(); }}>
            ✏️ 프로그램 신청하기
          </button>
        </nav>
      )}

      {/* ── 페이지 렌더링 ── */}
      {page === 'community' ? (
        <CommunityPage
          reviews={community.reviews}
          points={community.points}
          onAddReview={community.addReview}
          onBack={() => nav('home')}
        />
      ) : (
        <>
          {/* 홈 */}
          <HeroSection
            sched={sched.sched}
            todayIdx={clock.todayIdx}
            nowMin={clock.nowMin}
            randing={sched.randing}
            randError={sched.randError}
            handleRandomize={sched.handleRandomize}
            onOpenScheduleEdit={() => setSchedEditOpen(true)}
          />

          <ApiSection
            activeApi={api.activeApi}
            ottItems={api.ottItems}
            ytItems={api.ytItems}
            ottLoading={api.ottLoading}
            ottError={api.ottError}
            randing={sched.randing}
            handleApiCard={api.handleApiCard}
            handleRandomize={sched.handleRandomize}
          />

          <InfoSection />

          {/* 포인트 랭킹 — 메인 홈 */}
          <HomeRanking
            points={community.points}
            onGoCommunity={() => nav('community')}
          />

          <section className="cta-banner">
            <div className="cta-deco cta-l"><span className="deco-pop">🍿</span></div>
            <div className="cta-inner">
              <a href="#schedule-section" className="cta-btn">
                지금 바로 편성표 보러가기 →
              </a>
              <p className="cta-sub">매일 밤 8시, 새로운 편성표가 당신을 기다려요!</p>
            </div>
            <div className="cta-deco cta-r"><span className="deco-mug">☕</span></div>
          </section>

          <footer className="site-footer">© 2026 아빠안잔다. All rights reserved.</footer>
        </>
      )}

      {/* FAB */}
      <button className="fab" onClick={suggest.openModal} aria-label="프로그램 건의하기">
        <Plus size={18} /><span>건의</span>
      </button>

      {/* 모달들 */}
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

      {schedEditOpen && (
        <ScheduleEditModal
          sched={sched.sched}
          onSaveAll={sched.updateMany}
          onClose={() => setSchedEditOpen(false)}
        />
      )}

      {boardOpen && (
        <SuggestionBoard
          suggestions={suggest.suggestions}
          onClose={() => setBoardOpen(false)}
        />
      )}
    </div>
  );
}
