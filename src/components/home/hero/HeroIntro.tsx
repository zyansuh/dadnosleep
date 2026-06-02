import { Heart, Calendar, Edit3, AlertCircle } from 'lucide-react';

interface Props {
  randing:                  boolean;
  randError:                string;
  canEditSchedule:          boolean;
  canAccessMemberContent:   boolean;
  isLoggedIn:               boolean;
  isGuestLoggedIn:          boolean;
  onLoginClick:             () => void;
  onOpenRandomPicker:       () => void;
  onOpenScheduleEdit:       () => void;
}

export function HeroIntro({
  randing, randError, canEditSchedule, canAccessMemberContent,
  isLoggedIn, isGuestLoggedIn, onLoginClick, onOpenRandomPicker, onOpenScheduleEdit,
}: Props) {
  return (
    <div className="hero-left">
      <div className="hero-pill">
        <Heart size={12} fill="currentColor" />
        목·금 고정 편성 + 실시간 랜덤 추천
      </div>

      <div className="hero-title-wrap">
        <h1 className="site-title">아빠안잔다</h1>
      </div>

      <p className="site-sub">우리가 함께 보는 OTT 편성표</p>
      <p className="site-desc">
        하루의 끝, 가족·연인·친구가 함께 즐길 수 있는<br />
        OTT 프로그램을 고정 편성과 실시간 추천으로 매일 새롭게 만나보세요.
      </p>

      <div className="hero-ctas">
        <a href="#schedule-section" className="btn-hero-primary">
          <Calendar size={15} /> 오늘 편성표 보기
        </a>
        <button className="btn-hero-secondary" onClick={onOpenRandomPicker} disabled={randing}>
          ⭐ {randing ? '생성 중…' : '랜덤 편성 생성하기'}
        </button>
        {canEditSchedule && (
          <button className="btn-hero-secondary btn-hero-edit" onClick={onOpenScheduleEdit}>
            <Edit3 size={14} /> 편성표 수정하기
          </button>
        )}
      </div>

      {!canAccessMemberContent && (
        <p className="hero-member-hint">
          {isLoggedIn && !isGuestLoggedIn ? (
            <>🔒 VIP 회원만 회원 전용 편성을 볼 수 있습니다. VIP 지정은 관리자에게 문의해 주세요.</>
          ) : isGuestLoggedIn ? (
            <>🔒 동호회 명단에 등록된 회원만 이용할 수 있습니다. 가입 문의는 관리자에게 연락해 주세요.</>
          ) : (
            <>
              🔒 <button type="button" className="link-btn" onClick={onLoginClick}>로그인</button>
              하시면 동호회 회원·VIP 전용 편성을 확인할 수 있어요.
            </>
          )}
        </p>
      )}

      {randError && (
        <div className="rand-error">
          <AlertCircle size={14} />
          <span>{randError}</span>
        </div>
      )}
    </div>
  );
}
