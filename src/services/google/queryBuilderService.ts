/**
 * Google Books uses `+` for spaces and encodes the rest with encodeURIComponent.
 * E.g: "harry potter" -> "harry+potter"
 */
export const encodeSearchTerm = (term: string): string =>
  term
    .trim()
    .split(/\s+/)
    .map((word) => encodeURIComponent(word))
    .join('+');

/**
 * Converts a params object to a query string.
 * E.g: { q: 'harry+potter', maxResults: 10 } -> "q=harry+potter&maxResults=10"
 */
type QueryParams = {
  [key: string]: string | number | undefined;
};

export const buildQueryString = (params: QueryParams): string =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join('&');