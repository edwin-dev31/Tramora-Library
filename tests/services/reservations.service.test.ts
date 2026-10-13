import { apiClient } from '@/shared/api/http';
import { reservationsService } from '@/features/reservations/api/reservations.service';

jest.mock('@/shared/api/http', () => ({
  apiClient: { authorized: jest.fn() },
}));

const authorized = jest.mocked(apiClient.authorized);

describe('reservationsService', () => {
  beforeEach(() => authorized.mockReset());

  it('loads active and historical reservations with pagination', async () => {
    const controller = new AbortController();
    const request = { limit: 12, offset: 24, signal: controller.signal };
    authorized.mockResolvedValue([]);

    await reservationsService.getActive('session-token', request);
    await reservationsService.getHistory('session-token', request);

    expect(authorized).toHaveBeenNthCalledWith(
      1,
      '/reservations/active?limit=12&offset=24',
      'session-token',
      { signal: controller.signal },
    );
    expect(authorized).toHaveBeenNthCalledWith(
      2,
      '/reservations/history?limit=12&offset=24',
      'session-token',
      { signal: controller.signal },
    );
  });

  it('creates a reservation for a book', async () => {
    authorized.mockResolvedValue(undefined);

    await reservationsService.create('book-1', 'session-token');

    expect(authorized).toHaveBeenCalledWith('/reservations', 'session-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: 'book-1' }),
      signal: undefined,
    });
  });

  it('updates notifications for an encoded reservation id', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue(undefined);

    await reservationsService.updateNotifications(
      'reservation/one',
      true,
      'session-token',
      controller.signal,
    );

    expect(authorized).toHaveBeenCalledWith(
      '/reservations/reservation%2Fone/notifications',
      'session-token',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled: true }),
        signal: controller.signal,
      },
    );
  });

  it('cancels an encoded reservation id', async () => {
    authorized.mockResolvedValue(undefined);

    await reservationsService.cancel('reservation/one', 'session-token');

    expect(authorized).toHaveBeenCalledWith(
      '/reservations/reservation%2Fone',
      'session-token',
      { method: 'DELETE', signal: undefined },
    );
  });
});
