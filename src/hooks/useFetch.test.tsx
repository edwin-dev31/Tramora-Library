import '@testing-library/jest-dom';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';
import { fetchJson, ApiError } from '@/lib/fetch';

jest.mock('@/lib/fetch', () => ({
  fetchJson: jest.fn(),
  ApiError: class ApiError extends Error {
    public status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

const mockFetchJson = jest.mocked(fetchJson);

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state when url is null', () => {
    const { result } = renderHook(() => useFetch<string>(null));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('fetches data successfully and updates state', async () => {
    const mockData = { id: 1, title: 'Test Book' };
    mockFetchJson.mockResolvedValue(mockData);

    const { result } = renderHook(() => useFetch<typeof mockData>('/api/books/1'));

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await waitFor(() => expect(result.current.data).toEqual(mockData));

    expect(result.current.error).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(mockFetchJson).toHaveBeenCalledWith('/api/books/1', expect.any(Object));
  });

  it('handles fetch error and sets error state', async () => {
    const errorMessage = 'Failed to fetch';
    mockFetchJson.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFetch<string>('/api/books/1'));

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await waitFor(() => expect(result.current.error).toBe(errorMessage));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles ApiError with custom message', async () => {
    const apiError = new ApiError('Not found', 404);
    mockFetchJson.mockRejectedValue(apiError);

    const { result } = renderHook(() => useFetch<string>('/api/books/999'));

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await waitFor(() => expect(result.current.error).toBe('Not found'));
  });

  it('refetches data when refetch is called', async () => {
    const mockData1 = { id: 1, title: 'Book 1' };
    const mockData2 = { id: 2, title: 'Book 2' };
    mockFetchJson.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() => useFetch<typeof mockData1>('/api/books/1'));

    await waitFor(() => expect(result.current.data).toEqual(mockData1));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toEqual(mockData2));

    expect(mockFetchJson).toHaveBeenCalledTimes(2);
  });

  it('aborts previous request when url changes', async () => {
    const mockData1 = { id: 1 };
    const mockData2 = { id: 2 };
    mockFetchJson.mockResolvedValueOnce(mockData1).mockResolvedValueOnce(mockData2);

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/books/1' } }
    );

    await waitFor(() => expect(result.current.data).toEqual(mockData1));

    rerender({ url: '/api/books/2' });

    await waitFor(() => expect(result.current.data).toEqual(mockData2));
  });

  it('handles network error', async () => {
    const networkError = new Error('Network error');
    mockFetchJson.mockRejectedValue(networkError);

    const { result } = renderHook(() => useFetch<string>('/api/books/1'));

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await waitFor(() => expect(result.current.error).toBe('Network error'));
  });

  it('clears error on new fetch', async () => {
    mockFetchJson
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValueOnce({ id: 1, title: 'Success' });

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/books/1' } }
    );

    await waitFor(() => expect(result.current.error).toBe('Error 1'));

    rerender({ url: '/api/books/2' });

    await waitFor(() => expect(result.current.error).toBe(''));
    await waitFor(() => expect(result.current.data).toEqual({ id: 1, title: 'Success' }));
  });
});