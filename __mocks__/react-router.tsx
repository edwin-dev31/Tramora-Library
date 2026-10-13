import React from 'react';

export const MemoryRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Outlet = () => <div data-testid="outlet" />;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const Link = ({ to, children, ...props }: LinkProps) => (
  <a
    href={to}
    {...props}
  >
    {children}
  </a>
);

export const NavLink = Link;

export function useNavigate() {
  return jest.fn();
}

export function useLocation() {
  return { pathname: '/', search: '', hash: '', state: null };
}

export function useParams() {
  return {};
}

export function useLoaderData() {
  return null;
}

export function useActionData() {
  return null;
}

export function useNavigation() {
  return { state: 'idle' };
}

export function useRouteLoaderData() {
  return null;
}

export function useMatches() {
  return [];
}

export function useHref(to: string) {
  return to;
}

export function useResolvedPath(to: string) {
  return { pathname: to, search: '', hash: '' };
}
