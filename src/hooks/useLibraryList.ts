import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/fetch';
import { useAuth } from '@/context/auth/useAuth';

const PAGE_SIZE = 12;

// Personal-library endpoints return arrays, unlike the paginated Google catalog.
export function useLibraryList<T extends { id: string }>(path: string) {
  const { accessToken } = useAuth();
  const key = `${accessToken}:${path}`;
  const [state, setState] = useState({ key, items: [] as T[], loading: true, error: '', hasMore: false });
  const active = useRef<AbortController | null>(null);
  const items = useRef<T[]>([]);

  const load = useCallback(async (append = false) => {
    if (!accessToken) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const offset = append ? items.current.length : 0;
    setState(previous => ({ ...previous, loading: true, error: '', ...(append ? {} : { items: [] }) }));
    try {
      const page = await apiClient.authorized<T[]>(`${path}${path.includes('?') ? '&' : '?'}limit=${PAGE_SIZE}&offset=${offset}`, accessToken, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const combined = append ? [...items.current, ...page] : page;
      items.current = Array.from(new Map(combined.map(item => [item.id, item])).values());
      setState({ key, items: items.current, loading: false, error: '', hasMore: page.length === PAGE_SIZE });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState(previous => ({ ...previous, loading: false, error: error instanceof Error ? error.message : 'Unable to load your library.' }));
    }
  }, [accessToken, path, key]);

  useEffect(() => {
    items.current = [];
    void load();
    return () => active.current?.abort();
  }, [key, load]);

  return {
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    items: state.key === key ? state.items : [],
    refetch: () => load(),
    loadMore: () => { if (!state.loading && state.hasMore) void load(true); },
  };
}
