import { useCallback, useEffect, useReducer, useRef } from 'react';
import { booksService } from '@/services/books.service';
import type { Page } from '@/types/api';
import type { Book, SearchField } from '@/types/books';

const PAGE_SIZE = 12;

export interface BookSearchCriteria {
  query: string;
  field: SearchField;
}

interface BookSearchState {
  query: string;
  field: SearchField;
  search: BookSearchCriteria | null;
  books: Book[];
  offset: number;
  hasMore: boolean;
  loading: boolean;
  error: string;
}

type BookSearchAction =
  | { type: 'set-query'; query: string }
  | { type: 'set-field'; field: SearchField }
  | { type: 'start'; search: BookSearchCriteria; append: boolean }
  | { type: 'success'; page: Page<Book>; offset: number; append: boolean }
  | { type: 'failure'; message: string }
  | { type: 'clear' };

const initialState: BookSearchState = {
  query: '',
  field: 'all',
  search: null,
  books: [],
  offset: 0,
  hasMore: false,
  loading: false,
  error: '',
};

function reducer(state: BookSearchState, action: BookSearchAction): BookSearchState {
  switch (action.type) {
    case 'set-query':
      return { ...state, query: action.query };
    case 'set-field':
      return { ...state, field: action.field };
    case 'start':
      return {
        ...state,
        query: action.search.query,
        field: action.search.field,
        search: action.search,
        loading: true,
        error: '',
        ...(action.append ? {} : { books: [], offset: 0, hasMore: false }),
      };
    case 'success': {
      const books = action.append ? [...state.books, ...action.page.items] : action.page.items;
      const uniqueBooks = Array.from(new Map(books.map(book => [book.id, book])).values());
      const offset = action.offset + action.page.items.length;

      return {
        ...state,
        books: uniqueBooks,
        offset,
        hasMore: action.page.items.length > 0 && offset < action.page.pagination.total,
        loading: false,
      };
    }
    case 'failure':
      return { ...state, loading: false, error: action.message };
    case 'clear':
      return { ...initialState, field: state.field };
  }
}

export function useBookSearch(onInitialLoadSettled?: () => void) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pending = useRef<AbortController | null>(null);
  const onInitialLoadSettledRef = useRef(onInitialLoadSettled);
  onInitialLoadSettledRef.current = onInitialLoadSettled;

  useEffect(() => () => pending.current?.abort(), []);

  const load = useCallback(async (
    search: BookSearchCriteria,
    offset: number,
    append: boolean,
  ) => {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    dispatch({ type: 'start', search, append });

    try {
      const page = await booksService.search({
        ...search,
        limit: PAGE_SIZE,
        offset,
      }, controller.signal);
      if (!controller.signal.aborted) {
        dispatch({ type: 'success', page, offset, append });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        dispatch({
          type: 'failure',
          message: error instanceof Error ? error.message : 'Unable to search books.',
        });
      }
    } finally {
      if (pending.current === controller) pending.current = null;
      if (!controller.signal.aborted && !append) onInitialLoadSettledRef.current?.();
    }
  }, []);

  const searchBooks = useCallback(
    (search: BookSearchCriteria) => load(search, 0, false),
    [load],
  );

  const loadMore = useCallback(() => {
    if (state.search && state.hasMore && !state.loading) {
      return load(state.search, state.offset, true);
    }
  }, [load, state.hasMore, state.loading, state.offset, state.search]);

  return {
    ...state,
    setQuery: (query: string) => dispatch({ type: 'set-query', query }),
    setField: (field: SearchField) => dispatch({ type: 'set-field', field }),
    searchBooks,
    loadMore,
    clear: () => dispatch({ type: 'clear' }),
  };
}
