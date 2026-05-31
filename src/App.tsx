import React, { useState, useEffect } from 'react';
import {
  Moon, Menu, X, Calendar, Shuffle, Heart,
  Clock, RefreshCw, Send, Plus, Sparkles,
} from 'lucide-react';
import { fetchOTT, type OttItem } from './utils/api';
import './App.css';

// ── 타입 ─────────────────────────────────────────────────────────
type BadgeType = 'pink' | 'teal' | 'purple' | 'orange' | 'green';
type CellType  = 'fixed' | 'ott' | 'random' | 'community';

interface Cell {
  title: string;
  sub:   string;
  type:  CellType;
  badge: string;
  bt:    BadgeType;
  link?: string;
}

// ── 주간 편성표 데이터 ──────────────────────────────────────────
// sched[dayIndex(0=월)][timeSlotIndex(0=20:00, 1=22:00, 2=00:00)]
const BASE_SCHED: Cell[][] = [
  // 월(0)
  [
    { title: '랜덤 애뇨', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: 'TOP 10 드라마', sub: '넷플릭스 TOP 10', type: 'ott', badge: 'TOP 10', bt: 'pink', link: 'https://www.netflix.com/kr/browse/genre/83' },
    { title: '심야 영화', sub: '오늘의 픽', type: 'ott', badge: '오늘의 픽', bt: 'orange', link: 'https://www.netflix.com/kr/' },
  ],
  // 화(1)
  [
    { title: '랜덤 애니', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: '실시간 인기작', sub: 'OTT 통합 인기', type: 'ott', badge: '실시간 인기', bt: 'purple', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 다큐', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
  ],
  // 수(2)
  [
    { title: '로맨스 추천', sub: '랜덤 추천', type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: 'OTT 화제작', sub: 'OTT 통합', type: 'ott', badge: 'OTT 통합', bt: 'orange', link: 'https://www.wavve.com/' },
    { title: '랜덤 시리즈', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
  ],
  // 목(3)
  [
    { title: '커뮤니티 픽', sub: '커뮤니티 투표', type: 'community', badge: '커뮤니티', bt: 'green' },
    { title: '나는 솔로', sub: 'TV 조선 22:00', type: 'fixed', badge: '★ 고정 편성', bt: 'pink', link: 'https://www.youtube.com/results?search_query=나는솔로+최신+다시보기' },
    { title: '랜덤 애뇨', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
  ],
  // 금(4)
  [
    { title: '주간 인기작', sub: '주간 TOP', type: 'ott', badge: '주간 인기', bt: 'purple', link: 'https://www.netflix.com/kr/' },
    { title: '이혼숙려캠프', sub: 'TV 조선 22:00', type: 'fixed', badge: '★ 고정 편성', bt: 'pink', link: 'https://www.youtube.com/results?search_query=이혼숙려캠프+최신+다시보기' },
    { title: '심야 토크', sub: '오늘의 픽', type: 'ott', badge: '오늘의 픽', bt: 'orange' },
  ],
  // 토(5)
  [
    { title: '정주행 추천', sub: '오늘의 픽', type: 'ott', badge: '오늘의 픽', bt: 'orange', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 영화', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: '실시간 TOP 10', sub: '실시간 인기', type: 'ott', badge: '실시간 인기', bt: 'purple', link: 'https://www.netflix.com/kr/' },
  ],
  // 일(6)
  [
    { title: '휴일 추천', sub: '오늘의 픽', type: 'ott', badge: '오늘의 픽', bt: 'orange', link: 'https://www.netflix.com/kr/' },
    { title: '랜덤 드라마', sub: 'OTT 통합', type: 'random', badge: '랜덤 추천', bt: 'teal' },
    { title: '다음주 예고', sub: '커뮤니티', type: 'community', badge: '커뮤니티', bt: 'green' },
  ],
];

const DAYS   = ['월', '화', '수', '목', '금', '토', '일'];
const TIMES  = ['20:00', '22:00', '00:00'];

// ── 시간 → 분 변환 (새벽 0~5시 = +1440) ─────────────────────
function toMin(hhmm: string): number {
  const h = parseInt(hhmm.split(':')[0]);
  const m = parseInt(hhmm.split(':')[1]);
  return (h < 6 ? h + 24 : h) * 60 + m;
}

const SLOT_END_TIMES = ['22:00', '00:00', '02:00'];

function slotStatus(timeIdx: number, nowMin: number): 'past' | 'live' | 'upcoming' {
  const start = toMin(TIMES[timeIdx]);
  const end   = toMin(SLOT_END_TIMES[timeIdx]);
  if (nowMin >= end)   return 'past';
  if (nowMin >= start) return 'live';
  return 'upcoming';
}

// ── 건의 폼 타입 ─────────────────────────────────────────────
interface SuggForm {
  title: string;
  category: string;
  time: string;
  desc: string;
  nick: string;
}

// ── CellInner 컴포넌트 ────────────────────────────────────────
function CellInner({ cell, isLive }: { cell: Cell; isLive: boolean }) {
  return (
    <>
      <span className={`cb badge-${cell.bt}`}>{cell.badge}</span>
      <span className="ct">
        {cell.title}
        {isLive && <span className="live-dot-anim" />}
      </span>
    </>
  );
}

// ── ApiCard 컴포넌트 ───────────────────────────────────────────
function ApiCard({
  icon, title, desc, btnLabel, active, onClick, cls,
}: {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
  btnLabel: string;
  active: boolean;
  onClick: () => void;
  cls: string;
}) {
  return (
    <div className={`api-card ${cls} ${active ? 'api-active' : ''}`} onClick={onClick}>
      <div className="api-icon">{icon}</div>
      <div className="api-body">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
      <button className="api-cta">{btnLabel}</button>
    </div>
  );
}

// ── Field 컴포넌트 ─────────────────────────────────────────────
function Field({ label, error, children }: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ff">
      <label className="fl">{label} <span className="req">*</span></label>
      {children}
      {error && <span className="fe">{error}</span>}
    </div>
  );
}

// ── 메인 앱 ───────────────────────────────────────────────────
export default function App() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [sched,      setSched]      = useState<Cell[][]>(BASE_SCHED);
  const [randing,    setRanding]    = useState(false);
  const [activeApi,  setActiveApi]  = useState<'netflix' | 'ott' | null>(null);
  const [ottItems,   setOttItems]   = useState<OttItem[]>([]);
  const [ottLoading, setOttLoading] = useState(false);
  const [ottError,   setOttError]   = useState('');
  const [now,        setNow]        = useState(new Date());
  const [form,       setForm]       = useState<SuggForm>({ title: '', category: '', time: '', desc: '', nick: '' });
  const [errors,     setErrors]     = useState<Partial<SuggForm>>({});

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const todayIdx = (now.getDay() + 6) % 7;
  const nowH     = now.getHours();
  const nowMin   = (nowH < 6 ? nowH + 24 : nowH) * 60 + now.getMinutes();

  // ── 랜덤 편성 생성 ─────────────────────────────────────────
  const handleRandomize = async () => {
    setRanding(true);
    try {
      const [movies, shows] = await Promise.all([
        fetchOTT('0', 'movie'),
        fetchOTT('0', 'tv'),
      ]);
      const pool = [...movies, ...shows].sort(() => Math.random() - 0.5);
      let pi = 0;
      const newSched = sched.map(day =>
        day.map(cell => {
          if (cell.type === 'fixed') return cell;
          const item = pool[pi++];
          if (!item) return cell;
          return {
            ...cell,
            title: ((item.title || item.name || cell.title) as string).slice(0, 11),
            sub:   'TMDB 추천',
            link:  `https://www.themoviedb.org/${item.title ? 'movie' : 'tv'}/${item.id}`,
          };
        })
      );
      setSched(newSched);
    } catch {
      // API 키 미설정 시 무시
    } finally {
      setRanding(false);
    }
  };

  // ── API 카드 클릭 ──────────────────────────────────────────
  const handleApiCard = async (type: 'netflix' | 'ott') => {
    if (activeApi === type) { setActiveApi(null); return; }
    setActiveApi(type);
    setOttLoading(true);
    setOttError('');
    setOttItems([]);
    try {
      const pid = type === 'netflix' ? '8' : '0';
      const [movies, shows] = await Promise.all([
        fetchOTT(pid, 'movie'),
        fetchOTT(pid, 'tv'),
      ]);
      setOttItems([...movies.slice(0, 5), ...shows.slice(0, 5)]);
    } catch (e) {
      setOttError(e instanceof Error ? e.message : 'TMDB API 키를 config.js에 입력해주세요');
    } finally {
      setOttLoading(false);
    }
  };

  // ── 건의 폼 ────────────────────────────────────────────────
  const validate = () => {
    const e: Partial<SuggForm> = {};
    if (!form.title.trim())    e.title    = '프로그램명을 입력해주세요';
    if (!form.category)        e.category = '카테고리를 선택해주세요';
    if (!form.time.trim())     e.time     = '시간대를 입력해주세요';
    if (!form.desc.trim())     e.desc     = '내용을 입력해주세요';
    if (!form.nick.trim())     e.nick     = '닉네임을 입력해주세요';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const openModal = () => {
    setModalOpen(true);
    setSubmitted(false);
    setForm({ title: '', category: '', time: '', desc: '', nick: '' });
    setErrors({});
  };

  // ── JSX ────────────────────────────────────────────────────
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
          <nav className="main-nav">
            {['편성표', '추천', '신청', '후기', '포인트', '커뮤니티'].map(n => (
              <a key={n} href={`#${n}`}>{n}</a>
            ))}
          </nav>
          <div className="hd-actions">
            <span className="op-pill"><Moon size={12} /> 20:00 ~ 02:00 운영</span>
            <button className="btn-ghost">로그인</button>
            <button className="btn-coral-sm">회원가입</button>
            <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            {['편성표', '추천', '신청', '후기', '포인트', '커뮤니티'].map(n => (
              <a key={n} href={`#${n}`} onClick={() => setMenuOpen(false)}>{n}</a>
            ))}
            <button className="btn-coral-sm mob-cta" onClick={() => { setMenuOpen(false); openModal(); }}>
              + 편성 건의하기
            </button>
          </nav>
        )}
      </header>

      {/* 히어로 */}
      <section className="hero" id="편성표">
        <div className="hero-inner">

          {/* 좌측 */}
          <div className="hero-left">
            <div className="hero-pill">
              <Heart size={12} fill="currentColor" />
              목·금 고정 편성 + 실시간 랜덤 추천 ✦
            </div>
            <h1 className="site-title">아빠안잔다<span className="title-heart">♥</span></h1>
            <p className="site-sub">우리가 함께 보는 OTT 편성표</p>
            <p className="site-desc">
              하루의 끝, 가족·연인·친구가 함께 즐길 수 있는<br />
              OTT 프로그램을 고정 편성과 실시간 추천으로<br />
              매일 새롭게 만나보세요.
            </p>
            <div className="hero-ctas">
              <a href="#schedule-section" className="btn-coral">
                <Calendar size={15} /> 오늘 편성표 보기
              </a>
              <button className="btn-outline" onClick={handleRandomize} disabled={randing}>
                <Shuffle size={15} /> {randing ? '생성 중…' : '랜덤 편성 생성하기'}
              </button>
            </div>
            <div className="hero-viewers">
              <div className="viewer-avatars">
                {'🧑👩👨👦'.split('').map((e, i) => <span key={i}>{e}</span>)}
              </div>
              <span>2,345명이 함께 보고 있어요</span>
            </div>
          </div>

          {/* 우측: 편성표 미리보기 */}
          <div className="hero-right" id="schedule-section">
            <div className="sched-card">
              <div className="sched-head">
                <h3>이번 주 편성표 (20:00 ~ 02:00)</h3>
                <span className="sched-op">20:00 ~ 02:00 운영</span>
              </div>
              <div className="sched-note">
                ① 편성표는 매일 업데이트되며, 주간 경우는 실시간으로 달라질 수 있어요.
              </div>
              <div className="table-scroll">
                <table className="sched-tbl">
                  <thead>
                    <tr>
                      <th className="th-empty" />
                      {DAYS.map((d, i) => (
                        <th key={d} className={i === todayIdx ? 'th-today' : ''}>
                          {d}
                          {i === todayIdx && <span className="today-dot" />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIMES.map((t, ti) => (
                      <tr key={t}>
                        <td className="td-t">{t}</td>
                        {sched.map((day, di) => {
                          const cell   = day[ti];
                          const isToday = di === todayIdx;
                          const st     = isToday ? slotStatus(ti, nowMin) : '';
                          const isLive  = st === 'live';
                          return (
                            <td
                              key={di}
                              className={[
                                'td-cell',
                                `cell-${cell.type}`,
                                isToday  ? 'cell-today' : '',
                                isLive   ? 'cell-live'  : '',
                              ].filter(Boolean).join(' ')}
                            >
                              {cell.link ? (
                                <a href={cell.link} target="_blank" rel="noopener noreferrer" className="cell-inner">
                                  <CellInner cell={cell} isLive={isLive} />
                                </a>
                              ) : (
                                <div className="cell-inner">
                                  <CellInner cell={cell} isLive={isLive} />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td className="td-t td-end">02:00</td>
                      <td colSpan={7} className="td-end-label">— 방송 종료 —</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인포 스트립 */}
      <div className="info-strip">
        {[
          { icon: <Clock size={13} />, text: '20:00 ~ 02:00 운영' },
          { icon: <span>★</span>,     text: '고정 편성 + 랜덤 추천' },
          { icon: <RefreshCw size={13} />, text: '매일 새롭게 갱신' },
        ].map((b, i) => (
          <div key={i} className="info-chip">{b.icon}<span>{b.text}</span></div>
        ))}
      </div>

      {/* API 추천 섹션 */}
      <section className="api-section" id="추천">
        <div className="sec-wrap">
          <div className="sec-head">
            <span className="sec-eyebrow"><Sparkles size={14} /> 데이터로 더 똑똑하게</span>
            <h2>API 기반 추천 엔진</h2>
          </div>
          <div className="api-grid">
            <ApiCard
              icon={<span className="n-icon">N</span>}
              title="넷플릭스 TOP 10"
              desc={<>국내 넷플릭스 TOP 10<br />실시간 인기 현황</>}
              btnLabel="TOP 10 보기 →"
              active={activeApi === 'netflix'}
              onClick={() => handleApiCard('netflix')}
              cls="card-netflix"
            />
            <ApiCard
              icon={
                <span className="ott-logos">
                  <span style={{ color: '#e50914' }}>N</span>
                  <span style={{ color: '#0072f5' }}>D</span>
                  <span style={{ color: '#1d6fa4' }}>W</span>
                </span>
              }
              title="OTT 통합 인기작"
              desc={<>넷플릭스, 디즈니+, 티빙, wavve<br />통합 인기작 랭킹</>}
              btnLabel="인기작 보기 →"
              active={activeApi === 'ott'}
              onClick={() => handleApiCard('ott')}
              cls="card-ott"
            />
            <ApiCard
              icon={<span className="dice">🎲</span>}
              title="랜덤 편성 생성"
              desc={<>취향·장르·시간대 기반<br />스마트 랜덤 추천</>}
              btnLabel={randing ? '생성 중…' : '랜덤 생성하기 →'}
              active={false}
              onClick={handleRandomize}
              cls="card-random"
            />
          </div>

          {/* OTT 결과 */}
          {activeApi && (
            <div className="ott-result-box">
              <h4>{activeApi === 'netflix' ? '넷플릭스 TOP 10' : 'OTT 통합 인기작'}</h4>
              {ottLoading && <p className="result-msg">불러오는 중…</p>}
              {ottError   && <p className="result-msg err">⚠️ {ottError}</p>}
              {!ottLoading && !ottError && ottItems.length > 0 && (
                <div className="ott-grid">
                  {ottItems.map((item, i) => (
                    <a
                      key={item.id}
                      href={`https://www.themoviedb.org/${item.title ? 'movie' : 'tv'}/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ott-card"
                    >
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                          alt={item.title || item.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="ott-no-poster">🎬</div>
                      )}
                      <span className="ott-rank">#{i + 1}</span>
                      <span className="ott-name">{item.title || item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 커뮤니티 섹션 */}
      <section className="community-sec" id="커뮤니티">
        <div className="sec-wrap">
          <h2 className="comm-title">
            함께 만들어가는 따뜻한 커뮤니티
            <Heart size={16} fill="currentColor" style={{ marginLeft: 8, color: 'var(--coral)' }} />
          </h2>
          <div className="comm-grid">
            {[
              { ico: '📋', title: '신청', desc: '보고 싶은 프로그램을\n신청해 주세요!', sub: '다양한 의견을 통해 편성에 반영합니다.\n최소 0.5%이상', btn: '신청하기 →', fn: openModal },
              { ico: '💬', title: '후기', desc: '함께 본 콘텐츠의\n후기를 남겨요!', sub: '다른 이용자들의 추천 후기를\n게시판에 남겨주세요', btn: '후기 남기기 →', fn: undefined },
              { ico: '🏆', title: '포인트', desc: '활동하면 포인트가\n쌓여요!', sub: '후기를 남기면 포인트를 받아요!\n다양한 이벤트에 참여해보세요.', btn: '포인트 안내 →', fn: undefined },
            ].map((c, i) => (
              <div key={i} className="comm-card">
                <div className="comm-ico">{c.ico}</div>
                <h4>{c.title}</h4>
                <p className="comm-desc">{c.desc}</p>
                <p className="comm-sub">{c.sub}</p>
                <button className="comm-btn" onClick={c.fn}>{c.btn}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 배너 */}
      <section className="cta-banner">
        <div className="cta-inner">
          <p className="cta-eye">오늘 밤, 우리 함께 볼까요? 🌙</p>
          <a href="#schedule-section" className="cta-btn">
            지금 바로 편성표 보러가기 →
          </a>
          <p className="cta-sub">매일 밤 8시, 새로운 편성표가 당신을 기다립니다!</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="site-footer">
        <span>© 2026 아빠안잔다. All rights reserved.</span>
        <div className="footer-socials">
          {['📷 Instagram', '🐦 Twitter', '💬 Discord'].map((s, i) => (
            <a key={i} href="#" className="social-link">{s}</a>
          ))}
        </div>
      </footer>

      {/* FAB */}
      <button className="fab" onClick={openModal}>
        <Plus size={18} /><span>건의</span>
      </button>

      {/* 건의 모달 */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title-row">
                <div className="modal-ico"><Send size={15} /></div>
                <div>
                  <h3>편성표 건의하기</h3>
                  <p>원하는 프로그램을 알려주세요 🎤</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            {!submitted ? (
              <form
                className="modal-form"
                onSubmit={e => { e.preventDefault(); if (validate()) setSubmitted(true); }}
              >
                <Field label="프로그램명" error={errors.title}>
                  <input
                    className={`inp ${errors.title ? 'inp-err' : ''}`}
                    placeholder="원하는 프로그램명"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </Field>
                <Field label="카테고리" error={errors.category}>
                  <div className="cat-grid">
                    {['드라마', '예능', '영화', '애니', '다큐', '기타'].map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`cat-btn ${form.category === c ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, category: c })}
                      >{c}</button>
                    ))}
                  </div>
                </Field>
                <Field label="희망 시간대" error={errors.time}>
                  <input
                    className={`inp ${errors.time ? 'inp-err' : ''}`}
                    placeholder="예: 매주 금요일 밤 11시"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                  />
                </Field>
                <Field label="건의 내용" error={errors.desc}>
                  <textarea
                    className={`inp inp-ta ${errors.desc ? 'inp-err' : ''}`}
                    rows={3}
                    placeholder="어떤 프로그램인지 설명해주세요"
                    value={form.desc}
                    onChange={e => setForm({ ...form, desc: e.target.value })}
                  />
                </Field>
                <Field label="닉네임" error={errors.nick}>
                  <input
                    className={`inp ${errors.nick ? 'inp-err' : ''}`}
                    placeholder="닉네임"
                    value={form.nick}
                    onChange={e => setForm({ ...form, nick: e.target.value })}
                  />
                </Field>
                <div className="form-actions">
                  <button type="button" className="btn-ghost-sm" onClick={() => setModalOpen(false)}>취소</button>
                  <button type="submit" className="btn-coral-form">
                    <Send size={14} /> 제출하기
                  </button>
                </div>
              </form>
            ) : (
              <div className="success-box">
                <div className="success-emoji">🎉</div>
                <h3>건의가 접수됐어요!</h3>
                <p>소중한 의견 감사합니다.<br />검토 후 편성에 반영하겠습니다.</p>
                <div className="summary">
                  {[['프로그램', form.title], ['카테고리', form.category], ['시간대', form.time]].map(([k, v]) => (
                    <div key={k} className="sum-row">
                      <span className="sk">{k}</span><span className="sv">{v}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-coral-form" onClick={() => setModalOpen(false)}>확인</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
