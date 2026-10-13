import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/context/auth/AuthProvider';
import { useAuth } from '@/context/auth/useAuth';
import { saveAuthSession } from '@/lib/auth-storage';
import { authService } from '@/services/auth.service';

jest.mock('@/services/auth.service', () => ({
  ApiError: class ApiError extends Error {},
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const login = jest.mocked(authService.login);
const getCurrentUser = jest.mocked(authService.getCurrentUser);
const user = { id: 'reader-1', name: 'Reader', email: 'reader@example.com' };

function AuthProbe() {
  const auth = useAuth();
  return <>
    <span data-testid="status">{auth.status}</span>
    <span data-testid="access-token">{auth.accessToken ?? ''}</span>
    {auth.user && <span>{auth.user.name}</span>}
    <button type="button" onClick={() => void auth.login({
      email: 'reader@example.com',
      password: 'password123',
    })}>Log in</button>
  </>;
}

const renderProvider = () => render(<AuthProvider><AuthProbe /></AuthProvider>);

describe('AuthProvider session lifecycle', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    login.mockReset();
    getCurrentUser.mockReset();
  });

  it('restores and validates a persisted session', async () => {
    saveAuthSession({ accessToken: 'saved-token', expiresAt: Date.now() + 60_000 });
    getCurrentUser.mockResolvedValue(user);

    renderProvider();

    await screen.findByText('Reader');
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('access-token')).toHaveTextContent('saved-token');
    expect(getCurrentUser).toHaveBeenCalledWith('saved-token', expect.any(AbortSignal));
  });

  it('persists a validated session after login', async () => {
    login.mockResolvedValue({ accessToken: 'new-token', expiresIn: 60 });
    getCurrentUser.mockResolvedValue(user);
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'));

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(login).toHaveBeenCalledWith(
      { email: 'reader@example.com', password: 'password123' },
      expect.any(AbortSignal),
    );
    expect(getCurrentUser).toHaveBeenCalledWith('new-token', expect.any(AbortSignal));
    expect(JSON.parse(window.sessionStorage.getItem('library.auth.session') ?? '{}')).toMatchObject({
      accessToken: 'new-token',
      expiresAt: expect.any(Number),
    });
  });
});
