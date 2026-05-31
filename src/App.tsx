import { useState } from 'react';
import { Moon, Menu, X, Clock, RefreshCw, Plus } from 'lucide-react';

import { useClock }          from './hooks/useClock';
import { useSchedule }       from './hooks/useSchedule';
import { useApiCards }       from './hooks/useApiCards';
import { useSuggestionForm } from './hooks/useSuggestionForm';

import { HeroSection }      from './components/HeroSection';
import { ApiSection }       from './components/ApiSection';
import { SuggestionModal }  from './components/SuggestionModal';

import './App.css';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const clock   = useClock();
  const sched   = useSchedule();
  const api     = useApiCards();
  const suggest = useSuggestionForm();

  return (
    <div className="app">

      {/* 상단 공지 배너 */}
      <div className="top-banner">
        🌟 따뜻한 취향이 모이는 시간, 우리만의 OTT 커뮤니티
        <span className="tb-sep">|</span>
        📅 20:00 ~ 02:00 운영
        <span className="tb-sep">|</span>
        목·금 고정 편성 + 실시간 랜덤 추천
      </div>

      {/* 헤더 */}
      <header className="header">
        <div className="hd-inner">
          <a href="#" className="logo">
            <span className="logo-ico">🤖</span>
            <span>아빠안잔다</span>
          </a>
          <div className="hd-spacer" />
          <span className="op-pill">
            <Moon size={12} /> 20:00 ~ 02:00 운영
          </span>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            <a href="#schedule-section" onClick={() => setMenuOpen(false)}>📅 편성표</a>
            <a href="#추천"            onClick={() => setMenuOpen(false)}>✨ 추천</a>
            <button
              className="btn-suggest mob-cta"
              onClick={() => { setMenuOpen(false); suggest.openModal(); }}
            >
              ✏️ 프로그램 신청하기
            </button>
          </nav>
        )}
      </header>

      {/* 히어로 + 편성표 */}
      <HeroSection
        sched={sched.sched}
        todayIdx={clock.todayIdx}
        nowMin={clock.nowMin}
        randing={sched.randing}
        handleRandomize={sched.handleRandomize}
      />

      {/* 인포 스트립 */}
      <div className="info-strip">
        {[
          { icon: <Clock size={13} />,     text: '20:00 ~ 02:00 운영' },
          { icon: <span>★</span>,          text: '고정 편성 + 랜덤 추천' },
          { icon: <RefreshCw size={13} />, text: '매일 새롭게 갱신' },
        ].map((b, i) => (
          <div key={i} className="info-chip">{b.icon}<span>{b.text}</span></div>
        ))}
      </div>

      {/* API 추천 섹션 */}
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

      {/* CTA 배너 */}
      <section className="cta-banner">
        <div className="cta-deco cta-l">
          <span className="deco-pop">🍿</span>
          <span className="deco-sp1">✦</span>
          <span className="deco-sp2">⋆</span>
        </div>
        <div className="cta-inner">
          <p className="cta-eye">오늘 밤, 우리 함께 볼까요? 🌙</p>
          <a href="#schedule-section" className="cta-btn">
            지금 바로 편성표 보러가기 →
          </a>
          <p className="cta-sub">매일 밤 8시, 새로운 편성표가 당신을 기다립니다!</p>
        </div>
        <div className="cta-deco cta-r">
          <span className="deco-mug">☕</span>
          <span className="deco-plant">🌱</span>
          <span className="deco-sp3">✦</span>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="site-footer">
        <span>© 2026 아빠안잔다. All rights reserved.</span>
      </footer>

      {/* FAB */}
      <button className="fab" onClick={suggest.openModal} aria-label="프로그램 건의하기">
        <Plus size={18} /><span>건의</span>
      </button>

      {/* 건의 모달 */}
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
    </div>
  );
}
