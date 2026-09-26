export interface ApiError {
  code: string;
  details?: string[];
}

export type ApiResponse<T> = {
  data: T;
  error: null;
  message: string;
} | {
  data: null;
  error: ApiError;
  message: string;
};

export interface Page<T> {
  items: T[];
  pagination: { total: number; offset: number; limit: number };
}
