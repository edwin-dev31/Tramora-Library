import { apiClient } from '@/shared/api/http';
import { loansService } from '@/features/loans/api/loans.service';

jest.mock('@/shared/api/http', () => ({
  apiClient: { authorized: jest.fn() },
}));

const authorized = jest.mocked(apiClient.authorized);

describe('loansService', () => {
  beforeEach(() => authorized.mockReset());

  it('loads active loans with pagination and cancellation', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue([]);

    await loansService.getActive('session-token', {
      limit: 12,
      offset: 24,
      signal: controller.signal,
    });

    expect(authorized).toHaveBeenCalledWith(
      '/loans/active?limit=12&offset=24',
      'session-token',
      { signal: controller.signal },
    );
  });

  it('renews an encoded loan id through the authenticated API', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue(undefined);

    await loansService.renew('loan/one', 'session-token', controller.signal);

    expect(authorized).toHaveBeenCalledWith(
      '/loans/loan%2Fone/renew',
      'session-token',
      { method: 'PUT', signal: controller.signal },
    );
  });

  it('loads an encoded loan id through the authenticated API', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue({});

    await loansService.getById('loan/one', 'session-token', controller.signal);

    expect(authorized).toHaveBeenCalledWith(
      '/loans/loan%2Fone',
      'session-token',
      { signal: controller.signal },
    );
  });

  it('creates a loan for a book', async () => {
    const controller = new AbortController();
    authorized.mockResolvedValue(undefined);

    await loansService.borrow('book-1', 'session-token', controller.signal);

    expect(authorized).toHaveBeenCalledWith(
      '/loans',
      'session-token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: 'book-1' }),
        signal: controller.signal,
      },
    );
  });

  it('returns a loan through the authenticated API', async () => {
    authorized.mockResolvedValue(undefined);

    await loansService.returnLoan('loan-1', 'session-token');

    expect(authorized).toHaveBeenCalledWith(
      '/loans/loan-1/return',
      'session-token',
      { method: 'PUT', signal: undefined },
    );
  });
});
