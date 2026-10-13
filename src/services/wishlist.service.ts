import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiClient } from '@/lib/fetch';
import type { ListRequest } from '@/types/api';
import type { ReadingEntry, ReadingStatus } from '@/types/library';

export const wishlistService = {
  getAll: (accessToken: string, request: ListRequest): Promise<ReadingEntry[]> => {
    const params = new URLSearchParams({
      limit: String(request.limit),
      offset: String(request.offset),
    });

    return apiClient.authorized<ReadingEntry[]>(
      `${API_ENDPOINTS.wishlist.list}?${params}`,
      accessToken,
      { signal: request.signal },
    );
  },

  add: (bookId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(API_ENDPOINTS.wishlist.list, accessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
      signal,
    }),

  updateStatus: (
    entryId: string,
    status: ReadingStatus,
    accessToken: string,
    signal?: AbortSignal,
  ) =>
    apiClient.authorized<void>(
      API_ENDPOINTS.wishlist.entry(entryId),
      accessToken,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        signal,
      },
    ),

  remove: (entryId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(
      API_ENDPOINTS.wishlist.entry(entryId),
      accessToken,
      { method: 'DELETE', signal },
    ),
};
