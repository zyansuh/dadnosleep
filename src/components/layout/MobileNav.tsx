import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { DiscordLoginButton } from '../DiscordLoginButton';
import { ProfileMenu } from '../ProfileMenu';

interface Props {
  page:            'home' | 'community';
  totalReviews:    number;
  suggestionCount: number;
  isLoggedIn:      boolean;
  isAdmin:         boolean;
  isMember:        boolean;
  onNavHome:       () => void;
  onNavCommunity:  () => void;
  onGoAdmin:       () => void;
  onOpenSuggest:   () => void;
}

export function MobileNav({
  page, totalReviews, suggestionCount,
  isLoggedIn, isAdmin, isMember,
  onNavHome, onNavCommunity, onGoAdmin, onOpenSuggest,
}: Props) {
  return (
    <nav className="mobile-nav" aria-label="메인 메뉴">
      {isLoggedIn ? (
        <div className="mob-nav-user">
          <div className="mob-nav-badges">
            {isAdmin && <span className="hd-admin-badge">관리자</span>}
            {isMember && <span className="hd-member-badge">회원</span>}
          </div>
          <ProfileMenu />
        </div>
      ) : (
        <div className="mob-nav-discord">
          <DiscordLoginButton fullWidth />
        </div>
      )}
      <button
        type="button"
        className={`mob-nav-btn ${page === 'home' ? 'mob-nav-btn-active' : ''}`}
        onClick={onNavHome}
      >
        🏠 홈 / 편성표
      </button>
      <button
        type="button"
        className={`mob-nav-btn ${page === 'community' ? 'mob-nav-btn-active' : ''}`}
        onClick={onNavCommunity}
      >
        💬 커뮤니티
        {totalReviews > 0 && (
          <span className="board-badge mob-nav-badge">{totalReviews}</span>
        )}
      </button>
      {isAdmin && (
        <button type="button" className="mob-nav-btn" onClick={onGoAdmin}>
          <Shield size={16} /> 관리자 페이지
        </button>
      )}
      <Link to="/suggestions" className="mob-nav-btn">
        📮 건의함 ({suggestionCount})
      </Link>
      <button type="button" className="btn-suggest mob-cta" onClick={onOpenSuggest}>
        ✏️ 프로그램 신청하기
      </button>
    </nav>
  );
}
