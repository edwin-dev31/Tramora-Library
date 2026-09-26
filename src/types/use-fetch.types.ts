export interface UseFetchResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
}
