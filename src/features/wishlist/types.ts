import type { SavedBook } from '@/shared/types/books';

export type ReadingStatus = 'want_to_read' | 'reading' | 'completed';

export const READING_LABELS: Record<ReadingStatus, string> = {
  want_to_read: 'Want to read',
  reading: 'Reading',
  completed: 'Completed',
};

export interface ReadingEntry {
  id: string;
  book: SavedBook;
  reading_status: ReadingStatus;
}
