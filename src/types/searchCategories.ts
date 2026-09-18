export type SearchCategory = {
  label: string;
  keyword: string;
  placeholder: string;
};

export const ALL_FIELDS: SearchCategory = {
  label: 'All fields',
  keyword: '',
  placeholder: 'Enter a search term, e.g. harry potter',
};

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { label: 'Title', keyword: 'intitle', placeholder: 'e.g. harry potter' },
  { label: 'Author', keyword: 'inauthor', placeholder: 'e.g. J.K. Rowling' },
  { label: 'Publisher', keyword: 'inpublisher', placeholder: 'e.g. Penguin' },
  { label: 'Subject', keyword: 'subject', placeholder: 'e.g. fantasy' },
  { label: 'ISBN', keyword: 'isbn', placeholder: 'e.g. 9780439064873' },
  { label: 'LCCN', keyword: 'lccn', placeholder: 'Library of Congress Control Number' },
  { label: 'OCLC', keyword: 'oclc', placeholder: 'Online Computer Library Center number' },
];