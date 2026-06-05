import { Menu, MessageSquare, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiscordLoginButton } from '../DiscordLoginButton';
import { ProfileMenu } from '../ProfileMenu';

interface Props {
  page:            'home' | 'community';
  menuOpen:        boolean;
  totalReviews:    number;
  suggestionCount: number;
  isLoggedIn:      boolean;
  isAdmin:         boolean;
  isMember:        boolean;
  onNavHome:       () => void;
  onNavCommunity:  () => void;
  onToggleMenu:    () => void;
}

export function AppHeader({
  page, menuOpen, totalReviews, suggestionCount,
  isLoggedIn, isAdmin, isMember,
  onNavHome, onNavCommunity, onToggleMenu,
}: Props) {
  return (
    <header className="header">
      <Link to="/" className="logo" onClick={onNavHome}>
        <span className="logo-ico">🛌</span>
        <span>아빠안잔다</span>
      </Link>
      <div className="hd-spacer" />

      <div className="header-nav-desktop">
        <div className="hd-auth">
          {isLoggedIn ? (
            <>
              {isAdmin && <span className="hd-admin-badge">관리자</span>}
              {isMember && <span className="hd-member-badge">회원</span>}
              <ProfileMenu />
            </>
          ) : (
            <DiscordLoginButton />
          )}
        </div>

        <button
          className={`btn-board ${page === 'community' ? 'btn-board-active' : ''}`}
          onClick={onNavCommunity}
          aria-label="커뮤니티"
        >
          <Users size={15} />
          <span>커뮤니티</span>
          {totalReviews > 0 && (
            <span className="board-badge">{totalReviews}</span>
          )}
        </button>

        <Link to="/suggestions" className="btn-board" aria-label="건의함">
          <MessageSquare size={15} />
          <span>건의함</span>
          {suggestionCount > 0 && (
            <span className="board-badge">{suggestionCount}</span>
          )}
        </Link>
      </div>

      <button className="hamburger" onClick={onToggleMenu} aria-label="메뉴">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
