import { useCallback, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useSessionLifecycle } from './useSessionLifecycle';
import { authReducer, initialAuthState } from '@/features/auth/model/auth.reducer';
import { authService } from '@/features/auth/api/auth.service';
import type { AuthContextValue, LoginCredentials, RegisterInput } from '@/features/auth/types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const { authenticate, cancelPendingAuth, logout } = useSessionLifecycle({
    status: state.status,
    expiresAt: state.expiresAt,
    dispatch,
  });

  const login = useCallback(
    (credentials: LoginCredentials) =>
      authenticate((signal) => authService.login(credentials, signal)),
    [authenticate],
  );

  const register = useCallback(
    (input: RegisterInput) => authenticate((signal) => authService.register(input, signal)),
    [authenticate],
  );

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      status: state.status,
      isSubmitting: state.isSubmitting,
      error: state.error,
      login,
      register,
      cancelPendingAuth,
      logout,
      clearError,
    }),
    [state, login, register, cancelPendingAuth, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
