import { Navigate, Outlet } from 'react-router-dom';
import { isAdminSession } from '../utils/adminSession';

/** sessionStorage isAdmin 없으면 메인(/)으로 리다이렉트 */
export function PrivateRoute() {
  if (!isAdminSession()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
