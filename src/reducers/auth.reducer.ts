import type { AuthSession, AuthState, AuthUser } from '@/types/auth';

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  expiresAt: null,
  status: 'loading',
  isSubmitting: false,
  error: null,
};

type AuthAction =
  | { type: 'SUBMIT' }
  | { type: 'AUTHENTICATED'; user: AuthUser; session: AuthSession }
  | { type: 'ANONYMOUS'; error?: string }
  | { type: 'CLEAR_ERROR' };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SUBMIT':
      return { ...initialAuthState, status: 'anonymous', isSubmitting: true };
    case 'AUTHENTICATED':
      return {
        ...initialAuthState,
        ...action.session,
        user: action.user,
        status: 'authenticated',
      };
    case 'ANONYMOUS':
      return { ...initialAuthState, status: 'anonymous', error: action.error ?? null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
  }
};
