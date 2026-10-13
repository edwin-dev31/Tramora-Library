import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from '@/features/books/pages/home/Home';
import { booksService } from '@/features/books/api/books.service';

jest.mock('@/features/books/api/books.service', () => ({ booksService: { search: jest.fn() } }));
const request = jest.mocked(booksService.search);

beforeEach(() => {
  request.mockReset();
});

afterEach(() => jest.restoreAllMocks());

it('loads featured books from a randomly selected genre', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  request.mockResolvedValue({
    items: [
      {
        id: 'featured-1',
        title: 'Featured Book',
        authors: ['Author'],
        coverUrl: null,
        description: null,
        publishedDate: null,
      },
    ],
    pagination: { total: 1, limit: 15, offset: 0 },
  });

  render(<Home />);

  expect(await screen.findByText('Featured Book')).toBeInTheDocument();
  expect(screen.getByText('Browse by Genre')).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith(
    { query: 'fantasy', field: 'subject', limit: 15, offset: 0 },
    expect.any(AbortSignal),
  );
});

it('allows retrying the featured selection after a provider failure', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  request.mockRejectedValueOnce(new Error('Featured books unavailable')).mockResolvedValueOnce({
    items: [
      {
        id: 'featured-2',
        title: 'Recovered Book',
        authors: ['Author'],
        coverUrl: null,
        description: null,
        publishedDate: null,
      },
    ],
    pagination: { total: 1, limit: 15, offset: 0 },
  });

  render(<Home />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Featured books unavailable');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(await screen.findByText('Recovered Book')).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

it('uses the selected field, keeps prior results and advances pagination past page two', async () => {
  request.mockImplementation(async (options) => {
    if (options.limit === 15) {
      return { items: [], pagination: { total: 0, limit: 15, offset: 0 } };
    }
    const offset = options.offset ?? 0;
    return {
      items: Array.from({ length: 12 }, (_, i) => ({
        id: String(offset + i),
        title: `Book ${offset + i}`,
        authors: ['Author'],
        coverUrl: null,
        description: null,
        publishedDate: null,
      })),
      pagination: { total: 36, limit: 12, offset },
    };
  });
  Element.prototype.scrollIntoView = jest.fn();
  render(<Home />);
  fireEvent.change(screen.getByLabelText('Search field'), { target: { value: 'author' } });
  fireEvent.change(screen.getByLabelText('Search books'), { target: { value: 'Austen' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await screen.findByText('Book 0');
  expect(request).toHaveBeenCalledWith(
    { query: 'Austen', field: 'author', limit: 12, offset: 0 },
    expect.any(AbortSignal),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Load more books' }));
  await screen.findByText('Book 23');
  expect(screen.getByText('Book 0')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Load more books' }));
  await screen.findByText('Book 35');
  expect(request).toHaveBeenCalledWith(
    { query: 'Austen', field: 'author', limit: 12, offset: 24 },
    expect.any(AbortSignal),
  );
  expect(screen.queryByRole('button', { name: 'Load more books' })).not.toBeInTheDocument();
});

it('reports provider failure without automatically retrying', async () => {
  request.mockImplementation(async (options) => {
    if (options.limit === 15) {
      return { items: [], pagination: { total: 0, limit: 15, offset: 0 } };
    }
    throw new Error('Book provider unavailable');
  });
  Element.prototype.scrollIntoView = jest.fn();
  render(<Home />);
  fireEvent.change(screen.getByLabelText('Search books'), { target: { value: 'unavailable' } });
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Book provider unavailable'),
  );
  expect(request.mock.calls.filter(([options]) => options.query === 'unavailable')).toHaveLength(1);
});
