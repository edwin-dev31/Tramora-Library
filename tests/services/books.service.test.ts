import { apiClient } from '@/lib/fetch';
import { booksService } from '@/services/books.service';

jest.mock('@/lib/fetch', () => ({
  apiClient: { get: jest.fn() },
}));

const get = jest.mocked(apiClient.get);

describe('booksService', () => {
  beforeEach(() => get.mockReset());

  it('builds an encoded catalog search request', async () => {
    const controller = new AbortController();
    get.mockResolvedValue({
      items: [],
      pagination: { total: 0, limit: 20, offset: 40 },
    });

    await booksService.search({
      query: 'science fiction',
      field: 'subject',
      limit: 20,
      offset: 40,
    }, controller.signal);

    expect(get).toHaveBeenCalledWith(
      '/books?query=science+fiction&field=subject&limit=20&offset=40',
      { signal: controller.signal },
    );
  });

  it('uses catalog defaults for optional search values', async () => {
    get.mockResolvedValue({
      items: [],
      pagination: { total: 0, limit: 12, offset: 0 },
    });

    await booksService.search({ query: 'Dune' });

    expect(get).toHaveBeenCalledWith(
      '/books?query=Dune&field=all&limit=12&offset=0',
      { signal: undefined },
    );
  });
});
