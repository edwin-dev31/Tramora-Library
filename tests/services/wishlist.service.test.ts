import { apiClient } from '@/shared/api/http';
import { wishlistService } from '@/features/wishlist/api/wishlist.service';

jest.mock('@/shared/api/http', () => ({
  apiClient: { authorized: jest.fn() },
}));

const authorized = jest.mocked(apiClient.authorized);

describe('wishlistService', () => {
  beforeEach(() => authorized.mockReset());

  it('loads wishlist entries with pagination', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue([]);

    await wishlistService.getAll('session-token', {
      limit: 12,
      offset: 24,
      signal: controller.signal,
    });

    expect(authorized).toHaveBeenCalledWith('/wishlist?limit=12&offset=24', 'session-token', {
      signal: controller.signal,
    });
  });

  it('adds a book to the wishlist', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue(undefined);

    await wishlistService.add('book-1', 'session-token', controller.signal);

    expect(authorized).toHaveBeenCalledWith('/wishlist', 'session-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: 'book-1' }),
      signal: controller.signal,
    });
  });

  it('updates and removes an encoded wishlist entry', async () => {
    authorized.mockResolvedValue(undefined);

    await wishlistService.updateStatus('entry/one', 'reading', 'session-token');
    await wishlistService.remove('entry/one', 'session-token');

    expect(authorized).toHaveBeenNthCalledWith(1, '/wishlist/entry%2Fone', 'session-token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reading' }),
      signal: undefined,
    });
    expect(authorized).toHaveBeenNthCalledWith(2, '/wishlist/entry%2Fone', 'session-token', {
      method: 'DELETE',
      signal: undefined,
    });
  });
});
