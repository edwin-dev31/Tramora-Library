import { useCallback, useEffect, useState } from 'react';
import { booksService } from '@/features/books/api/books.service';
import { BOOK_GENRES } from '@/features/books/genres';
import type { Book } from '@/features/books/types';

const FEATURED_LIMIT = 15;

interface FeaturedBooksState {
  books: Book[];
  loading: boolean;
  error: string;
}

const initialState: FeaturedBooksState = {
  books: [],
  loading: true,
  error: '',
};

export function useFeaturedBooks() {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const controller = new AbortController();
    const genre = BOOK_GENRES[Math.floor(Math.random() * BOOK_GENRES.length)];

    booksService.search({
      query: genre.query,
      field: 'subject',
      limit: FEATURED_LIMIT,
      offset: 0,
    }, controller.signal).then(page => {
      if (!controller.signal.aborted) {
        setState({ books: page.items, loading: false, error: '' });
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setState({
          books: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load featured books.',
        });
      }
    });

    return () => controller.abort();
  }, [revision]);

  const retry = useCallback(() => {
    setState(previous => ({ ...previous, loading: true, error: '' }));
    setRevision(value => value + 1);
  }, []);

  return { ...state, retry };
}
