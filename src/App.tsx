import React, { useState, useEffect } from 'react';
import { Clock, Radio, Plus, X, Send, ChevronLeft, ChevronRight, Mic, Music, Gamepad2, Film, BookOpen, Zap, Utensils } from 'lucide-react';
import './App.css';

interface ScheduleItem {
  id: number;
  time: string;       // "HH:MM"
  endTime: string;    // "HH:MM" — 종료 시각 (상태 자동 계산용)
  title: string;
  host: string;
  category: string;
  duration: string;
  description: string;
}

interface SuggestionForm {
  title: string;
  category: string;
  preferredTime: string;
  description: string;
  nickname: string;
}

const CATEGORIES = [
  { id: 'game',    label: '게임',    icon: Gamepad2 },
  { id: 'talk',    label: '토크',    icon: Mic },
  { id: 'movie',   label: '영화/드라마', icon: Film },
  { id: 'music',   label: '음악',    icon: Music },
  { id: 'mukbang', label: '먹방',    icon: Utensils },
  { id: 'special', label: '특집',    icon: Zap },
  { id: 'edu',     label: '교양/정보', icon: BookOpen },
];

// 저녁 9시 ~ 새벽 2시 편성표
const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 1,
    time: '21:00', endTime: '21:30',
    title: '아빠안잔다 오프닝',
    host: '아빠안잔다',
    category: 'talk',
    duration: '30분',
    description: '오늘 방송 소개와 시청자 인사, 하루 근황 토크',
  },
  {
    id: 2,
    time: '21:30', endTime: '23:00',
    title: '저녁 게임 라이브',
    host: '아빠안잔다',
    category: 'game',
    duration: '90분',
    description: '시청자와 함께하는 실시간 게임 방송. 참여 이벤트 진행',
  },
  {
    id: 3,
    time: '23:00', endTime: '23:30',
    title: '자정 전 먹방 타임',
    host: '아빠안잔다',
    category: 'mukbang',
    duration: '30분',
    description: '야식과 함께하는 편안한 먹방 & 수다 타임',
  },
  {
    id: 4,
    time: '23:30', endTime: '00:30',
    title: '심야 영화 / 드라마 감상',
    host: '아빠안잔다',
    category: 'movie',
    duration: '60분',
    description: '화제의 영화·드라마 클립 감상 및 실시간 리액션',
  },
  {
    id: 5,
    time: '00:30', endTime: '01:30',
    title: '자정 토크 & 시청자 사연',
    host: '아빠안잔다',
    category: 'talk',
    duration: '60분',
    description: '시청자 사연 소개와 함께하는 진솔한 심야 토크쇼',
  },
  {
    id: 6,
    time: '01:30', endTime: '02:00',
    title: '새벽 음악 & 마무리',
    host: '아빠안잔다',
    category: 'music',
    duration: '30분',
    description: '잠들기 전 편안한 음악과 함께하는 오늘 방송 마무리',
  },
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const categoryColors: Record<string, string> = {
  game:    '#2ed573',
  talk:    '#ff6584',
  movie:   '#ffa502',
  music:   '#6c63ff',
  mukbang: '#ff9f43',
  special: '#ff4757',
  edu:     '#1e90ff',
};

// 시간 문자열(HH:MM)을 분 단위 숫자로 변환 (00:00~05:59는 다음 날로 처리)
function timeToMinutes(hhmm: string, nextDay = false): number {
  const [h, m] = hhmm.split(':').map(Number);
  const base = h * 60 + m;
  // 새벽 0~5시는 자정 이후로 간주 (1440 더함)
  if (h < 6) return base + 1440;
  return base + (nextDay ? 1440 : 0);
}

