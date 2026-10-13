import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AppLayout from '@/components/layout/AppLayout';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '@/context/auth/AuthProvider';

const mockLogout = jest.fn();

let mockUser: { id: string; name: string; email: string } | null = null;
let mockStatus: 'unauthenticated' | 'loading' | 'authenticated' = 'unauthenticated';

jest.mock('@/context/auth/useAuth', () => ({
  useAuth: () => ({
    get user() {
      return mockUser;
    },
    get status() {
      return mockStatus;
    },
    logout: mockLogout,
    login: jest.fn(),
    register: jest.fn(),
    isSubmitting: false,
    error: null,
    clearError: jest.fn(),
    cancelPendingAuth: jest.fn(),
  }),
}));

const renderAppLayout = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AppLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockUser = null;
    mockStatus = 'unauthenticated';
  });

  it('renders header with logo and title', () => {
    renderAppLayout();
    expect(screen.getByText('Library')).toBeInTheDocument();
    const logoLink = screen.getByRole('link', { name: 'Library Home' });
    expect(logoLink.querySelector('img')).toHaveAttribute('src', '/logo.svg');
  });

  it('switches to dark mode and persists the preference', () => {
    renderAppLayout();
    const themeSwitch = screen.getByRole('switch', { name: 'Dark mode' });

    expect(themeSwitch).not.toBeChecked();
    fireEvent.click(themeSwitch);

    expect(themeSwitch).toBeChecked();
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('library-theme')).toBe('dark');
  });

  it('renders login and sign up buttons when unauthenticated', () => {
    mockStatus = 'unauthenticated';
    renderAppLayout();
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('shows loading state while restoring session', () => {
    mockStatus = 'loading';
    renderAppLayout();
    expect(screen.getByText('Restoring session…')).toBeInTheDocument();
  });

  it('renders user name and logout button when authenticated', () => {
    mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockStatus = 'authenticated';
    renderAppLayout();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('truncates long user names', () => {
    mockUser = { id: '1', name: 'A'.repeat(50), email: 'john@example.com' };
    mockStatus = 'authenticated';
    renderAppLayout();
    
    const nameSpan = screen.getByTitle('A'.repeat(50));
    expect(nameSpan).toHaveClass('truncate');
    expect(nameSpan).toHaveClass('max-w-40');
  });

  it('calls logout when logout button is clicked', () => {
    mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockStatus = 'authenticated';
    renderAppLayout();
    const logoutButton = screen.getByRole('button', { name: 'Log out' });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders outlet for child routes', () => {
    renderAppLayout();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('has correct header structure', () => {
    renderAppLayout();
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-border');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('navigation has aria-label', () => {
    renderAppLayout();
    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeInTheDocument();
  });

  it('logo link navigates to home', () => {
    renderAppLayout();
    const logoLink = screen.getByRole('link', { name: /library/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  describe('Login link', () => {
    it('navigates to /login', () => {
      mockStatus = 'unauthenticated';
      renderAppLayout();
      const loginLink = screen.getByRole('link', { name: 'Log in' });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Register link', () => {
    it('navigates to /register', () => {
      mockStatus = 'unauthenticated';
      renderAppLayout();
      const registerLink = screen.getByRole('link', { name: 'Sign up' });
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Authenticated user', () => {
    it('shows user name with max width and truncate', () => {
      mockUser = { id: '1', name: 'Very Long User Name That Should Be Truncated', email: 'test@example.com' };
      mockStatus = 'authenticated';
      renderAppLayout();
      const nameSpan = screen.getByTitle('Very Long User Name That Should Be Truncated');
      expect(nameSpan).toHaveClass('max-w-40');
      expect(nameSpan).toHaveClass('truncate');
    });

    it('logout button has logout icon', () => {
      mockUser = { id: '1', name: 'John', email: 'john@example.com' };
      mockStatus = 'authenticated';
      renderAppLayout();
      const logoutButton = screen.getByRole('button', { name: 'Log out' });
      expect(logoutButton.querySelector('svg')).toBeInTheDocument();
    });
  });
});
