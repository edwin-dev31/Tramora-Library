import { apiClient } from '@/shared/api/http';
import { booksService } from '@/features/books/api/books.service';

jest.mock('@/shared/api/http', () => ({
  apiClient: { get: jest.fn(), authorized: jest.fn() },
}));

const get = jest.mocked(apiClient.get);
const authorized = jest.mocked(apiClient.authorized);

describe('booksService', () => {
  beforeEach(() => {
    get.mockReset();
    authorized.mockReset();
  });

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

  it('loads an encoded book id through the authenticated API', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue({});

    await booksService.getById('work/one', 'session-token', controller.signal);

    expect(authorized).toHaveBeenCalledWith(
      '/books/work%2Fone',
      'session-token',
      { signal: controller.signal },
    );
  });
});
