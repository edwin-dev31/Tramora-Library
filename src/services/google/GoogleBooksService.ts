import {env} from '@/config/env';
import { buildQueryString, encodeSearchTerm } from './queryBuilderService';
import type { GoogleBooksResponse } from '@/types/googleBooks';

const API_URL = env.GOOGLE_API_URL;

export type SearchOptions = {
  query: string;
  maxResults?: number;
  startIndex?: number;
};

export const fetchBooks = async (options: SearchOptions): Promise<GoogleBooksResponse> => {
  const { query, maxResults = 10, startIndex = 0 } = options;

  const qs = buildQueryString({
    q: encodeSearchTerm(query),
    maxResults,
    startIndex,
    key: env.GOOGLE_BOOKS_KEY,
  });

  const res = await fetch(`${API_URL}?${qs}`);

  if (!res.ok) {
    throw new Error(`Google Books error ${res.status}: ${res.statusText}`);
  }

  return res.json();
};