import { Navigate, Outlet } from 'react-router-dom';
import { useDiscordAuth } from '../../context/DiscordAuthContext';

/** Discord 관리자(admin) 역할만 /admin 접근 */
export function PrivateRoute() {
  const { isAdmin } = useDiscordAuth();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
