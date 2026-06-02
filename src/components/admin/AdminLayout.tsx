import { NavLink, Outlet, Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Shield, Users, LayoutDashboard } from 'lucide-react';
import { useDiscordAuth } from '../../context/DiscordAuthContext';

export function AdminLayout() {
  const { logout, displayName } = useDiscordAuth();

  return (
    <div className="admin-shell">
      <header className="admin-page-hd">
        <Link to="/" className="btn-back">
          <ArrowLeft size={18} /> 사이트로
        </Link>
        <h1><Shield size={22} /> 관리자</h1>
        <button type="button" className="btn-auth btn-auth-logout" onClick={logout}>
          <LogOut size={14} /> 세션 종료
        </button>
      </header>

      <div className="admin-shell-body">
        <aside className="admin-sidebar">
          <p className="admin-sidebar-user">{displayName ?? '관리자'}</p>
          <nav className="admin-sidebar-nav">
            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              <LayoutDashboard size={16} /> 대시보드
            </NavLink>
            <NavLink to="/admin/members" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              <Users size={16} /> 회원 명단 관리
            </NavLink>
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
