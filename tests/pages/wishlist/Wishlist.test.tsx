import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Wishlist from '@/pages/wishlist/Wishlist';
import { apiClient } from '@/lib/fetch';

jest.mock('@/lib/fetch', () => ({ apiClient: { authorized: jest.fn() } }));
jest.mock('@/context/auth/useAuth', () => ({ useAuth: () => ({ accessToken: 'session' }) }));
const request = jest.mocked(apiClient.authorized);

it('renders backend book.author and reading_status and submits status changes to the authenticated API', async () => {
  const row = { id: 'entry', book: { id: 'volume', title: 'Saved book', author: 'Real Author', coverUrl: null }, reading_status: 'want_to_read' };
  request.mockResolvedValueOnce([row]).mockResolvedValueOnce({}).mockResolvedValueOnce([{ ...row, reading_status: 'reading' }]);
  render(<Wishlist />);
  await screen.findByText('Real Author');
  fireEvent.change(screen.getByLabelText('Reading status'), { target: { value: 'reading' } });
  await waitFor(() => expect(request).toHaveBeenCalledWith('/wishlist/entry', 'session', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ status: 'reading' }) })));
  await waitFor(() => expect(screen.getByLabelText('Reading status')).toHaveValue('reading'));
});

it('keeps a failed removal visible and reports the error', async () => {
  request.mockResolvedValueOnce([{ id: 'entry', book: { id: 'volume', title: 'Saved book', author: 'Author', coverUrl: null }, reading_status: 'reading' }]).mockRejectedValueOnce(new Error('Unable to connect'));
  render(<Wishlist />);
  await screen.findByText('Saved book');
  fireEvent.click(screen.getByRole('button', { name: 'Remove from wishlist' }));
  await screen.findByRole('alert');
  expect(screen.getByText('Saved book')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to connect');
});
