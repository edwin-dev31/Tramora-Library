import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/auth/useAuth';

const GuestRoute = () => {
  const { status } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') && !['/login', '/register'].includes(from) ? from : '/';

  if (status === 'loading') {
    return <p role="status" className="text-center text-muted-foreground">Restoring your session…</p>;
  }

  return status === 'authenticated' ? <Navigate to={destination} replace /> : <Outlet />;
};

export default GuestRoute;
