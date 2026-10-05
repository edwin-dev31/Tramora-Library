import { useEffect, useState } from 'react';
import { fetchJson, ApiError } from '@/lib/fetch';

export interface UseFetchResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
}

export const useFetch = <T>(url: string | null): UseFetchResult<T> => {
  const [result, setResult] = useState<{
    url: string | null;
    data: T | null;
    error: string;
  }>({ url: null, data: null, error: '' });

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    fetchJson<T>(url, { signal: controller.signal })
      .then((data) => setResult({ url, data, error: '' }))
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError') {
          const message = requestError instanceof ApiError
            ? requestError.message
            : requestError.message;
          setResult({ url, data: null, error: message });
        }
      });

    return () => controller.abort();
  }, [url]);

  const isLoading = url !== null && result.url !== url;

  return {
    data: result.url === url ? result.data : null,
    error: result.url === url ? result.error : '',
    isLoading,
  };
};
