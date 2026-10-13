import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '@/pages/home/Home';
import { booksService } from '@/services/books.service';

jest.mock('@/services/books.service', () => ({ booksService: { search: jest.fn() } }));
const request = jest.mocked(booksService.search);

beforeEach(() => request.mockReset());

it('does not request Google books merely by mounting the home page', () => {
  render(<Home />);
  expect(request).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Load featured books' })).toBeInTheDocument();
});

it('uses the selected field, keeps prior results and advances pagination past page two', async () => {
  request.mockImplementation(async options => {
    const offset = options.offset ?? 0;
    return { items: Array.from({ length: 12 }, (_, i) => ({ id: String(offset + i), title: `Book ${offset + i}`, authors: ['Author'], coverUrl: null, description: null, publishedDate: null })), pagination: { total: 36, limit: 12, offset } };
  });
  Element.prototype.scrollIntoView = jest.fn();
  render(<Home />);
  fireEvent.change(screen.getByLabelText('Search field'), { target: { value: 'author' } });
  fireEvent.change(screen.getByLabelText('Search books'), { target: { value: 'Austen' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await screen.findByText('Book 0');
  expect(request.mock.calls[0][0]).toEqual({ query: 'Austen', field: 'author', limit: 12, offset: 0 });
  fireEvent.click(screen.getByRole('button', { name: 'Load more books' }));
  await screen.findByText('Book 23');
  expect(screen.getByText('Book 0')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load more books' }));
  await screen.findByText('Book 35');
  expect(request.mock.calls[2][0]).toEqual({ query: 'Austen', field: 'author', limit: 12, offset: 24 });
  expect(screen.queryByRole('button', { name: 'Load more books' })).not.toBeInTheDocument();
});

it('reports provider failure without automatically retrying', async () => {
  request.mockRejectedValue(new Error('Book provider unavailable'));
  Element.prototype.scrollIntoView = jest.fn();
  render(<Home />);
  fireEvent.click(screen.getByRole('button', { name: 'Load featured books' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Book provider unavailable'));
  expect(request).toHaveBeenCalledTimes(1);
});