function getStatus(item: ScheduleItem, nowMinutes: number): 'live' | 'upcoming' | 'past' {
  const start = timeToMinutes(item.time);
  const end   = timeToMinutes(item.endTime);
  if (nowMinutes >= end)   return 'past';
  if (nowMinutes >= start) return 'live';
  return 'upcoming';
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'live') {
    return (
      <span className="badge badge-live">
        <span className="live-dot" />
        LIVE
      </span>
    );
  }
  if (status === 'upcoming') return <span className="badge badge-upcoming">예정</span>;
  return <span className="badge badge-past">종료</span>;
};

const getCategoryInfo = (categoryId: string) =>
  CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

function App() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [form, setForm] = useState<SuggestionForm>({
    title: '', category: '', preferredTime: '', description: '', nickname: '',
  });
  const [errors, setErrors] = useState<Partial<SuggestionForm>>({});

  // 1분마다 현재 시각 갱신 → 편성 상태 자동 업데이트
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const today = now;
  const dayIndex = (today.getDay() + 6) % 7;

  // 현재 시각을 분으로 환산 (새벽 0~5시 → +1440)
  const currentHour    = today.getHours();
  const currentMinutes =
    currentHour < 6
      ? currentHour * 60 + today.getMinutes() + 1440
      : currentHour * 60 + today.getMinutes();

  const scheduleWithStatus = SCHEDULE_DATA.map(item => ({
    ...item,
    status: getStatus(item, currentMinutes),
  }));

  const liveProgram = scheduleWithStatus.find(s => s.status === 'live');

  const handleDayChange = (dir: number) =>
    setSelectedDay(prev => (prev + dir + 7) % 7);

  const openModal = () => {
    setIsModalOpen(true);
    setIsSubmitted(false);
    setForm({ title: '', category: '', preferredTime: '', description: '', nickname: '' });
    setErrors({});
  };

  const closeModal = () => setIsModalOpen(false);

  const validate = () => {
    const e: Partial<SuggestionForm> = {};
    if (!form.title.trim())        e.title        = '프로그램명을 입력해주세요';
    if (!form.category)            e.category     = '카테고리를 선택해주세요';
    if (!form.preferredTime.trim()) e.preferredTime = '원하는 방송 시간을 입력해주세요';
    if (!form.description.trim())  e.description  = '건의 내용을 입력해주세요';
    if (!form.nickname.trim())     e.nickname     = '닉네임을 입력해주세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setIsSubmitted(true);
  };

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <Radio size={24} />
            <span>아빠안잔다</span>
            <span className="logo-sub">• 편성표</span>
          </div>
          <div className="header-right">
            <div className="current-time">
              <Clock size={14} />
              <span>{today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {liveProgram && (
              <div className="header-live">
                <span className="live-dot" />
                <span>지금 방송 중: <strong>{liveProgram.title}</strong></span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="main">
        {/* 히어로 섹션 */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">아빠안잔다</span>
              <br />
              편성표
            </h1>
            <p className="hero-desc">
              매일 밤 <strong>오후 9시 ~ 새벽 2시</strong><br />
              잠 못 드는 아빠와 함께해요!
            </p>
          </div>
          {liveProgram ? (
            <div className="hero-live-card">
              <div className="live-card-label">
                <span className="live-dot" />
                현재 방송 중
              </div>
              <div className="live-card-title">{liveProgram.title}</div>
              <div className="live-card-host">{liveProgram.host}</div>
              <div className="live-card-desc">{liveProgram.description}</div>
            </div>
          ) : (
            <div className="hero-off-card">
              <div className="off-card-icon">🌙</div>
              <div className="off-card-title">방송 시간 외</div>
              <div className="off-card-desc">오후 9시에 다시 만나요!</div>
            </div>
          )}
        </section>

        {/* 편성표 섹션 */}
        <section className="schedule-section">
          <div className="schedule-header">
            <div className="schedule-title-row">
              <h2 className="section-title">📺 오늘의 편성표</h2>
              <span className="broadcast-time-badge">📡 매일 21:00 ~ 02:00</span>
            </div>
            <div className="day-selector">
              <button className="day-nav" onClick={() => handleDayChange(-1)}>
                <ChevronLeft size={18} />
              </button>
              <div className="day-tabs">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    className={`day-tab ${selectedDay === i ? 'active' : ''} ${dayIndex === i ? 'today' : ''}`}
                    onClick={() => setSelectedDay(i)}
                  >
                    {day}
                    {dayIndex === i && <span className="today-dot" />}
                  </button>
                ))}
              </div>
              <button className="day-nav" onClick={() => handleDayChange(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="schedule-list">
            {scheduleWithStatus.map(item => {
              const catInfo = getCategoryInfo(item.category);
              const CatIcon = catInfo.icon;
              return (
                <div
                  key={item.id}
                  className={`schedule-item ${item.status}`}
                  style={{ '--cat-color': categoryColors[item.category] } as React.CSSProperties}
                >
                  <div className="schedule-time">
                    <span className="time-text">{item.time}</span>
                    <span className="time-end">~ {item.endTime}</span>
                    <span className="duration-text">{item.duration}</span>
                  </div>
                  <div className="schedule-bar" />
                  <div className="schedule-content">
                    <div className="schedule-top">
                      <div className="schedule-category" style={{ background: `${categoryColors[item.category]}18`, color: categoryColors[item.category] }}>
                        <CatIcon size={12} />
                        <span>{catInfo.label}</span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="schedule-title">{item.title}</div>
                    <div className="schedule-host">{item.host}</div>
                    <div className="schedule-desc">{item.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 건의 FAB 버튼 */}
      <button className="fab-btn" onClick={openModal} title="편성표 건의하기">
        <Plus size={24} />
        <span className="fab-label">건의</span>
      </button>

      {/* 건의 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon">
                  <Send size={18} />
                </div>
                <div>
                  <h2 className="modal-title">편성표 건의하기</h2>
                  <p className="modal-subtitle">원하는 프로그램을 알려주세요 🎤</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {!isSubmitted ? (
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">프로그램명 <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    type="text"
                    placeholder="원하는 프로그램 이름을 입력해주세요"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">카테고리 <span className="required">*</span></label>
                  <div className="category-grid">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-btn ${form.category === cat.id ? 'active' : ''}`}
                          onClick={() => setForm({ ...form, category: cat.id })}
                        >
                          <Icon size={16} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && <span className="form-error">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">원하는 방송 시간 <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.preferredTime ? 'error' : ''}`}
                    type="text"
                    placeholder="예: 매주 금요일 밤 11시"
                    value={form.preferredTime}
                    onChange={e => setForm({ ...form, preferredTime: e.target.value })}
                  />
                  {errors.preferredTime && <span className="form-error">{errors.preferredTime}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">건의 내용 <span className="required">*</span></label>
                  <textarea
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="어떤 프로그램인지, 왜 원하는지 자세히 적어주세요"
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">닉네임 <span className="required">*</span></label>
                  <input
                    className={`form-input ${errors.nickname ? 'error' : ''}`}
                    type="text"
                    placeholder="닉네임을 입력해주세요"
                    value={form.nickname}
                    onChange={e => setForm({ ...form, nickname: e.target.value })}
                  />
                  {errors.nickname && <span className="form-error">{errors.nickname}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>취소</button>
                  <button type="submit" className="btn-submit">
                    <Send size={16} />
                    건의 제출하기
                  </button>
                </div>
              </form>
            ) : (
              <div className="submit-success">
                <div className="success-icon">🎉</div>
                <h3>건의가 접수되었어요!</h3>
                <p>소중한 의견 감사합니다.<br />검토 후 편성에 반영하겠습니다.</p>
                <div className="success-summary">
                  <div className="summary-item">
                    <span className="summary-label">프로그램</span>
                    <span className="summary-value">{form.title}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">카테고리</span>
                    <span className="summary-value">{CATEGORIES.find(c => c.id === form.category)?.label}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">시간대</span>
                    <span className="summary-value">{form.preferredTime}</span>
                  </div>
                </div>
                <button className="btn-submit" onClick={closeModal}>확인</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
