/** @jest-environment node */

import { apiClient, fetchJson, subscribeToUnauthorized } from '@/lib/fetch';

jest.mock('@/config/env', () => ({
  env: { API_URL: 'https://library.test/' },
}));

const mockFetch = jest.fn();

describe('API client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    globalThis.fetch = mockFetch;
  });

  it('unwraps successful API responses', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: { id: 'book-1' },
      error: null,
      message: 'Book found',
    }), { status: 200 }));

    await expect(fetchJson('/books/book-1')).resolves.toEqual({ id: 'book-1' });
    expect(mockFetch).toHaveBeenCalledWith('https://library.test/books/book-1', {});
  });

  it('preserves structured API errors', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: null,
      error: { code: 'BOOK_NOT_FOUND', details: ['book-1'] },
      message: 'Book not found',
    }), { status: 404 }));

    const request = fetchJson('/books/book-1');

    await expect(request).rejects.toMatchObject({
      message: 'Book not found',
      status: 404,
      code: 'BOOK_NOT_FOUND',
      details: ['book-1'],
    });
  });

  it('accepts successful responses without content', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(fetchJson<void>('/wishlist/book-1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('adds JSON headers without discarding custom headers', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: { accessToken: 'token' },
      error: null,
      message: 'Authenticated',
    }), { status: 200 }));

    await apiClient.post('/auth/login', { email: 'reader@example.com' }, {
      headers: { 'X-Request-ID': 'request-1' },
    });

    const options = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = new Headers(options.headers);
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ email: 'reader@example.com' }));
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Request-ID')).toBe('request-1');
  });

  it('adds authorization without discarding existing headers', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: [],
      error: null,
      message: 'Loans found',
    }), { status: 200 }));

    await apiClient.authorized('/loans/active', 'session-token', {
      headers: { 'X-Request-ID': 'request-2' },
    });

    const options = mockFetch.mock.calls[0][1] as RequestInit;
    const headers = new Headers(options.headers);
    expect(headers.get('Authorization')).toBe('Bearer session-token');
    expect(headers.get('X-Request-ID')).toBe('request-2');
  });

  it('notifies subscribers when an authenticated request receives a 401', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: null,
      error: { code: 'INVALID_SESSION' },
      message: 'Session expired',
    }), { status: 401 }));
    const listener = jest.fn();
    const unsubscribe = subscribeToUnauthorized(listener);

    await expect(apiClient.authorized('/loans/active', 'expired-token')).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_SESSION',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('does not invalidate the session for unauthenticated 401 responses', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({
      data: null,
      error: { code: 'INVALID_CREDENTIALS' },
      message: 'Invalid credentials',
    }), { status: 401 }));
    const listener = jest.fn();
    const unsubscribe = subscribeToUnauthorized(listener);

    await expect(apiClient.post('/auth/login', { email: 'reader@example.com' })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
