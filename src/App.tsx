import React, { useState } from 'react';
import { Clock, Radio, Plus, X, Send, ChevronLeft, ChevronRight, Mic, Music, Gamepad2, Film, BookOpen, Zap } from 'lucide-react';
import './App.css';

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  host: string;
  category: string;
  status: 'live' | 'upcoming' | 'past';
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
  { id: 'music', label: '음악', icon: Music },
  { id: 'talk', label: '토크', icon: Mic },
  { id: 'game', label: '게임', icon: Gamepad2 },
  { id: 'movie', label: '영화/드라마', icon: Film },
  { id: 'edu', label: '교양/정보', icon: BookOpen },
  { id: 'special', label: '특집', icon: Zap },
];

const SCHEDULE_DATA: ScheduleItem[] = [
  { id: 1, time: '00:00', title: '심야 음악 여행', host: 'DJ 문라이트', category: 'music', status: 'past', duration: '120분', description: '잠들기 전 편안한 선율과 함께하는 심야 음악 여행' },
  { id: 2, time: '02:00', title: '새벽 힐링 토크', host: '라디오 수다방', category: 'talk', status: 'past', duration: '60분', description: '새벽을 함께하는 따뜻한 이야기' },
  { id: 3, time: '06:00', title: '모닝 뮤직 박스', host: 'DJ 선샤인', category: 'music', status: 'past', duration: '120분', description: '활기찬 하루를 여는 아침 음악' },
  { id: 4, time: '08:00', title: '오늘의 게임 뉴스', host: '게임스타', category: 'game', status: 'past', duration: '60분', description: '최신 게임 트렌드와 리뷰' },
  { id: 5, time: '10:00', title: '라이브 토크쇼', host: '아나운서 김민지', category: 'talk', status: 'past', duration: '90분', description: '다양한 게스트와 함께하는 활기찬 토크쇼' },
  { id: 6, time: '12:00', title: '점심 영화 특선', host: '시네마 클럽', category: 'movie', status: 'live', duration: '120분', description: '오늘의 점심과 함께 즐기는 영화 한 편' },
  { id: 7, time: '14:00', title: '오후 음악 파티', host: 'DJ 애프터눈', category: 'music', status: 'upcoming', duration: '120분', description: '신나는 오후를 만들어줄 핫한 음악 파티' },
  { id: 8, time: '16:00', title: '게임 스트리밍 라이브', host: '프로게이머 팀A', category: 'game', status: 'upcoming', duration: '120분', description: '프로게이머와 함께하는 실시간 게임 방송' },
  { id: 9, time: '18:00', title: '저녁 교양 시간', host: '강사 이지훈', category: 'edu', status: 'upcoming', duration: '60분', description: '알면 도움이 되는 생활 속 교양 정보' },
  { id: 10, time: '19:00', title: '황금 뮤직쇼', host: 'DJ 골든타임', category: 'music', status: 'upcoming', duration: '120분', description: '황금 시간대를 장식하는 최고의 뮤직쇼' },
  { id: 11, time: '21:00', title: '특집 드라마 상영', host: '드라마 채널', category: 'movie', status: 'upcoming', duration: '90분', description: '화제의 드라마 특집 상영' },
  { id: 12, time: '22:30', title: '늦은 밤 토크', host: '나이트 스튜디오', category: 'talk', status: 'upcoming', duration: '90분', description: '오늘 하루를 마무리하는 심야 토크 프로그램' },
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const categoryColors: Record<string, string> = {
  music: '#6c63ff',
  talk: '#ff6584',
  game: '#2ed573',
  movie: '#ffa502',
  edu: '#1e90ff',
  special: '#ff4757',
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'live') {
    return (
      <span className="badge badge-live">
        <span className="live-dot" />
        LIVE
      </span>
    );
  }
  if (status === 'upcoming') {
    return <span className="badge badge-upcoming">예정</span>;
  }
  return <span className="badge badge-past">종료</span>;
};

const getCategoryInfo = (categoryId: string) => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
};

function App() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<SuggestionForm>({
    title: '',
    category: '',
    preferredTime: '',
    description: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<Partial<SuggestionForm>>({});

  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7;

  const handleDayChange = (dir: number) => {
    setSelectedDay(prev => (prev + dir + 7) % 7);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsSubmitted(false);
    setForm({ title: '', category: '', preferredTime: '', description: '', nickname: '' });
    setErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const validate = () => {
    const newErrors: Partial<SuggestionForm> = {};
    if (!form.title.trim()) newErrors.title = '프로그램명을 입력해주세요';
    if (!form.category) newErrors.category = '카테고리를 선택해주세요';
    if (!form.preferredTime.trim()) newErrors.preferredTime = '원하는 방송 시간을 입력해주세요';
    if (!form.description.trim()) newErrors.description = '건의 내용을 입력해주세요';
    if (!form.nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  const liveProgram = SCHEDULE_DATA.find(s => s.status === 'live');

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <Radio size={24} />
            <span>dadnosleep</span>
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
              <span className="gradient-text">dadnosleep</span>
              <br />
              편성표
            </h1>
            <p className="hero-desc">좋아하는 방송을 언제든지 확인하고,<br />원하는 프로그램을 건의해보세요!</p>
          </div>
          {liveProgram && (
            <div className="hero-live-card">
              <div className="live-card-label">
                <span className="live-dot" />
                현재 방송 중
              </div>
              <div className="live-card-title">{liveProgram.title}</div>
              <div className="live-card-host">{liveProgram.host}</div>
              <div className="live-card-desc">{liveProgram.description}</div>
            </div>
          )}
        </section>

        {/* 편성표 섹션 */}
        <section className="schedule-section">
          <div className="schedule-header">
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
            {SCHEDULE_DATA.map(item => {
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
                    <span className="duration-text">{item.duration}</span>
                  </div>
                  <div className="schedule-bar" />
                  <div className="schedule-content">
                    <div className="schedule-top">
                      <div className="schedule-category">
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
                  <p className="modal-subtitle">원하는 프로그램을 알려주세요</p>
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
                    placeholder="예: 매주 금요일 오후 8시"
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
