import { useState } from 'react';
import { Menu, X, Plus, MessageSquare } from 'lucide-react';

import { useClock }          from './hooks/useClock';
import { useSchedule }       from './hooks/useSchedule';
import { useApiCards }       from './hooks/useApiCards';
import { useSuggestionForm } from './hooks/useSuggestionForm';

import { HeroSection }        from './components/HeroSection';
import { ApiSection }         from './components/ApiSection';
import { InfoSection }        from './components/InfoSection';
import { SuggestionModal }    from './components/SuggestionModal';
import { ScheduleEditModal }  from './components/ScheduleEditModal';
import { SuggestionBoard }    from './components/SuggestionBoard';

import './App.css';

export default function App() {
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [schedEditOpen,  setSchedEditOpen]  = useState(false);
  const [boardOpen,      setBoardOpen]      = useState(false);

  const clock   = useClock();
  const sched   = useSchedule();
  const api     = useApiCards();
  const suggest = useSuggestionForm();

  return (
    <div className="app">

      {/* 헤더 */}
      <header className="header">
        <a href="#" className="logo">
          <span className="logo-ico">🛌</span>
          <span>아빠안잔다</span>
        </a>
        <div className="hd-spacer" />

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
          <a href="#schedule-section" onClick={() => setMenuOpen(false)}>📅 편성표</a>
          <a href="#추천"             onClick={() => setMenuOpen(false)}>✨ 추천</a>
          <button className="mob-nav-btn" onClick={() => { setMenuOpen(false); setBoardOpen(true); }}>
            💬 건의함 ({suggest.suggestions.length})
          </button>
          <button className="btn-suggest mob-cta" onClick={() => { setMenuOpen(false); suggest.openModal(); }}>
            ✏️ 프로그램 신청하기
          </button>
        </nav>
      )}

      {/* 히어로 + 편성표 */}
      <HeroSection
        sched={sched.sched}
        todayIdx={clock.todayIdx}
        nowMin={clock.nowMin}
        randing={sched.randing}
        handleRandomize={sched.handleRandomize}
        onOpenScheduleEdit={() => setSchedEditOpen(true)}
      />

      {/* API 추천 */}
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

      {/* 정보 섹션 */}
      <InfoSection />

      {/* CTA 배너 */}
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

      {/* 푸터 */}
      <footer className="site-footer">© 2026 아빠안잔다. All rights reserved.</footer>

      {/* FAB */}
      <button className="fab" onClick={suggest.openModal} aria-label="프로그램 건의하기">
        <Plus size={18} /><span>건의</span>
      </button>

      {/* ─ 모달들 ─ */}
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
