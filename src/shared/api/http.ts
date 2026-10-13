import { env } from '@/shared/config/env';
import type { ApiResponse } from '@/shared/api/types';

const API_BASE = env.API_URL.replace(/\/+$/, '');
const unauthorizedListeners = new Set<() => void>();

export const subscribeToUnauthorized = (listener: () => void) => {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
};

const notifyUnauthorized = () => {
  unauthorizedListeners.forEach(listener => {
    try {
      listener();
    } catch {
      // A consumer error must not replace the original API error.
    }
  });
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: string[];

  constructor(message: string, status: number, code?: string, details?: string[], options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let responseText: string;
  try {
    responseText = await response.text();
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an invalid response. Please try again.'
        : fallbackMessage(response.status),
      response.status
    );
  }

  if (!responseText) {
    if (response.ok) return undefined as T;
    throw new ApiError(fallbackMessage(response.status), response.status);
  }

  let payload: ApiResponse<T>;
  try {
    payload = JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an invalid response. Please try again.'
        : fallbackMessage(response.status),
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      payload.message || fallbackMessage(response.status),
      response.status,
      payload.error?.code,
      payload.error?.details
    );
  }

  if (payload.error !== null || payload.data === undefined) {
    throw new ApiError(
      'The server returned an invalid response. Please try again.',
      response.status
    );
  }

  return payload.data;
}

function fallbackMessage(status: number): string {
  if (status === 400) return 'Please check your information and try again.';
  if (status === 401) return 'Your credentials or session are invalid. Please sign in again.';
  if (status === 409) return 'This email is already registered. Please sign in.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Please try again later.';
  return 'Unable to complete your request. Please try again.';
}

export async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError('Unable to connect to the server. Please try again.', 0, 'NETWORK_ERROR', undefined, { cause: error });
  }

  const headers = new Headers(options.headers);
  if (response.status === 401 && headers.has('Authorization')) {
    notifyUnauthorized();
  }

  return parseResponse<T>(response);
}

const withJsonBody = (body: unknown, options: RequestInit): RequestInit => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return {
    ...options,
    headers,
    body: JSON.stringify(body),
  };
};

export const apiClient = {
  get: <T>(path: string, options: RequestInit = {}) =>
    fetchJson<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options: RequestInit = {}) =>
    fetchJson<T>(path, { ...withJsonBody(body, options), method: 'POST' }),

  put: <T>(path: string, body: unknown, options: RequestInit = {}) =>
    fetchJson<T>(path, { ...withJsonBody(body, options), method: 'PUT' }),

  delete: <T>(path: string, options: RequestInit = {}) =>
    fetchJson<T>(path, { method: 'DELETE', ...options }),

  authorized: <T>(path: string, token: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetchJson<T>(path, { ...options, headers });
  },
};
