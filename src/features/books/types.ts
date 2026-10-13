export interface Book {
  id: string;
  title: string;
  authors: string[];
  publishedDate: string | null;
  description: string | null;
  coverUrl: string | null;
}

export interface BookDetails extends Book {
  availability: {
    status: string;
    canBorrow: boolean;
    canReserve: boolean;
    borrowedByMe: boolean;
    reservedByMe: boolean;
  };
}

export type SearchField = 'all' | 'title' | 'author' | 'subject' | 'isbn';
export interface SearchOptions {
  query: string;
  field?: SearchField;
  limit?: number;
  offset?: number;
}
