import { API_ROUTES } from '@/constants/api.constants';
import { apiClient } from '@/lib/fetch';
import type { ListRequest } from '@/types/api';
import type { Reservation } from '@/types/library';

const list = (path: string, accessToken: string, request: ListRequest) => {
  const params = new URLSearchParams({
    limit: String(request.limit),
    offset: String(request.offset),
  });

  return apiClient.authorized<Reservation[]>(
    `${path}?${params}`,
    accessToken,
    { signal: request.signal },
  );
};

export const reservationsService = {
  getActive: (accessToken: string, request: ListRequest): Promise<Reservation[]> =>
    list(`${API_ROUTES.RESERVATIONS}/active`, accessToken, request),

  getHistory: (accessToken: string, request: ListRequest): Promise<Reservation[]> =>
    list(`${API_ROUTES.RESERVATIONS}/history`, accessToken, request),

  create: (bookId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(API_ROUTES.RESERVATIONS, accessToken, {
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
      `${API_ROUTES.RESERVATIONS}/${encodeURIComponent(reservationId)}/notifications`,
      accessToken,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationsEnabled }),
        signal,
      },
    ),

  cancel: (reservationId: string, accessToken: string, signal?: AbortSignal) =>
    apiClient.authorized<void>(
      `${API_ROUTES.RESERVATIONS}/${encodeURIComponent(reservationId)}`,
      accessToken,
      { method: 'DELETE', signal },
    ),
};
