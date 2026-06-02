import { Navigate, Outlet } from 'react-router-dom';
import { useDiscordAuth } from '../../context/DiscordAuthContext';
import { isAdminSession } from '../../utils/auth/adminSession';

/** 푸터 관리자 비밀번호 세션 또는 Discord admin 역할 */
export function PrivateRoute() {
  const { isAdmin: discordAdmin } = useDiscordAuth();
  if (!isAdminSession() && !discordAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
