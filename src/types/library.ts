export interface SavedBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
}

export type ReadingStatus = 'want_to_read' | 'reading' | 'completed';
export const READING_LABELS: Record<ReadingStatus, string> = {
  want_to_read: 'Want to read', reading: 'Reading', completed: 'Completed',
};

export interface ReadingEntry {
  id: string;
  book: SavedBook;
  reading_status: ReadingStatus;
}

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
