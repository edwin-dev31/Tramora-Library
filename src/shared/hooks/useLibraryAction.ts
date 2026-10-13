import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/context/useAuth';

export function useLibraryAction() {
  const { accessToken } = useAuth();
  const active = useRef(new Map<string, AbortController>());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      active.current.forEach((controller) => controller.abort());
      active.current.clear();
    },
    [],
  );

  const runOperation = async (
    key: string,
    operation: (accessToken: string, signal: AbortSignal) => Promise<unknown>,
  ) => {
    if (active.current.has(key) || !accessToken) return false;
    const controller = new AbortController();
    active.current.set(key, controller);
    setPendingKeys((previous) => new Set(previous).add(key));
    setError('');
    try {
      await operation(accessToken, controller.signal);
      return true;
    } catch (error) {
      if (controller.signal.aborted) return false;
      setError(error instanceof Error ? error.message : 'Unable to complete this action.');
      return false;
    } finally {
      if (active.current.get(key) === controller) {
        active.current.delete(key);
        if (!controller.signal.aborted) {
          setPendingKeys((previous) => {
            const next = new Set(previous);
            next.delete(key);
            return next;
          });
        }
      }
    }
  };

  return {
    runOperation,
    busy: pendingKeys.size > 0,
    isPending: (key: string) => pendingKeys.has(key),
    error,
  };
}
