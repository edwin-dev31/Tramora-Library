import { BookOpen, LogOut } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth/useAuth';

const AppLayout = () => {
  const { user, status, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b-[0.0625rem] border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="size-5" aria-hidden="true" />
            Library
          </Link>
          <nav aria-label="Account" className="flex flex-wrap items-center gap-2">
            {status === 'loading' ? (
              <span role="status" className="text-sm text-muted-foreground">
                Restoring session…
              </span>
            ) : user ? (
              <>
                <span className="max-w-40 truncate text-sm" title={user.name}>
                  {user.name}
                </span>
                <Button type="button" variant="outline" onClick={logout}>
                  <LogOut aria-hidden="true" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
