export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginCredentials {
  name: string;
}

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: number | null;
  status: 'loading' | 'anonymous' | 'authenticated';
  isSubmitting: boolean;
  error: string | null;
}

export interface AuthContextValue extends Omit<AuthState, 'expiresAt'> {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  cancelPendingAuth: () => void;
  logout: () => void;
  clearError: () => void;
}
