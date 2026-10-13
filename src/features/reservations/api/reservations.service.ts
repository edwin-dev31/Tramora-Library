import { API_ENDPOINTS } from '@/shared/api/endpoints';
import { apiClient } from '@/shared/api/http';
import type { ListRequest } from '@/shared/api/types';
import type { Reservation } from '@/features/reservations/types';

const list = (path: string, accessToken: string, request: ListRequest) => {
  const params = new URLSearchParams({
    limit: String(request.limit),
    offset: String(request.offset),
  });

  return apiClient.authorized<Reservation[]>(`${path}?${params}`, accessToken, {
    signal: request.signal,
  });
};

export const reservationsService = {
  getActive: (accessToken: string, request: ListRequest): Promise<Reservation[]> =>
    list(API_ENDPOINTS.reservations.active, accessToken, request),

  getHistory: (accessToken: string, request: ListRequest): Promise<Reservation[]> =>
    list(API_ENDPOINTS.reservations.history, accessToken, request),

  create: (bookId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(API_ENDPOINTS.reservations.list, accessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId }),
      signal,
    }),

  updateNotifications: (
    reservationId: string,
    notificationsEnabled: boolean,
    accessToken: string,
    signal?: AbortSignal,
  ) =>
    apiClient.authorized<void>(
      API_ENDPOINTS.reservations.notifications(reservationId),
      accessToken,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled }),
        signal,
      },
    ),

  cancel: (reservationId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(API_ENDPOINTS.reservations.detail(reservationId), accessToken, {
      method: 'DELETE',
      signal,
    }),
};
