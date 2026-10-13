import { act, renderHook, waitFor } from '@testing-library/react';
import { useLibraryAction } from '@/shared/hooks/useLibraryAction';

jest.mock('@/features/auth/context/useAuth', () => ({
  useAuth: () => ({ accessToken: 'test-session' }),
}));

it('tracks mutations per item and permits operations on different rows', async () => {
  let releaseFirst!: () => void;
  const firstOperation = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        releaseFirst = resolve;
      }),
  );
  const secondOperation = jest.fn().mockResolvedValue(undefined);
  const duplicateOperation = jest.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useLibraryAction());
  let firstResult = Promise.resolve(false);

  act(() => {
    firstResult = result.current.runOperation('first-row', firstOperation);
  });

  await waitFor(() => expect(result.current.isPending('first-row')).toBe(true));
  expect(result.current.busy).toBe(true);

  let secondSucceeded = false;
  await act(async () => {
    secondSucceeded = await result.current.runOperation('second-row', secondOperation);
  });

  expect(secondSucceeded).toBe(true);
  expect(secondOperation).toHaveBeenCalledWith('test-session', expect.any(AbortSignal));
  expect(result.current.isPending('first-row')).toBe(true);
  expect(result.current.isPending('second-row')).toBe(false);

  const duplicateSucceeded = await result.current.runOperation('first-row', duplicateOperation);
  expect(duplicateSucceeded).toBe(false);
  expect(duplicateOperation).not.toHaveBeenCalled();

  await act(async () => {
    releaseFirst();
    await firstResult;
  });

  expect(result.current.busy).toBe(false);
});
