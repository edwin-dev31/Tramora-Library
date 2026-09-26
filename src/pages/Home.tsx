import { useState } from 'react';
import './Home.css'

import type { Book, SearchOptions } from '@/types/books';
import type { Page } from '@/types/api';
import BookCard from '@/components/book/BookCard';
import SearchForm from '@/components/search/SearchForm';
import { API_ROUTES } from '@/constants/api.constants';
import { env } from '@/config/env';
import { useFetch } from '@/hooks/useFetch';

const Home = () => {
  const [url, setUrl] = useState<string | null>(null);
  const { data, error, isLoading } = useFetch<Page<Book>>(url);

  const handleSearch = (options: SearchOptions) => {
    const params = new URLSearchParams({
      query: options.query,
      field: options.field ?? 'all',
      limit: String(options.limit ?? 10),
      offset: String(options.offset ?? 0),
    });
    const baseUrl = env.API_URL.replace(/\/$/, '');
    setUrl(`${baseUrl}${API_ROUTES.BOOKS}?${params}`);
  };

  const books = data?.items ?? [];

  return (
    <div>

      <SearchForm onSearch={handleSearch} />

      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}

export default Home
