import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { apiClient } from '@/shared/api/http';
import type { Page } from '@/shared/api/types';
import type { Book, BookDetails, SearchOptions } from '@/features/books/types';

export const booksService = {
  search: (options: SearchOptions, signal?: AbortSignal): Promise<Page<Book>> => {
    const params = new URLSearchParams({
      query: options.query,
      field: options.field ?? 'all',
      limit: String(options.limit ?? 12),
      offset: String(options.offset ?? 0),
    });

    return apiClient.get<Page<Book>>(`${API_ENDPOINTS.books.list}?${params}`, { signal });
  },

  getById: (
    bookId: string,
    accessToken: string,
    signal?: AbortSignal,
  ): Promise<BookDetails> =>
    apiClient.authorized<BookDetails>(
      API_ENDPOINTS.books.detail(bookId),
      accessToken,
      { signal },
    ),
};
