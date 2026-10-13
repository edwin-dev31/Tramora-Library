import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { clearAuthSession, readAuthSession, saveAuthSession } from '@/lib/auth-storage';
import { subscribeToUnauthorized } from '@/lib/fetch';
import { authReducer, initialAuthState } from '@/reducers/auth.reducer';
import { authService, ApiError } from '@/services/auth.service';
import type { AuthContextValue, AuthToken, LoginCredentials, RegisterInput } from '@/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const activeRequest = useRef<AbortController | null>(null);
  const pendingSubmission = useRef<AbortController | null>(null);

  const logout = useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    pendingSubmission.current = null;
    clearAuthSession();
    dispatch({ type: 'ANONYMOUS' });
  }, []);

  const cancelPendingAuth = useCallback(() => {
    const controller = pendingSubmission.current;
    if (!controller) {
      dispatch({ type: 'CLEAR_ERROR' });
      return;
    }
    controller.abort();
    pendingSubmission.current = null;
    if (activeRequest.current === controller) {
      activeRequest.current = null;
      dispatch({ type: 'ANONYMOUS' });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;

    const restoreSession = async () => {
      const session = readAuthSession();
      if (!session) {
        dispatch({ type: 'ANONYMOUS' });
        return;
      }
      try {
        const user = await authService.getCurrentUser(session.accessToken, controller.signal);
        if (activeRequest.current !== controller) return;
        if (session.expiresAt <= Date.now()) {
          clearAuthSession();
          dispatch({ type: 'ANONYMOUS' });
          return;
        }
        dispatch({ type: 'AUTHENTICATED', user, session });
      } catch {
        if (activeRequest.current !== controller) return;
        clearAuthSession();
        dispatch({ type: 'ANONYMOUS' });
      }
    };

    void restoreSession();
    return () => {
      activeRequest.current?.abort();
      activeRequest.current = null;
      pendingSubmission.current = null;
    };
  }, []);

  const authenticate = useCallback(async (
    submit: (signal: AbortSignal) => Promise<AuthToken>,
  ): Promise<boolean> => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    pendingSubmission.current = controller;
    clearAuthSession();
    dispatch({ type: 'SUBMIT' });

    try {
      const token = await submit(controller.signal);
      if (activeRequest.current !== controller) return false;
      const session = {
        accessToken: token.accessToken,
        expiresAt: Date.now() + token.expiresIn * 1000,
      };
      const user = await authService.getCurrentUser(token.accessToken, controller.signal);
      if (activeRequest.current !== controller) return false;
      if (session.expiresAt <= Date.now()) {
        throw new Error('Your session expired. Please sign in again.');
      }
      saveAuthSession(session);
      dispatch({ type: 'AUTHENTICATED', user, session });
      return true;
    } catch (error) {
      if (activeRequest.current !== controller) return false;
      const message = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.';
      dispatch({
        type: 'ANONYMOUS',
        error: message,
      });
      return false;
    } finally {
      if (pendingSubmission.current === controller) {
        pendingSubmission.current = null;
      }
    }
  }, []);

  const login = useCallback((credentials: LoginCredentials) =>
    authenticate((signal) => authService.login(credentials, signal)), [authenticate]);

  const register = useCallback((input: RegisterInput) =>
    authenticate((signal) => authService.register(input, signal)), [authenticate]);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  useEffect(() => {
    if (state.status !== 'authenticated') return;
    return subscribeToUnauthorized(logout);
  }, [state.status, logout]);

  useEffect(() => {
    if (state.expiresAt === null) return;
    const expiresAt = state.expiresAt;
    const sessionRequest = activeRequest.current;
    let timeout: ReturnType<typeof setTimeout>;
    const checkExpiration = () => {
      if (activeRequest.current !== sessionRequest) return;
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        logout();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(checkExpiration, Math.min(remaining, 2_147_483_647));
      }
    };
    timeout = setTimeout(checkExpiration, Math.max(0, Math.min(expiresAt - Date.now(), 2_147_483_647)));
    window.addEventListener('focus', checkExpiration);
    document.addEventListener('visibilitychange', checkExpiration);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('focus', checkExpiration);
      document.removeEventListener('visibilitychange', checkExpiration);
    };
  }, [state.expiresAt, logout]);

  const value = useMemo<AuthContextValue>(() => ({
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
  }), [state, login, register, cancelPendingAuth, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
