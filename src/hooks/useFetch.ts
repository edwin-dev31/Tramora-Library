import { fetchJson } from '@/lib/fetch';
import { useAsyncResource, type UseAsyncResourceResult } from './useAsyncResource';

export type UseFetchResult<T> = UseAsyncResourceResult<T>;

export const useFetch = <T>(url: string | null, token?: string | null): UseFetchResult<T> => {
  const key = url ? JSON.stringify([url, token]) : null;

  return useAsyncResource<T>(key, signal =>
    fetchJson<T>(url!, {
      signal,
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    })
  );
};
