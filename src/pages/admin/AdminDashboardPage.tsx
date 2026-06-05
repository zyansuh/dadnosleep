import { Link } from 'react-router-dom';
import { AdminTestToolsPanel } from '../../components/admin/test/AdminTestToolsPanel';

export function AdminDashboardPage() {
  return (
    <div className="admin-page-body">
      <h2 className="admin-panel-title">대시보드</h2>
      <p className="admin-page-desc">
        이 세션은 브라우저 탭을 닫으면 만료됩니다. 편성표·후기 관리는 메인 사이트에서 진행하세요.
      </p>
      <ul className="admin-links">
        <li>
          <Link to="/">🏠 메인 편성표 · API 추천</Link>
        </li>
        <li>
          <Link to="/#schedule-section">📅 편성표 섹션</Link>
        </li>
        <li>
          <Link to="/admin/members">👥 회원 명단 · 탈퇴 처리</Link>
        </li>
        <li>
          <Link to="/admin/points">🏆 기간별 포인트</Link>
        </li>
        <li>
          <Link to="/admin/suggestions">📮 건의함 관리</Link>
        </li>
      </ul>

      <AdminTestToolsPanel />

      <p className="admin-note">
        Discord 관리자 계정으로 로그인한 세션입니다. 관리자 추가는 README 「관리자 추가」를 참고하세요.
      </p>
    </div>
  );
}
