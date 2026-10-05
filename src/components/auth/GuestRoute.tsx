import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/auth/useAuth';

const GuestRoute = () => {
  const { status } = useAuth();

  if (status === 'loading') {
    return <p role="status" className="text-center text-muted-foreground">Restoring your session…</p>;
  }

  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />;
};

export default GuestRoute;
