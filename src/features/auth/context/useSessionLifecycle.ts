import { useCallback, useEffect, useRef, type Dispatch } from 'react';
import { clearAuthSession, readAuthSession, saveAuthSession } from '@/features/auth/model/auth-storage';
import { subscribeToUnauthorized } from '@/shared/api/http';
import type { AuthAction } from '@/features/auth/model/auth.reducer';
import { authService, ApiError } from '@/features/auth/api/auth.service';
import type { AuthState, AuthToken } from '@/features/auth/types';

const MAX_TIMEOUT = 2_147_483_647;

interface SessionLifecycleOptions {
  status: AuthState['status'];
  expiresAt: number | null;
  dispatch: Dispatch<AuthAction>;
}

export function useSessionLifecycle({
  status,
  expiresAt,
  dispatch,
}: SessionLifecycleOptions) {
  const activeRequest = useRef<AbortController | null>(null);
  const pendingSubmission = useRef<AbortController | null>(null);

  const logout = useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    pendingSubmission.current = null;
    clearAuthSession();
    dispatch({ type: 'ANONYMOUS' });
  }, [dispatch]);

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
  }, [dispatch]);

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
  }, [dispatch]);

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
      dispatch({ type: 'ANONYMOUS', error: message });
      return false;
    } finally {
      if (pendingSubmission.current === controller) {
        pendingSubmission.current = null;
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    return subscribeToUnauthorized(logout);
  }, [status, logout]);

  useEffect(() => {
    if (expiresAt === null) return;
    const sessionRequest = activeRequest.current;
    let timeout: ReturnType<typeof setTimeout>;
    const checkExpiration = () => {
      if (activeRequest.current !== sessionRequest) return;
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        logout();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(checkExpiration, Math.min(remaining, MAX_TIMEOUT));
      }
    };
    timeout = setTimeout(
      checkExpiration,
      Math.max(0, Math.min(expiresAt - Date.now(), MAX_TIMEOUT)),
    );
    window.addEventListener('focus', checkExpiration);
    document.addEventListener('visibilitychange', checkExpiration);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('focus', checkExpiration);
      document.removeEventListener('visibilitychange', checkExpiration);
    };
  }, [expiresAt, logout]);

  return { authenticate, cancelPendingAuth, logout };
}
