import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/context/useAuth';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <p role="status">Restoring your session…</p>;
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
