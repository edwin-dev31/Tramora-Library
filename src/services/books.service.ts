import { API_ROUTES } from '@/constants/api.constants';
import { apiClient } from '@/lib/fetch';
import type { Page } from '@/types/api';
import type { Book, SearchOptions } from '@/types/books';

export const booksService = {
  search: (options: SearchOptions, signal?: AbortSignal): Promise<Page<Book>> => {
    const params = new URLSearchParams({
      query: options.query,
      field: options.field ?? 'all',
      limit: String(options.limit ?? 12),
      offset: String(options.offset ?? 0),
    });

    return apiClient.get<Page<Book>>(`${API_ROUTES.BOOKS}?${params}`, { signal });
  },
};
