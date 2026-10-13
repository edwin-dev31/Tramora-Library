import { act, renderHook, waitFor } from '@testing-library/react';
import { useLibraryList } from '@/hooks/useLibraryList';

jest.mock('@/context/auth/useAuth', () => ({ useAuth: () => ({ accessToken: 'test-session' }) }));

it('passes pagination to the service loader and appends three pages without replacing previous items', async () => {
  const loader = jest.fn(async (_accessToken: string, request: { offset: number }) =>
    Array.from({ length: request.offset === 24 ? 1 : 12 }, (_, index) => ({ id: `${request.offset + index}` }))
  );
  const { result } = renderHook(() => useLibraryList<{ id: string }>('wishlist', loader));
  await waitFor(() => expect(result.current.items).toHaveLength(12));
  expect(loader).toHaveBeenCalledWith('test-session', expect.objectContaining({ limit: 12, offset: 0, signal: expect.any(AbortSignal) }));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.items).toHaveLength(24));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.items).toHaveLength(25));
  expect(result.current.items[0].id).toBe('0');
  expect(result.current.hasMore).toBe(false);
});

it('shows an action refresh error and permits a retry', async () => {
  const loader = jest.fn()
    .mockResolvedValueOnce([{ id: 'saved' }])
    .mockRejectedValueOnce(new Error('Session expired'))
    .mockResolvedValueOnce([]);
  const { result } = renderHook(() => useLibraryList<{ id: string }>('loans:history', loader));
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  await act(() => result.current.refetch());
  expect(result.current.error).toBe('Session expired');
  await act(() => result.current.refetch());
  expect(result.current.error).toBe('');
  expect(result.current.items).toHaveLength(0);
});
