import type { SavedBook } from '@/shared/types/books';

export interface Reservation {
  id: string;
  book: SavedBook;
  status: 'waiting' | 'ready' | 'expired' | 'collected' | 'cancelled';
  position: number;
  notifications_enabled: boolean;
  created_at: string;
  ready_at: string | null;
  expires_at: string | null;
  estimated_available_at: string | null;
}
