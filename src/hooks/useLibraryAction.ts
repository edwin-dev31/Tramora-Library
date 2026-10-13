import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth/useAuth';

export function useLibraryAction() {
  const { accessToken } = useAuth();
  const pending = useRef(false);
  const active = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => active.current?.abort(), []);

  const runOperation = async (
    operation: (accessToken: string, signal: AbortSignal) => Promise<unknown>,
  ) => {
    if (pending.current || !accessToken) return false;
    const controller = new AbortController();
    pending.current = true;
    active.current = controller;
    setBusy(true);
    setError('');
    try {
      await operation(accessToken, controller.signal);
      return true;
    } catch (error) {
      if (controller.signal.aborted) return false;
      setError(error instanceof Error ? error.message : 'Unable to complete this action.');
      return false;
    } finally {
      if (active.current === controller) {
        active.current = null;
        pending.current = false;
        if (!controller.signal.aborted) setBusy(false);
      }
    }
  };

  return { runOperation, busy, error };
}
