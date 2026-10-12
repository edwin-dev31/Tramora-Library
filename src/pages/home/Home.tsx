import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Book, SearchField } from '@/types/books';
import type { Page } from '@/types/api';
import BookCard from '@/components/book/BookCard';
import { fetchJson } from '@/lib/fetch';
import { SEARCH_CATEGORIES, ALL_FIELDS } from '@/components/search/searchCategories';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import './Home.css';

const GENRES = [
  { query: 'fantasy', label: 'Fantasy' }, { query: 'science fiction', label: 'Sci-Fi' },
  { query: 'mystery', label: 'Mystery' }, { query: 'romance', label: 'Romance' },
  { query: 'history', label: 'History' }, { query: 'biography', label: 'Biography' },
];
const LIMIT = 12;

export default function Home() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [search, setSearch] = useState<{ query: string; field: SearchField } | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const results = useRef<HTMLElement>(null);
  useEffect(() => () => pending.current?.abort(), []);

  const load = async (next: { query: string; field: SearchField }, append = false) => {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    const nextOffset = append ? offset : 0;
    setLoading(true);
    setError('');
    setSearch(next);
    setQuery(next.query);
    setField(next.field);
    if (!append) { setBooks([]); setHasMore(false); }
    try {
      const params = new URLSearchParams({ query: next.query, field: next.field, limit: String(LIMIT), offset: String(nextOffset) });
      const page = await fetchJson<Page<Book>>(`/books?${params}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setBooks(previous => Array.from(new Map((append ? [...previous, ...page.items] : page.items).map(book => [book.id, book])).values()));
      setOffset(nextOffset + page.items.length);
      setHasMore(page.items.length > 0 && nextOffset + page.items.length < page.pagination.total);
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to search books.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        pending.current = null;
        if (!append) results.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) void load({ query: query.trim(), field });
  };

  return <div className="home-page">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="hero-kicker"><Sparkles className="size-4" aria-hidden="true" /> A calmer way to discover your next book</div>
        <h1 id="hero-title" className="hero-title">Your personal <span className="text-primary">library</span> awaits</h1>
        <p className="hero-description">Search books by title, author, subject, or ISBN and build your reading list.</p>
        <form onSubmit={submit} className="hero-search" role="search">
          <div className="hero-search-fields">
            <label className="sr-only" htmlFor="search-field">Search field</label>
            <select id="search-field" className="library-select hero-search-select" value={field} onChange={event => setField(event.target.value as SearchField)}>
              {[ALL_FIELDS, ...SEARCH_CATEGORIES].map(option => <option key={option.keyword} value={option.keyword}>{option.label}</option>)}
            </select>
            <label className="sr-only" htmlFor="book-query">Search books</label>
            <div className="hero-search-input-wrapper"><Search className="hero-search-icon size-4" aria-hidden="true" /><input id="book-query" type="search" className="hero-search-input" placeholder="Search books, authors, subjects..." value={query} onChange={event => setQuery(event.target.value)} required /></div>
          </div>
          <Button type="submit" className="hero-search-btn" disabled={loading}><Search className="size-4" aria-hidden="true" />{loading ? 'Searching…' : 'Search'}</Button>
        </form>
      </div>
    </section>
    {!search && <>
      <section className="categories" aria-labelledby="categories-title">
        <h2 id="categories-title" className="section-title">Browse by Genre</h2>
        <div className="categories-grid">{GENRES.map(genre => <Button key={genre.label} variant="outline" disabled={loading} className="category-card" onClick={() => void load({ query: genre.query, field: 'subject' })}>{genre.label}</Button>)}</div>
      </section>
      <section className="featured" aria-labelledby="featured-title">
        <h2 id="featured-title" className="section-title">Featured Books</h2>
        <p className="section-description">Explore fantasy picks when you are ready.</p>
        <Button variant="outline" onClick={() => void load({ query: 'fantasy', field: 'subject' })}>Load featured books</Button>
      </section>
    </>}
    {search && <section ref={results} className="search-results scroll-mt-24" aria-labelledby="results-title">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 id="results-title" className="section-title break-words">Results for “{search.query}”</h2><p className="text-sm text-muted-foreground">{search.field === 'all' ? 'All fields' : SEARCH_CATEGORIES.find(option => option.keyword === search.field)?.label}</p></div>
        <Button variant="outline" disabled={loading} onClick={() => { setSearch(null); setBooks([]); setQuery(''); setError(''); setHasMore(false); }}>Clear</Button>
      </div>
      {loading && <p role="status">Loading books…</p>}
      {error && <div className="error-state" role="alert"><p>{error}</p><p>Your saved loans, wishlist and reservations are still available from the menu.</p></div>}
      {!loading && !error && !books.length && <p className="empty-state">No books found. Try a different search.</p>}
      <div className="books-grid" role="list">{books.map(book => <div key={book.id} role="listitem"><BookCard book={book} /></div>)}</div>
      {hasMore && <Button variant="outline" className="w-full" disabled={loading} onClick={() => void load(search, true)}>{loading ? 'Loading more…' : 'Load more books'}</Button>}
    </section>}
  </div>;
}
