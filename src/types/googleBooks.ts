export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBook[];
}

export interface GoogleBook {
  id: string;
  volumeInfo: VolumeInfo;
  searchInfo?: SearchInfo;
}

export interface VolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: ImageLinks;
  language?: string;
  previewLink?: string;
}

export interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
}

export interface SearchInfo {
  textSnippet: string;
}