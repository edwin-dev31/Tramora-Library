import type { AuthSession } from '@/features/auth/types';

const SESSION_KEY = 'library.auth.session';

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Authentication remains available when browser storage is blocked.
  }
};

export const readAuthSession = (): AuthSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: unknown = JSON.parse(stored);
    if (
      typeof session === 'object' &&
      session !== null &&
      'accessToken' in session &&
      typeof session.accessToken === 'string' &&
      session.accessToken.trim().length > 0 &&
      'expiresAt' in session &&
      typeof session.expiresAt === 'number' &&
      Number.isSafeInteger(session.expiresAt) &&
      session.expiresAt > Date.now()
    ) {
      return { accessToken: session.accessToken, expiresAt: session.expiresAt };
    }
  } catch {
    // Ignore corrupt data and browsers that do not allow local storage.
  }
  clearAuthSession();
  return null;
};

export const saveAuthSession = (session: AuthSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Keep this session in memory if persistence is unavailable.
  }
};
