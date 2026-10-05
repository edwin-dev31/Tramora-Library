import { env } from '@/config/env';

const API_BASE = env.API_URL.replace(/\/+$/, '');

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
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.ok
        ? 'The server returned an invalid response. Please try again.'
        : fallbackMessage(response.status),
      response.status
    );
  }

  if (!response.ok) {
    const error = payload as { error?: { code?: string; details?: string[] }; message?: string };
    throw new ApiError(
      error?.message || fallbackMessage(response.status),
      response.status,
      error?.error?.code,
      error?.error?.details
    );
  }

  const successPayload = payload as { data: T; error: null; message: string };
  if (successPayload.error !== null || successPayload.data === undefined) {
    throw new ApiError(
      'The server returned an invalid response. Please try again.',
      response.status
    );
  }

  return successPayload.data;
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

  return parseResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options: RequestInit = {}) =>
    fetchJson<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options: RequestInit = {}) =>
    fetchJson<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options: RequestInit = {}) =>
    fetchJson<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options: RequestInit = {}) =>
    fetchJson<T>(path, { method: 'DELETE', ...options }),

  authorized: <T>(path: string, token: string, options: RequestInit = {}) =>
    fetchJson<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }),
};