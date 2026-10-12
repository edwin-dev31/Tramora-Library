import { useEffect, useState, useCallback } from 'react';
import { fetchJson } from '@/lib/fetch';

export interface UseFetchResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
  refetch: () => void;
}

export const useFetch = <T>(url: string | null, token?: string | null): UseFetchResult<T> => {
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([url, token, revision]);
  const [result, setResult] = useState<{ key: string; data: T | null; error: string }>({ key: '', data: null, error: '' });
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetchJson<T>(url, {
      signal: controller.signal,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    }).then(data => {
      if (!controller.signal.aborted) setResult({ key, data, error: '' });
    }).catch((error: Error) => {
      if (!controller.signal.aborted) setResult({ key, data: null, error: error.message });
    });
    return () => controller.abort();
  }, [url, token, key]);
  const refetch = useCallback(() => setRevision(value => value + 1), []);
  return {
    data: url && result.key === key ? result.data : null,
    error: url && result.key === key ? result.error : '',
    isLoading: url !== null && result.key !== key,
    refetch,
  };
};
