import { useEffect, useState, useCallback } from 'react';
import { fetchJson, ApiError } from '@/lib/fetch';

export interface UseFetchResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
  refetch: () => void;
}

export const useFetch = <T>(url: string | null): UseFetchResult<T> => {
  const [result, setResult] = useState<{
    url: string | null;
    data: T | null;
    error: string;
  }>({ url: null, data: null, error: '' });

  const fetchData = useCallback((fetchUrl: string) => {
    const controller = new AbortController();

    fetchJson<T>(fetchUrl, { signal: controller.signal })
      .then((data) => setResult({ url: fetchUrl, data, error: '' }))
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError') {
          const message = requestError instanceof ApiError
            ? requestError.message
            : requestError.message;
          setResult({ url: fetchUrl, data: null, error: message });
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!url) return;
    return fetchData(url);
  }, [url, fetchData]);

  const isLoading = url !== null && result.url !== url;

  const refetch = useCallback(() => {
    if (url) {
      fetchData(url);
    }
  }, [url, fetchData]);

  return {
    data: result.url === url ? result.data : null,
    error: result.url === url ? result.error : '',
    isLoading,
    refetch,
  };
};
