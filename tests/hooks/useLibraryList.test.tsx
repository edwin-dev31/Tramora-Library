import { act, renderHook, waitFor } from '@testing-library/react';
import { useLibraryList } from '@/hooks/useLibraryList';
import { apiClient } from '@/lib/fetch';

jest.mock('@/lib/fetch', () => ({ apiClient: { authorized: jest.fn() } }));
jest.mock('@/context/auth/useAuth', () => ({ useAuth: () => ({ accessToken: 'test-session' }) }));
const request = jest.mocked(apiClient.authorized);

it('authenticates array responses and appends three pages without replacing previous items', async () => {
  request.mockImplementation(async path => Array.from({ length: path.includes('offset=24') ? 1 : 12 }, (_, index) => ({ id: `${Number(new URLSearchParams(path.split('?')[1]).get('offset')) + index}` })));
  const { result } = renderHook(() => useLibraryList<{ id: string }>('/wishlist'));
  await waitFor(() => expect(result.current.items).toHaveLength(12));
  expect(request).toHaveBeenCalledWith('/wishlist?limit=12&offset=0', 'test-session', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.items).toHaveLength(24));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.items).toHaveLength(25));
  expect(result.current.items[0].id).toBe('0');
  expect(result.current.hasMore).toBe(false);
});

it('shows an action refresh error and permits a retry', async () => {
  request.mockResolvedValueOnce([{ id: 'saved' }]).mockRejectedValueOnce(new Error('Session expired')).mockResolvedValueOnce([]);
  const { result } = renderHook(() => useLibraryList<{ id: string }>('/loans/history'));
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  await act(() => result.current.refetch());
  expect(result.current.error).toBe('Session expired');
  await act(() => result.current.refetch());
  expect(result.current.error).toBe('');
  expect(result.current.items).toHaveLength(0);
});
