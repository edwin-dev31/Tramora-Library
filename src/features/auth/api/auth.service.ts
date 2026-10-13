import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { apiClient, ApiError } from '@/shared/api/http';
import type { AuthToken, AuthUser, LoginCredentials, RegisterInput } from '@/features/auth/types';

export const authService = {
  login: (credentials: LoginCredentials, signal?: AbortSignal): Promise<AuthToken> =>
    apiClient.post<AuthToken>(API_ENDPOINTS.auth.login, credentials, { signal }),

  register: (input: RegisterInput, signal?: AbortSignal): Promise<AuthToken> =>
    apiClient.post<AuthToken>(API_ENDPOINTS.auth.register, input, { signal }),

  getCurrentUser: (accessToken: string, signal?: AbortSignal): Promise<AuthUser> =>
    apiClient.authorized<AuthUser>(API_ENDPOINTS.auth.me, accessToken, { signal }),
};

export { ApiError };
