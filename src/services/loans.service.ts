import { API_ENDPOINTS } from '@/constants/api.constants';
import { apiClient } from '@/lib/fetch';
import type { ListRequest } from '@/types/api';
import type { ReadingEntry } from '@/types/library';
import type { Loan } from '@/types/loans';

const list = <T>(path: string, accessToken: string, request: ListRequest) => {
  const params = new URLSearchParams({
    limit: String(request.limit),
    offset: String(request.offset),
  });
  return apiClient.authorized<T[]>(`${path}?${params}`, accessToken, { signal: request.signal });
};

export const loansService = {
  getActive: (accessToken: string, request: ListRequest): Promise<Loan[]> =>
    list<Loan>(API_ENDPOINTS.loans.active, accessToken, request),

  getHistory: (accessToken: string, request: ListRequest): Promise<Loan[]> =>
    list<Loan>(API_ENDPOINTS.loans.history, accessToken, request),

  getReadingList: (accessToken: string, request: ListRequest): Promise<ReadingEntry[]> =>
    list<ReadingEntry>(API_ENDPOINTS.loans.reading, accessToken, request),

  getById: (loanId: string, accessToken: string, signal?: AbortSignal): Promise<Loan> =>
    apiClient.authorized<Loan>(
      API_ENDPOINTS.loans.detail(loanId),
      accessToken,
      { signal },
    ),

  borrow: (bookId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized(API_ENDPOINTS.loans.list, accessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
      signal,
    }),

  renew: (loanId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized(API_ENDPOINTS.loans.renew(loanId), accessToken, {
      method: 'PUT',
      signal,
    }),

  returnLoan: (loanId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized(API_ENDPOINTS.loans.returnLoan(loanId), accessToken, {
      method: 'PUT',
      signal,
    }),
};
