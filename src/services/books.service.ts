import { API_ROUTES } from '@/constants/api.constants';
import { apiClient } from '@/lib/fetch';
import type { Page } from '@/types/api';
import type { Book, BookDetails, SearchOptions } from '@/types/books';

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

  getById: (
    bookId: string,
    accessToken: string,
    signal?: AbortSignal,
  ): Promise<BookDetails> =>
    apiClient.authorized<BookDetails>(
      `${API_ROUTES.BOOKS}/${encodeURIComponent(bookId)}`,
      accessToken,
      { signal },
    ),
};
