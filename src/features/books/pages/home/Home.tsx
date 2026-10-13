import { useRef, type FormEvent } from 'react';
import type { SearchField } from '@/features/books/types';
import BookCard from '@/features/books/components/book/BookCard';
import { SEARCH_CATEGORIES, ALL_FIELDS } from '@/features/books/components/search/searchCategories';
import { Button } from '@/shared/components/ui/button';
import { useBookSearch } from '@/features/books/hooks/useBookSearch';
import { useFeaturedBooks } from '@/features/books/hooks/useFeaturedBooks';
import { BOOK_GENRES } from '@/features/books/genres';
import { Search, Sparkles } from 'lucide-react';
import './Home.css';

export default function Home() {
  const results = useRef<HTMLElement>(null);
  const featured = useFeaturedBooks();
  const {
    query, field, search, books, hasMore, loading, error,
    setQuery, setField, searchBooks, loadMore, clear,
  } = useBookSearch(() => results.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) void searchBooks({ query: query.trim(), field });
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
        <div className="categories-grid">{BOOK_GENRES.map(genre => <Button key={genre.label} variant="outline" disabled={loading} className="category-card" onClick={() => void searchBooks({ query: genre.query, field: 'subject' })}>{genre.label}</Button>)}</div>
      </section>
      <section className="featured" aria-labelledby="featured-title">
        <h2 id="featured-title" className="section-title">Featured Books</h2>
        <p className="section-description">Discover a selection from across the catalog.</p>
        {featured.loading && <p role="status">Loading featured books…</p>}
        {featured.error && <div className="home-error-state" role="alert"><p>{featured.error}</p><Button variant="outline" onClick={featured.retry}>Try again</Button></div>}
        {!featured.loading && !featured.error && !featured.books.length && <p className="home-empty-state">No featured books are available right now.</p>}
        <div className="books-grid featured-books-grid" role="list">{featured.books.map(book => <div key={book.id} role="listitem"><BookCard book={book} /></div>)}</div>
      </section>
    </>}
    {search && <section ref={results} className="search-results scroll-mt-24" aria-labelledby="results-title">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 id="results-title" className="section-title break-words">Results for “{search.query}”</h2><p className="text-sm text-muted-foreground">{search.field === 'all' ? 'All fields' : SEARCH_CATEGORIES.find(option => option.keyword === search.field)?.label}</p></div>
        <Button variant="outline" disabled={loading} onClick={clear}>Clear</Button>
      </div>
      {loading && <p role="status">Loading books…</p>}
      {error && <div className="home-error-state" role="alert"><p>{error}</p><p>Your saved loans, wishlist and reservations are still available from the menu.</p></div>}
      {!loading && !error && !books.length && <p className="home-empty-state">No books found. Try a different search.</p>}
      <div className="books-grid" role="list">{books.map(book => <div key={book.id} role="listitem"><BookCard book={book} /></div>)}</div>
      {hasMore && <Button variant="outline" className="search-results-more w-full" disabled={loading} onClick={() => void loadMore()}>{loading ? 'Loading more…' : 'Load more books'}</Button>}
    </section>}
  </div>;
}
