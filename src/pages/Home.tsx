import { useState, useEffect } from 'react';
import './Home.css'

import { fetchBooks } from '@/services/google/GoogleBooksService';
import type { GoogleBook } from '@/types/googleBooks';
import BookCard from '@/components/book/BookCard';
import SearchForm from '@/components/search/SearchForm';

const Home = () => {
  const [activeQuery, setActiveQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [books, setBooks] = useState<GoogleBook[]>([]);

  const handleSearch = (query: string) => {
    setLoading(true);
    setError('');
    setActiveQuery(query);
  }

  useEffect(() => {
    if (!activeQuery.trim()) return;
    let cancelled = false;

    fetchBooks({ query: activeQuery })
      .then((data) => {
        if (cancelled) return;
        setBooks(data.items ?? []);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        console.log('Fetch completed');
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  return (
    <div>

      <SearchForm onSearch={handleSearch} />

      {loading && <p>Loading...</p>}
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
