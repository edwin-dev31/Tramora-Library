import { useEffect, useState } from 'react';
import type { ApiResponse } from '@/types/api';
import type { UseFetchResult } from '@/types/use-fetch.types';

export const useFetch = <T>(url: string | null): UseFetchResult<T> => {
  const [result, setResult] = useState<{
    url: string | null;
    data: T | null;
    error: string;
  }>({ url: null, data: null, error: '' });

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as ApiResponse<T>;

        if (!response.ok || payload.error) {
          const details = payload.error?.details?.join('. ');
          throw new Error(details || payload.message || `Request failed (${response.status})`);
        }

        return payload.data;
      })
      .then((data) => setResult({ url, data, error: '' }))
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError') {
          setResult({ url, data: null, error: requestError.message });
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
