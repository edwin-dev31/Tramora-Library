import { useRef, useState } from 'react';
import { apiClient } from '@/lib/fetch';
import { useAuth } from '@/context/auth/useAuth';

export function useLibraryAction() {
  const { accessToken } = useAuth();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => {
    if (pending.current || !accessToken) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await apiClient.authorized(path, accessToken, {
        method,
        ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      });
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to complete this action.');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return { run, busy, error };
}
