import type { SearchField } from '@/features/books/types';

export type SearchCategory = {
  label: string;
  keyword: SearchField;
  placeholder: string;
};

export const ALL_FIELDS: SearchCategory = {
  label: 'All fields',
  keyword: 'all',
  placeholder: 'Enter a search term, e.g. harry potter',
};

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { label: 'Title', keyword: 'title', placeholder: 'e.g. harry potter' },
  { label: 'Author', keyword: 'author', placeholder: 'e.g. J.K. Rowling' },
  { label: 'ISBN', keyword: 'isbn', placeholder: 'e.g. 9780439064873' },
];
