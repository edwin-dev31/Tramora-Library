import { useState } from 'react';
import { Dialog } from 'radix-ui';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import ThemeSwitch from '@/shared/components/theme/ThemeSwitch';
import { useAuth } from '@/features/auth/context/useAuth';
import './AppLayout.css';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/loans', label: 'Active Loans' },
  { path: '/loans/returned', label: 'Loan History' },
  { path: '/loans/reading', label: 'Reading List' },
  { path: '/wishlist', label: 'Wishlist' },
  { path: '/reservations', label: 'Reservations' },
];

const AppLayout = () => {
  const { user, status, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); };
  const links = navItems.map(item => <Link key={item.path} to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined}
    className={`library-nav-link ${location.pathname === item.path ? 'library-nav-link--active' : ''}`} onClick={closeMenu}>{item.label}</Link>);

  return <div className="library-shell min-h-dvh bg-background flex flex-col relative">
    <header className="library-header border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="library-header-inner mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="library-brand flex items-center gap-2 font-semibold text-lg" aria-label="Library Home"><span className="library-brand-mark"><img src="/logo.svg" alt="" aria-hidden="true" className="library-brand-logo" /></span><span>Library</span></Link>
        <nav aria-label="Main navigation" className="library-account flex items-center gap-2">
          <ThemeSwitch />
          {status === 'loading' ? <span role="status" className="text-sm text-muted-foreground">Restoring session…</span> : <>
            <Dialog.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Dialog.Trigger asChild><Button type="button" variant="ghost" size="icon" className="md:hidden min-h-11 min-w-11" aria-label="Open menu"><Menu className="size-5" aria-hidden="true" /></Button></Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
                <Dialog.Content className="library-mobile-menu fixed inset-y-0 right-0 z-51 w-[min(90vw,24rem)] bg-background border-l border-border flex flex-col" aria-describedby={undefined}>
                  <div className="library-mobile-menu-header flex items-center justify-between p-4 border-b border-border">
                    <Dialog.Title className="font-semibold">Menu</Dialog.Title>
                    <Dialog.Close asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Close menu"><X className="size-5" aria-hidden="true" /></Button></Dialog.Close>
                  </div>
                  <nav className="library-mobile-menu-body flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Mobile navigation">
                    {!user && <><Link to="/login" className="library-nav-link" onClick={closeMenu}>Log in</Link><Link to="/register" className="library-nav-link library-nav-link--active" onClick={closeMenu}>Sign up</Link></>}
                    {links}
                    {user && <Button variant="outline" className="w-full mt-4" onClick={handleLogout}><LogOut className="size-4" aria-hidden="true" />Log out</Button>}
                  </nav>
                  {user && <div className="library-user-card p-4 border-t border-border"><p className="truncate text-sm">Signed in as {user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <div className="hidden md:flex md:items-center md:gap-2">
              {user ? <><span className="max-w-40 truncate text-sm font-medium" title={user.name}>{user.name}</span><Button variant="outline" onClick={handleLogout}><LogOut className="size-4" aria-hidden="true" />Log out</Button></>
                : <><Link to="/login" className="library-nav-link">Log in</Link><Link to="/register" className="library-nav-link library-nav-link--active">Sign up</Link></>}
            </div>
          </>}
        </nav>
      </div>
      {user && <nav className="library-section-nav hidden md:flex mx-auto max-w-6xl px-4 pb-2 gap-1 flex-wrap" aria-label="Library sections">{links}</nav>}
    </header>
    <main className="library-main flex-1 mx-auto max-w-6xl w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8"><Outlet /></main>
  </div>;
};
export default AppLayout;
